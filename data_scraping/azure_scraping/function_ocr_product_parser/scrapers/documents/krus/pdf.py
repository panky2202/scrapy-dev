import re

from data_scraping.azure_scraping.common import extract_ocr_pattern, marker_parser
from data_scraping.azure_scraping.common.assert_item_in_parser_output import assert_item_in_parser_output


def find_markers(ocr):
    """For each product on an image this function returns unique (x, y), eg, a marker point
    >>> find_markers([
    ... ("12345", 0.086, 13, 1, 1),
    ... ("ITEM", 0.086, 1, 13, 1),
    ... ("1", 1, 1, 13, 1),
    ... ("33333", 0.091, 14, 1, 1),
    ... ])
    [(0.086, 13), (0.091, 14)]
    """
    return [
        (left, top)
        for text, left, top, width, height in ocr
        if 0.085 < left < 0.096 and re.match(r"[0-9]{5,6}", text)
    ]


def extract_product_from_text(text):
    """Recives OCR text, extracts product. Text could contain garbage or wrong reads.
    >>> extract_product_from_text('''30001 T.COVER: 54" X 108" RECTANGULAR: WHITE 192 $0.44 6099189316020''')
    {'VENDORID': 1110, 'VENDOR': 'KRUS', 'ITEMNO': '30001', 'DESCRIPTION': 'T.COVER: 54" X 108" RECTANGULAR: WHITE', 'COST': '0.44', 'UPC': '6099189316020'}
    """

    def extract(pattern):
        return extract_ocr_pattern(pattern, text)

    item_no = extract(r"([0-9]{5,6})")
    price = extract(r"\$([0-9.]+)")
    upc = extract(r"([0-9]{13})")
    text_without_prices_item_no_and_upc = re.sub(r"(\$[0-9.]+)|([0-9]+([^\S]|$))|(\n)", "", text)
    description = text_without_prices_item_no_and_upc.strip()

    return {
        "VENDORID": 1110,
        "VENDOR": "KRUS",
        "ITEMNO": item_no,
        "DESCRIPTION": description,
        "COST": price,
        "UPC": upc
    }


def main(pages, url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/KRUS/PDF/example1.pdf",
    ... VENDORID=1110,
    ... VENDOR="KRUS",
    ... ITEMNO="30001",
    ... COST=0.44,
    ... DESCRIPTION="T.COVER: 54\\" X 108\\" RECTANGULAR: WHITE",
    ... UPC="6099189316020"
    ... )
    """

    return marker_parser(
        pages,
        find_markers=find_markers,
        image_region=(0.35, -0.023, 0.07, 0.058),
        text_region=(-0.01, -0.01, 0.9, 0.03),
        extract_product_from_text=extract_product_from_text,
    )
