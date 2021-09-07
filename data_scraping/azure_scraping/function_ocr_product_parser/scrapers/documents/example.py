import re

from data_scraping.azure_scraping.common import extract_ocr_pattern, marker_parser, assert_item_in_parser_output
from data_scraping.azure_scraping.common.assert_item_in_parser_output import assert_item_in_parser_output


def find_markers(ocr):
    """For each product on an image this function returns unique (x, y), eg, a marker point
    >>> find_markers([
    ... ('hello', 1, 1, 1, 1),
    ... ('ITEM', 12, 1, 13, 1),
    ... ('ITEM', 12, 1, 13, 1),
    ... ('item', 1, 1, 1, 1),
    ... ])
    [(12, 1), (12, 1)]
    """

    return [
        (left, top)
        for text, left, top, width, height in ocr
        if re.match(r'(ITEM)', text)
    ]


def extract_product_from_text(text):
    """Recives OCR text, extracts product. Text could contain garbage or wrong reads.

    >>> extract_product_from_text('''
    ...   d   J
    ... ITEM ID: 54093 DESC.: 10PC FOAM BRUSH SET
    ... BROCHA DE ESPEONJA 10PC
    ... UPC NO: 874619-54093-2 WEIGHT: 6.60 LB QTY: 1CS U.PRICE: 0.65
    ... #ICS: 48 PC VOLUME: 1.99 CF T.UNITS: 48 AMOUNT: 31.20
    ... ORIGIN: CHINA
    ... fd
    ... ''')
    {'VENDORID': 1, 'VENDOR': 'example', 'ITEMNO': '54093', 'DESCRIPTION': '10PC FOAM BRUSH SET BROCHA DE ESPEONJA 10PC', 'UPC': '874619-54093-2', 'COST': '0.65'}
    """

    def extract(pattern):
        return extract_ocr_pattern(pattern, text)

    return {
        'VENDORID': 1,
        'VENDOR': 'example',
        'ITEMNO': extract(r'ITEM ?ID(.*)DESC'),
        'DESCRIPTION': extract(r'DESC(.*)UPC'),
        'UPC': extract(r'UPC ?NO(.*)WEIGHT'),
        'COST': extract(r'PRICE(.*?)\n'),
    }


def main(pages, url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url='https://gmdstoragestaging.blob.core.windows.net/documents/example/test_data.pdf',
    ... VENDORID=1,
    ... VENDOR='example',
    ... ITEMNO='54093',
    ... COST=0.65,
    ... UPC='874619540932',
    ... DESCRIPTION='10PC FOAM BRUSH SET BROCHA DE ESPEONJA 10PC',
    ... )
    """

    return marker_parser(
        pages,
        find_markers=find_markers,
        image_region=(-0.14, -0.009, 0.13, 0.091),
        text_region=(-0.001, -0.01, 0.726, 0.089),
        extract_product_from_text=extract_product_from_text,
    )
