#!/usr/bin/env python3
"""Static-file server for Treasure Galați + minimal API for in-app pin authoring.

Endpoints:
  GET   /...                   — static files (same as `python3 -m http.server`)
  POST  /api/add-location      — multipart form: image + JSON metadata.
                                 Saves image to assets/images/local/, appends
                                 new pin to galati_map/locations.json, returns
                                 the created entry.

Run:
    python3 scripts/serve.py [port]   # default port 8000

The server serves the *project root* (so URLs map: /galati_map/index.html
remains the entry point and assets paths in locations.json keep working).
"""
from __future__ import annotations

import io
import json
import os
import re
import sys
import unicodedata
import uuid
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


def parse_multipart(body: bytes, boundary: bytes) -> dict[str, list[dict]]:
    """Minimal multipart/form-data parser (Python 3.13+ removed `cgi`).

    Returns ``{field_name: [{"data": bytes, "filename": str | None}, ...]}``.
    Multiple parts with the same field name (e.g. multi-file upload) are
    preserved in source order. Boundary handling follows RFC 2046 §5.1.1.
    """
    sep = b"--" + boundary
    parts = body.split(sep)
    fields: dict[str, list[dict]] = {}
    for raw in parts:
        if not raw or raw in (b"--", b"\r\n--", b"--\r\n"):
            continue
        chunk = raw.lstrip(b"\r\n")
        if chunk.endswith(b"\r\n"):
            chunk = chunk[:-2]
        head_end = chunk.find(b"\r\n\r\n")
        if head_end < 0:
            continue
        header_blob = chunk[:head_end].decode("utf-8", errors="replace")
        data = chunk[head_end + 4:]
        if data.endswith(b"\r\n"):
            data = data[:-2]
        disp = ""
        for line in header_blob.split("\r\n"):
            if line.lower().startswith("content-disposition:"):
                disp = line.split(":", 1)[1].strip()
                break
        if not disp:
            continue
        name_m = re.search(r'name="([^"]*)"', disp)
        if not name_m:
            continue
        name = name_m.group(1)
        fname_m = re.search(r'filename="([^"]*)"', disp)
        filename = fname_m.group(1) if fname_m else None
        fields.setdefault(name, []).append({"data": data, "filename": filename})
    return fields


def first_field(fields: dict[str, list[dict]], name: str) -> dict | None:
    parts = fields.get(name)
    return parts[0] if parts else None

ROOT = Path(__file__).resolve().parent.parent
LOCATIONS = ROOT / "galati_map" / "locations.json"
PUBCRAWL = ROOT / "galati_map" / "pubcrawl_photos.json"
LOCAL_IMG_DIR = ROOT / "assets" / "images" / "local"
LOCAL_IMG_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMG_EXT = {"jpg", "jpeg", "png", "webp", "gif"}


def slugify(text: str) -> str:
    nfkd = unicodedata.normalize("NFKD", text or "")
    ascii_str = "".join(ch for ch in nfkd if not unicodedata.combining(ch))
    s = re.sub(r"[^A-Za-z0-9]+", "-", ascii_str).strip("-").lower()
    return s[:60] or "pin"


