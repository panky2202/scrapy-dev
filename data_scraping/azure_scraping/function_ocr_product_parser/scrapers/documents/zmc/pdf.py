import re

from data_scraping.azure_scraping.common import extract_ocr_pattern, marker_parser
from data_scraping.azure_scraping.common.assert_item_in_parser_output import assert_item_in_parser_output

def find_markers(ocr):
    """For each product on an image this function returns unique (x, y), eg, a marker point
    >>> find_markers([
    ... ("1", 0.07, 0.5, 1, 1),
    ... ("ITEM", 0.05, 0.5, 13, 1),
    ... ("27", 0.06, 0.5, 13, 1),
    ... ("690203100746", 0.3, 14, 1, 1),
    ... ])
    [(0.07, 0.5), (0.06, 0.5)]
    """
    description_marker = 0.41
    thank_marker = 0.88

    return [
        (left, top)
        for text, left, top, width, height in ocr
        if left < 0.09 and text.isdigit() and thank_marker > top > description_marker
    ]


def extract_product_from_text(text):
    """Recives OCR text, extracts product. Text could contain garbage or wrong reads.
    >>> extract_product_from_text('''6043 690123019333 B/O DOG IN CAGE ( LIGHT & BARKING), 72 2.50 180.00
    ... 72PC/CTN, 38LBS/8.4CBF''')
    {'VENDORID': 38, 'VENDOR': 'ZMC', 'ITEMNO': '6043', 'DESCRIPTION': 'B/O DOG IN CAGE ( LIGHT & BARKING), 72PC/CTN, 38LBS/8.4CBF', 'COST': '2.50', 'UPC': '690123019333'}
    """

    def extract(pattern):
        return extract_ocr_pattern(pattern, text)

    item_regex = r"(.*)\s[0-9]{11,13}"
    price_regex = r"[0-9.]*\s([0-9]*\.[0-9]{2})"
    upc_regex = r"([0-9]{11,13})"
    text_with_description = re.sub(r"{}|{}|(\n)|({})".format(item_regex, price_regex, upc_regex), "", text)
    description = text_with_description.strip()

    return {
        "VENDORID": 38,
        "VENDOR": "ZMC",
        "ITEMNO": extract(item_regex),
        "DESCRIPTION": description,
        "COST": extract(price_regex),
        "UPC": extract(upc_regex)
    }


def main(pages, url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/ZMC/PDF/Inv_19091_from_ZMC_GROUP_INC._10848.pdf",
    ... VENDORID=38,
    ... VENDOR="ZMC",
    ... ITEMNO="6043",
    ... COST=2.50,
    ... DESCRIPTION="B/O DOG IN CAGE ( LIGHT & BARKING), 72PC/CTN, 38LBS/8.4CBF",
    ... UPC="690123019333"
    ... )
    """

    return marker_parser(
        pages,
        find_markers=find_markers,
        image_region=None,
        text_region=(0.05, -0.01, 0.90, 0.033),
        extract_product_from_text=extract_product_from_text,
    )
