import os
from pypdf import PdfReader

pdf_files = [f for f in os.listdir('.') if f.endswith('.pdf')]
for pdf in pdf_files:
    try:
        reader = PdfReader(pdf)
        text = ""
        for i, page in enumerate(reader.pages):
            text += page.extract_text() + "\n"
        out_name = pdf + ".txt"
        with open(out_name, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"Extracted {pdf} to {out_name}")
    except Exception as e:
        print(f"Error extracting {pdf}: {e}")
