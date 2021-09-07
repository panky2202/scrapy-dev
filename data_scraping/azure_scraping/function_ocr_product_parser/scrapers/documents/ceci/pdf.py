import re

from data_scraping.azure_scraping.common import extract_ocr_pattern, marker_parser
from data_scraping.azure_scraping.common.assert_item_in_parser_output import assert_item_in_parser_output


def find_markers(ocr):
    """For each product on an image this function returns unique (x, y), eg, a marker point
    >>> find_markers([
    ... ("hello", 1, 1, 1, 1),
    ... ("ITEM", 12, 1, 13, 1),
    ... ("50/PC", 12, 1, 13, 1),
    ... ("$3.00/PC", 1, 1, 1, 1),
    ... ])
    [(12, 1), (1, 1)]
    """

    return [
        (left, top)
        for text, left, top, width, height in ocr
        if re.match(r".*(/PC).*", text)
    ]


def extract_product_from_text(text):
    """Recives OCR text, extracts product. Text could contain garbage or wrong reads.
    >>> extract_product_from_text('''BAG3343BAQ $8.50/PC
    ... AQ STONE EVENING BAG
    ... Qty On-Hand: 47 Qty IT: 0'
    ... ''')
    {'VENDORID': 1050, 'VENDOR': 'CECI', 'ITEMNO': 'BAG3343BAQ', 'DESCRIPTION': 'AQ STONE EVENING BAG', 'COST': '8.50'}
    """

    def extract(pattern):
        return extract_ocr_pattern(pattern, text)
    product_data = text.split("\n")
    return {
        "VENDORID": 1050,
        "VENDOR": "CECI",
        "ITEMNO": extract(r"(.*)(\$)"),
        "DESCRIPTION": product_data[1],
        "COST": extract(r"\$(.*?)/PC"),
    }


def main(pages, url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/CECI/PDF/YW11A_fast.pdf",
    ... VENDORID=1050,
    ... VENDOR="CECI",
    ... ITEMNO="BAG3343BAQ",
    ... COST=8.5,
    ... DESCRIPTION="AQ STONE EVENING BAG",
    ... )
    """

    return marker_parser(
        pages,
        find_markers=find_markers,
        image_region=(-0.22, -0.14, 0.3, 0.14),
        text_region=(-0.22, -0.001, 0.3, 0.08),
        extract_product_from_text=extract_product_from_text,
        barcode_region=(-0.15, 0.085, 0.095, 0.05),
    )