def next_loc_id(data: list[dict]) -> str:
    max_n = 0
    for e in data:
        m = re.match(r"^loc-(\d+)$", str(e.get("id", "")))
        if m:
            max_n = max(max_n, int(m.group(1)))
    return f"loc-{max_n + 1}"


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        # Quieter logs (skip 200s on static), but keep errors.
        if args and args[1].startswith("2"):
            return
        super().log_message(fmt, *args)

    def end_headers(self):
        # Disable cache so the in-app client always sees the freshly written
        # locations.json after a successful upload.
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_POST(self):  # noqa: N802 (stdlib API)
        if self.path == "/api/add-location":
            return self._handle_add_location()
        if self.path == "/api/update-location":
            return self._handle_update_location()
        if self.path == "/api/delete-location":
            return self._handle_delete_location()
        if self.path == "/api/add-photo":
            return self._handle_add_photo()
        if self.path == "/api/update-photo":
            return self._handle_update_photo()
        if self.path == "/api/delete-photo":
            return self._handle_delete_photo()
        self.send_error(HTTPStatus.NOT_FOUND, "No such endpoint")

    def _send_json(self, status: HTTPStatus, payload: dict):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _handle_add_location(self) -> None:
        ctype = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in ctype:
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "expected multipart/form-data"})
        m = re.search(r"boundary=([^;]+)", ctype)
        if not m:
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "missing multipart boundary"})
        boundary = m.group(1).strip().strip('"').encode("ascii")
        try:
            length = int(self.headers.get("Content-Length") or "0")
        except ValueError:
            length = 0
        if length <= 0 or length > 50 * 1024 * 1024:
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "invalid or too-large content length"})
        body = self.rfile.read(length)
        try:
            fields = parse_multipart(body, boundary)
        except Exception as exc:
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": f"parse error: {exc}"})

        def text(key: str) -> str:
            f = first_field(fields, key)
            if not f:
                return ""
            return f["data"].decode("utf-8", errors="replace").strip()

        title = text("title")
        if not title:
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "title is required"})

        try:
            lat = float(text("lat"))
            lon = float(text("lon"))
        except (TypeError, ValueError):
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "lat/lon must be numbers"})
        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "lat/lon out of range"})

        location_text = text("location")
        category = text("category") or "Alte locuri"
        excerpt = text("excerpt")
        description = text("description")
        credit = text("credit")
        # Optional historical fields used by the timeline filter
        status = text("status") or "active"
        if status not in ("active", "demolished", "lost", "ruin"):
            status = "active"
        year_built_text = text("year_built")
        year_demolished_text = text("year_demolished")
        try:
            year_built = int(year_built_text) if year_built_text else None
            year_demolished = int(year_demolished_text) if year_demolished_text else None
        except ValueError:
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "year_built/year_demolished must be integers"})
        for y in (year_built, year_demolished):
            if y is not None and not (100 <= y <= 2100):
                return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "year out of plausible range"})

        # Optional image
        image_field = first_field(fields, "image")
        rel_image_path = ""
        if image_field is not None and image_field.get("filename"):
            ext = (image_field["filename"].rsplit(".", 1)[-1] or "").lower()
            if ext not in ALLOWED_IMG_EXT:
                return self._send_json(HTTPStatus.BAD_REQUEST, {"error": f"unsupported image type: {ext}"})
            slug = slugify(title)
            uniq = uuid.uuid4().hex[:8]
            filename = f"{slug}-{uniq}.{ext}"
            dest = LOCAL_IMG_DIR / filename
            data = image_field["data"]
            if len(data) == 0:
                return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "uploaded image is empty"})
            if len(data) > 25 * 1024 * 1024:
                return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "image larger than 25MB"})
            dest.write_bytes(data)
            # locations.json paths are written relative to galati_map/, so
            # they need to walk up one level: ``../assets/images/local/<file>``.
            rel_image_path = f"../assets/images/local/{filename}"

        # Append to locations.json
        try:
            with LOCATIONS.open("r", encoding="utf-8") as fp:
                locations = json.load(fp)
        except Exception as exc:
            return self._send_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": f"locations.json unreadable: {exc}"})
        new_id = next_loc_id(locations)
        entry = {
            "id": new_id,
            "title": title,
            "location": location_text,
            "lat": lat,
            "lon": lon,
            "geocoded_as": "Adăugat din interfață",
            "category": category,
            "excerpt": excerpt,
            "description": description,
            "status": status,
            "year_built": year_built,
            "year_demolished": year_demolished,
        }
        if rel_image_path:
            entry["image"] = rel_image_path
            entry["gallery"] = [{"src": rel_image_path, "alt": title}]
            if credit:
                entry["local_credit"] = credit
        # Extra gallery images (multi-file upload, optional, with per-image captions).
        gallery_files = fields.get("gallery_images", [])
        gallery_caps = fields.get("gallery_images_caption", [])
        for i, gf in enumerate(gallery_files):
            if not gf.get("filename"):
                continue
            saved = self._save_uploaded_image(gf, title)
            if saved is None:
                return
            cap_part = gallery_caps[i] if i < len(gallery_caps) else None
            cap = cap_part["data"].decode("utf-8", errors="replace").strip() if cap_part else ""
            entry.setdefault("gallery", [])
            entry["gallery"].append({"src": saved[0], "alt": cap or title})
            if not entry.get("image"):
                entry["image"] = saved[0]
        locations.append(entry)
        # Write atomically
        tmp = LOCATIONS.with_suffix(".json.tmp")
        with tmp.open("w", encoding="utf-8") as fp:
            json.dump(locations, fp, ensure_ascii=False, indent=2)
        tmp.replace(LOCATIONS)

        return self._send_json(HTTPStatus.OK, {"ok": True, "entry": entry})

    def _handle_add_photo(self) -> None:
        ctype = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in ctype:
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "expected multipart/form-data"})
        m = re.search(r"boundary=([^;]+)", ctype)
        if not m:
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "missing multipart boundary"})
        boundary = m.group(1).strip().strip('"').encode("ascii")
        try:
            length = int(self.headers.get("Content-Length") or "0")
        except ValueError:
            length = 0
        if length <= 0 or length > 50 * 1024 * 1024:
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "invalid or too-large content length"})
        body = self.rfile.read(length)
        try:
            fields = parse_multipart(body, boundary)
        except Exception as exc:
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": f"parse error: {exc}"})

        def text(key: str) -> str:
            f = first_field(fields, key)
            if not f:
                return ""
            return f["data"].decode("utf-8", errors="replace").strip()

        try:
            lat = float(text("lat"))
            lon = float(text("lon"))
        except (TypeError, ValueError):
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "lat/lon must be numbers"})
        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "lat/lon out of range"})

        caption = text("caption")
        folder = text("folder") or "local"
        year_text = text("year")
        year_val: int | None = None
        if year_text:
            try:
                year_val = int(year_text)
                if not (1500 <= year_val <= 2100):
                    return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "year out of plausible range"})
            except ValueError:
                return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "year must be integer"})

        image_field = first_field(fields, "image")
        if not image_field or not image_field.get("filename"):
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "image is required for a photo pin"})
        ext = (image_field["filename"].rsplit(".", 1)[-1] or "").lower()
        if ext not in ALLOWED_IMG_EXT:
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": f"unsupported image type: {ext}"})
        slug = slugify(caption or "foto")
        uniq = uuid.uuid4().hex[:8]
        filename = f"{slug}-{uniq}.{ext}"
        dest = LOCAL_IMG_DIR / filename
        data = image_field["data"]
        if len(data) == 0:
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "uploaded image is empty"})
        if len(data) > 25 * 1024 * 1024:
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "image larger than 25MB"})
        dest.write_bytes(data)
        rel_image_path = f"../assets/images/local/{filename}"

        try:
            with PUBCRAWL.open("r", encoding="utf-8") as fp:
                photos = json.load(fp)
        except Exception as exc:
            return self._send_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": f"pubcrawl_photos.json unreadable: {exc}"})
        photo = {
            "src": rel_image_path,
            "caption_ro": caption,
            "caption_en": "",
            "folder": folder,
            "lat": lat,
            "lon": lon,
            "year": year_val,
        }
        photos.append(photo)
        tmp = PUBCRAWL.with_suffix(".json.tmp")
        with tmp.open("w", encoding="utf-8") as fp:
            json.dump(photos, fp, ensure_ascii=False, indent=2)
        tmp.replace(PUBCRAWL)
        return self._send_json(HTTPStatus.OK, {"ok": True, "photo": photo})

    # ─── Shared helpers ────────────────────────────────────────────
    def _read_multipart(self):
        ctype = self.headers.get("Content-Type", "")
        if "multipart/form-data" not in ctype:
            self._send_json(HTTPStatus.BAD_REQUEST, {"error": "expected multipart/form-data"})
            return None
        m = re.search(r"boundary=([^;]+)", ctype)
        if not m:
            self._send_json(HTTPStatus.BAD_REQUEST, {"error": "missing multipart boundary"})
            return None
        boundary = m.group(1).strip().strip('"').encode("ascii")
        try:
            length = int(self.headers.get("Content-Length") or "0")
        except ValueError:
            length = 0
        if length <= 0 or length > 50 * 1024 * 1024:
            self._send_json(HTTPStatus.BAD_REQUEST, {"error": "invalid or too-large content length"})
            return None
        body = self.rfile.read(length)
        try:
            return parse_multipart(body, boundary)
        except Exception as exc:
            self._send_json(HTTPStatus.BAD_REQUEST, {"error": f"parse error: {exc}"})
            return None

    def _save_uploaded_image(self, image_field, slug_seed: str) -> tuple[str, str] | None:
        """Returns (rel_path_for_json, abs_filename) or sends an error and returns None."""
        ext = (image_field["filename"].rsplit(".", 1)[-1] or "").lower()
        if ext not in ALLOWED_IMG_EXT:
            self._send_json(HTTPStatus.BAD_REQUEST, {"error": f"unsupported image type: {ext}"})
            return None
        slug = slugify(slug_seed)
        uniq = uuid.uuid4().hex[:8]
        filename = f"{slug}-{uniq}.{ext}"
        dest = LOCAL_IMG_DIR / filename
        data = image_field["data"]
        if len(data) == 0:
            self._send_json(HTTPStatus.BAD_REQUEST, {"error": "uploaded image is empty"})
            return None
        if len(data) > 25 * 1024 * 1024:
            self._send_json(HTTPStatus.BAD_REQUEST, {"error": "image larger than 25MB"})
            return None
        dest.write_bytes(data)
        return (f"../assets/images/local/{filename}", str(dest))

    def _read_json(self, path: Path):
        try:
            with path.open("r", encoding="utf-8") as fp:
                return json.load(fp)
        except Exception as exc:
            self._send_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": f"{path.name} unreadable: {exc}"})
            return None

    def _atomic_write_json(self, path: Path, data) -> None:
        tmp = path.with_suffix(path.suffix + ".tmp")
        with tmp.open("w", encoding="utf-8") as fp:
            json.dump(data, fp, ensure_ascii=False, indent=2)
        tmp.replace(path)

    # ─── Edit / delete: locations ──────────────────────────────────
    def _handle_update_location(self) -> None:
        fields = self._read_multipart()
        if fields is None:
            return

        def text(key: str) -> str:
            f = first_field(fields, key)
            return (f["data"].decode("utf-8", errors="replace").strip() if f else "")

        loc_id = text("id")
        if not loc_id:
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "id is required"})
        title = text("title")
        if not title:
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "title is required"})
        try:
            lat = float(text("lat"))
            lon = float(text("lon"))
        except (TypeError, ValueError):
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "lat/lon must be numbers"})
        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "lat/lon out of range"})

        locations = self._read_json(LOCATIONS)
        if locations is None:
            return
        idx = next((i for i, e in enumerate(locations) if str(e.get("id", "")) == loc_id), -1)
        if idx < 0:
            return self._send_json(HTTPStatus.NOT_FOUND, {"error": f"id {loc_id} not found"})

        existing = locations[idx]
        existing["title"] = title
        existing["location"] = text("location")
        existing["category"] = text("category") or "Alte locuri"
        existing["excerpt"] = text("excerpt")
        existing["description"] = text("description")
        existing["lat"] = lat
        existing["lon"] = lon
        credit = text("credit")
        if credit:
            existing["local_credit"] = credit
        # Status + years (timeline filter)
        status = text("status") or "active"
        if status not in ("active", "demolished", "lost", "ruin"):
            status = "active"
        year_built_text = text("year_built")
        year_demolished_text = text("year_demolished")
        try:
            year_built = int(year_built_text) if year_built_text else None
            year_demolished = int(year_demolished_text) if year_demolished_text else None
        except ValueError:
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "year_built/year_demolished must be integers"})
        for y in (year_built, year_demolished):
            if y is not None and not (100 <= y <= 2100):
                return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "year out of plausible range"})
        existing["status"] = status
        existing["year_built"] = year_built
        existing["year_demolished"] = year_demolished

        # Honour explicit "keep" list when present: filter existing gallery to
        # only entries the client opted to keep, in client-supplied order, and
        # apply per-item captions from `gallery_keep_caption` (matching order).
        keep_parts = fields.get("gallery_keep", [])
        keep_caps = fields.get("gallery_keep_caption", [])
        if keep_parts:
            cur_by_src = {g.get("src"): dict(g) for g in (existing.get("gallery") or [])}
            new_gallery = []
            keep_set = set()
            for i, kp in enumerate(keep_parts):
                src = kp.get("data", b"").decode("utf-8", errors="replace").strip()
                if not src or src not in cur_by_src:
                    continue
                cap_part = keep_caps[i] if i < len(keep_caps) else None
                cap = cap_part["data"].decode("utf-8", errors="replace").strip() if cap_part else ""
                g = cur_by_src[src]
                if cap:
                    g["alt"] = cap
                new_gallery.append(g)
                keep_set.add(src)
            existing["gallery"] = new_gallery
            # If the current featured image was removed from gallery and there
            # are still entries left, demote the featured to the first kept.
            if existing.get("image") and existing["image"] not in keep_set:
                existing["image"] = (existing["gallery"][0]["src"] if existing["gallery"] else "")

        # Featured image: replace only if a new file was uploaded
        image_field = first_field(fields, "image")
        if image_field and image_field.get("filename"):
            saved = self._save_uploaded_image(image_field, title)
            if saved is None:
                return
            rel, _abs = saved
            existing["image"] = rel
            # Add the new featured to gallery (don't wipe gallery — append).
            existing.setdefault("gallery", [])
            if not any(g.get("src") == rel for g in existing["gallery"]):
                existing["gallery"].insert(0, {"src": rel, "alt": title})

        # Append additional gallery images (multi-file upload, with captions)
        gallery_files = fields.get("gallery_images", [])
        gallery_caps = fields.get("gallery_images_caption", [])
        for i, gf in enumerate(gallery_files):
            if not gf.get("filename"):
                continue
            saved = self._save_uploaded_image(gf, title)
            if saved is None:
                return
            cap_part = gallery_caps[i] if i < len(gallery_caps) else None
            cap = cap_part["data"].decode("utf-8", errors="replace").strip() if cap_part else ""
            existing.setdefault("gallery", [])
            existing["gallery"].append({"src": saved[0], "alt": cap or title})
            if not existing.get("image"):
                existing["image"] = saved[0]

        self._atomic_write_json(LOCATIONS, locations)
        return self._send_json(HTTPStatus.OK, {"ok": True, "entry": existing})

    def _handle_delete_location(self) -> None:
        fields = self._read_multipart()
        if fields is None:
            return
        id_field = first_field(fields, "id")
        loc_id = (id_field["data"].decode("utf-8") if id_field else "").strip()
        if not loc_id:
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "id is required"})
        locations = self._read_json(LOCATIONS)
        if locations is None:
            return
        before = len(locations)
        locations = [e for e in locations if str(e.get("id", "")) != loc_id]
        if len(locations) == before:
            return self._send_json(HTTPStatus.NOT_FOUND, {"error": f"id {loc_id} not found"})
        self._atomic_write_json(LOCATIONS, locations)
        return self._send_json(HTTPStatus.OK, {"ok": True, "id": loc_id})

    # ─── Edit / delete: pubcrawl photos ────────────────────────────
    def _handle_update_photo(self) -> None:
        fields = self._read_multipart()
        if fields is None:
            return

        def text(key: str) -> str:
            f = first_field(fields, key)
            return (f["data"].decode("utf-8", errors="replace").strip() if f else "")

        src = text("src")
        if not src:
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "src is required"})

        try:
            lat = float(text("lat"))
            lon = float(text("lon"))
        except (TypeError, ValueError):
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "lat/lon must be numbers"})
        if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "lat/lon out of range"})

        caption = text("caption")
        folder = text("folder") or "local"
        year_text = text("year")
        year_val: int | None = None
        if year_text:
            try:
                year_val = int(year_text)
                if not (1500 <= year_val <= 2100):
                    return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "year out of plausible range"})
            except ValueError:
                return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "year must be integer"})

        photos = self._read_json(PUBCRAWL)
        if photos is None:
            return
        idx = next((i for i, p in enumerate(photos) if p.get("src") == src), -1)
        if idx < 0:
            return self._send_json(HTTPStatus.NOT_FOUND, {"error": f"photo with src {src} not found"})

        photo = photos[idx]
        photo["caption_ro"] = caption
        photo["folder"] = folder
        photo["lat"] = lat
        photo["lon"] = lon
        photo["year"] = year_val

        # Replace image if new upload provided
        image_field = first_field(fields, "image")
        if image_field and image_field.get("filename"):
            saved = self._save_uploaded_image(image_field, caption or "foto")
            if saved is None:
                return
            rel, _abs = saved
            photo["src"] = rel

        self._atomic_write_json(PUBCRAWL, photos)
        return self._send_json(HTTPStatus.OK, {"ok": True, "photo": photo})

    def _handle_delete_photo(self) -> None:
        fields = self._read_multipart()
        if fields is None:
            return
        src_field = first_field(fields, "src")
        src = (src_field["data"].decode("utf-8") if src_field else "").strip()
        if not src:
            return self._send_json(HTTPStatus.BAD_REQUEST, {"error": "src is required"})
        photos = self._read_json(PUBCRAWL)
        if photos is None:
            return
        before = len(photos)
        photos = [p for p in photos if p.get("src") != src]
        if len(photos) == before:
            return self._send_json(HTTPStatus.NOT_FOUND, {"error": f"photo with src {src} not found"})
        self._atomic_write_json(PUBCRAWL, photos)
        return self._send_json(HTTPStatus.OK, {"ok": True, "src": src})


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    os.chdir(ROOT)  # serve from project root
    addr = ("", port)
    srv = ThreadingHTTPServer(addr, Handler)
    print(f"Treasure Galați dev server: http://localhost:{port}/galati_map/index.html")
    print(f"  POST /api/add-location → {LOCAL_IMG_DIR.relative_to(ROOT)}/ + {LOCATIONS.relative_to(ROOT)}")
    print(f"  POST /api/add-photo    → {LOCAL_IMG_DIR.relative_to(ROOT)}/ + {PUBCRAWL.relative_to(ROOT)}")
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
