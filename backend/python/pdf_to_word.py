import sys
from pdf2docx import Converter


def convert_pdf_to_word(pdf_path, docx_path):

    print("PDF:", pdf_path)
    print("DOCX:", docx_path)

    converter = Converter(pdf_path)

    try:
        converter.convert(docx_path)
        print("CONVERSION_SUCCESS")

    finally:
        converter.close()


if __name__ == "__main__":

    if len(sys.argv) != 3:

        print(
            "Usage: python pdf_to_word.py input.pdf output.docx"
        )

        sys.exit(1)

    pdf_path = sys.argv[1]
    docx_path = sys.argv[2]

    try:

        convert_pdf_to_word(
            pdf_path,
            docx_path
        )

    except Exception as error:

        print(
            "CONVERSION_ERROR:",
            str(error)
        )

        sys.exit(1)