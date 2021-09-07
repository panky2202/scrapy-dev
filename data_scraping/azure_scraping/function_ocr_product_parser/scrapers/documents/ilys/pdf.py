import re

from data_scraping.azure_scraping.common import marker_parser
from data_scraping.azure_scraping.common.assert_item_in_parser_output import assert_item_in_parser_output


def find_markers(ocr):
    """For each product on an image this function returns unique (x, y), eg, a marker point
    >>> find_markers([
    ... ('hello', 1, 1, 1, 1),
    ... ('819350021159', -0.001, -0.001, 13, 1),
    ... ('8193349', -0.001, -0.001, 13, 1),
    ... ('something', 1, 1, 1, 1),
    ... ])
    [(-0.001, -0.001), (-0.001, -0.001)]
    """

    return [
        (left, top)
        for text, left, top, width, height in ocr
        if re.search(r"\d{6,20}", text)
    ]


def extract_product_from_text(text):
    """Recives OCR text, extracts product. Text could contain garbage or wrong reads.
    >>> extract_product_from_text('   IP5074/$14.50    819350021159   ')
    {'VENDORID': 1201, 'VENDOR': 'ILYS', 'ITEMNO': 'IP5074', 'UPC': '819350021159'}
    """
    _text = text.replace('\n', '')

    return {
        "VENDORID": 1201,
        "VENDOR": "ILYS",
        "ITEMNO": re.search(r'^\s*(\w+)/', _text, re.M).group(1),
        "UPC": re.search(r'(\d{6,20})', _text, re.M).group(1),
    }


def main(pages, url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/ILYS/PDF/11615.pdf",
    ... VENDORID=1201,
    ... VENDOR="ILYS",
    ... ITEMNO="IB7195",
    ... UPC="819350025331",
    ... )

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/ILYS/PDF/11615.pdf",
    ... VENDORID=1201,
    ... VENDOR="ILYS",
    ... ITEMNO="IB7191D",
    ... UPC="819350025225",
    ... )
    """
    return marker_parser(
        pages,
        find_markers=find_markers,
        image_region=(-0.25, -0.03, 0.1, 0.072),
        text_region=(-0.14, -0.015, 0.22, 0.04),
        extract_product_from_text=extract_product_from_text,
    )
