import re

from data_scraping.azure_scraping.common import extract_ocr_pattern
from data_scraping.azure_scraping.common import marker_parser
from data_scraping.azure_scraping.common.assert_item_in_parser_output import assert_item_in_parser_output


def find_markers(ocr):
    """For each product on an image this function returns unique (x, y), eg, a marker point
    >>> find_markers([
    ... ("1", 0.07, 0.5, 1, 1),
    ... ("$0.50", 0.05, 0.5, 13, 1),
    ... ("27", 0.06, 0.5, 13, 1),
    ... ("690203100746", 0.3, 14, 1, 1),
    ... ])
    [(0.05, 0.5)]
    """
    return [
        (left, top)
        for text, left, top, width, height in ocr
        if (re.match(r"\$(\d+(\.\d*)?)*", text))
    ]


def extract_product_from_text(text):
    """Recives OCR text, extracts product. Text could contain garbage or wrong reads.
    >>> extract_product_from_text('''
    ... SS-FBG
    ... Freezer Bag Slider Gallon Size 8 Count
    ... - - -
    ... 24/cs
    ... $0.59 ''')
    {'VENDORID': 21, 'VENDOR': 'MKK', 'ITEMNO': 'SS-FBG', 'DESCRIPTION': 'Freezer Bag Slider Gallon Size 8 Count'}
    """

    def extract(pattern):
        return extract_ocr_pattern(pattern, text)

    return {
        "VENDORID": 21,
        "VENDOR": "MKK",
        "ITEMNO": extract(r"(([A-Za-z0-9]+-?[A-Za-z0-9]*))"),
        "DESCRIPTION": extract(r"[A-Za-z0-9]+-?[A-Za-z0-9]*([A-Za-z0-9\s]*)"),
    }


def main(pages, url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/MMK/GM%20Ordered%20Items.pdf",
    ... VENDORID=21,
    ... VENDOR="MKK",
    ... ITEMNO="SS-FBG",
    ... DESCRIPTION="Freezer Bag Slider Gallon Size 8 Count"
    ... )
    """
    for page_image, ocr in pages:
        markers = find_markers(ocr)
        if markers and has_six_pages_layout(markers):
            yield from process_six_products_layout_page(ocr, page_image)
        elif markers:
            yield from process_nine_products_layout_page(ocr, page_image)
    return

def has_six_pages_layout(markers):
    """
    >>> has_six_pages_layout([(0.066, 0.41), (0.508, 0.455), (0.066, 0.91), (0.508, 0.91)])
    True
    """
    return 0.4 < markers[0][1] < 0.5

def process_nine_products_layout_page(ocr, page_image):
    """ (page_image, page_ocr) ->  [(product_image, product), ...] """
    yield from marker_parser(
        [(page_image, ocr)],
        find_markers=find_markers,
        image_region=(0.0, -0.22, 0.255, 0.14),
        text_region=(0.0, -0.075, 0.255, 0.1),
        extract_product_from_text=extract_product_from_text,
    )


def process_six_products_layout_page(ocr, page_image):
    """ (page_image, page_ocr) ->  [(product_image, product), ...] """
    yield from marker_parser(
        [(page_image, ocr)],
        find_markers=find_markers,
        image_region=(0.0, -0.34, 0.255, 0.26),
        text_region=(0.0, -0.075, 0.255, 0.1),
        extract_product_from_text=extract_product_from_text,
    )
