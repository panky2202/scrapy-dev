import re

from data_scraping.azure_scraping.common import extract_ocr_pattern, marker_parser
from data_scraping.azure_scraping.common.assert_item_in_parser_output import assert_item_in_parser_output


def find_markers(ocr):
    """For each product on an image this function returns unique (x, y), eg, a marker point
    >>> find_markers([
    ... ("hello", 1, 1, 1, 1),
    ... ("ITEM", 12, 1, 13, 1),
    ... ("Item", 12, 1, 13, 1),
    ... ("Item", 1, 1, 1, 1),
    ... ])
    [(12, 1), (1, 1)]
    """

    return [
        (left, top)
        for text, left, top, width, height in ocr
        if re.match(r"(Item)", text)
    ]


def extract_product_from_text(text):
    """Recives OCR text, extracts product. Text could contain garbage or wrong reads.
    >>> extract_product_from_text('''Item: KA25420
    ... 25" VINYL GIRL BRIELLE (12PCS/CTN)
    ... -
    ... VB25
    ... Color:
    ... Size:
    ... Packing: 12 Unit/Case Unit:PCS
    ... Case Weight: 27.00 lb
    ... Retail: $20.00 Corp.:
    ... ''')
    {'VENDORID': 1101, 'VENDOR': 'kinnex', 'ITEMNO': 'KA25420', 'DESCRIPTION': '25" VINYL GIRL BRIELLE (12PCS/CTN) -', 'COST': '20.00'}
    """

    def extract(pattern):
        return extract_ocr_pattern(pattern, text)
    product_data = text.split("\n")
    return {
        "VENDORID": 1101,
        "VENDOR": "kinnex",
        "ITEMNO": extract(r"Item:(.*?)\n"),
        "DESCRIPTION": " ".join(product_data[1:3]),
        "COST": extract(r"Retail: \$(.*?)Corp"),
    }


def main(pages, url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/KINNEX/PDF/JOB_CWDEFAULT.pdf",
    ... VENDORID=1101,
    ... VENDOR="kinnex",
    ... ITEMNO="KA25420",
    ... COST=20.0,
    ... UPC="0650781025626",
    ... DESCRIPTION="25\\" VINYL GIRL BRIELLE (12PCS/CTN) -",
    ... )
    """

    return marker_parser(
        pages,
        find_markers=find_markers,
        image_region=(-0.165, -0.001, 0.095, 0.085),
        text_region=(-0.003, -0.01, 0.3, 0.14),
        extract_product_from_text=extract_product_from_text,
        barcode_region=(-0.15, 0.085, 0.095, 0.05),
    )
