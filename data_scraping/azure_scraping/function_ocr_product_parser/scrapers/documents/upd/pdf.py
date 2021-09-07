import re

from data_scraping.azure_scraping.common import extract_ocr_pattern, marker_parser
from data_scraping.azure_scraping.common.assert_item_in_parser_output import assert_item_in_parser_output


def find_markers(ocr):
    """For each product on an image this function returns unique (x, y), eg, a marker point
    >>> find_markers([
    ... ('hello', 1, 1, 1, 1),
    ... ('Quantity:', -0.001, -0.001, 13, 1),
    ... ('Wt:', 1, 1, 1, 1),
    ... ])
    [(-0.001, -0.001)]
    """

    return [
        (left, top)
        for text, left, top, width, height in ocr
        if re.match(r"Quantity:", text)
    ]


def extract_product_from_text(text):
    """Recives OCR text, extracts product. Text could contain garbage or wrong reads.
    >>> extract_product_from_text('''
    ... GHV54963B $2.99
    ... Mattel DP Barbie Club Chelsea Blonde
    ... Beach Doll
    ... Quantity: 179 Cs: 18 Inn:
    ... Arrives (qty/date):
    ... UPC Code: 887961803242...
    ... Wt: 2 Cb: .19
    ... Case Dimensions: 8" 6" 7"
    ... x x
    ... ''')
    {'VENDORID': 1068, 'VENDOR': 'UPD', 'ITEMNO': 'GHV54963B', 'UPC': '887961803242...', 'COST': '2.99'}
    """
    def search(pattern):
        return re.search(pattern, text, re.M).group(1)
    return {
        "VENDORID": 1068,
        "VENDOR": "UPD",
        "ITEMNO": search(r'^\s*(.+?)\s*\$'),
        "UPC": search(r'UPC Code:\s*(.+?)$'),
        "COST": search(r'\$([.0-9]+)'),
    }


def main(pages, url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/UPD/BARBIE.pdf",
    ... VENDORID=1068,
    ... VENDOR="UPD",
    ... ITEMNO="GJL749993",
    ... UPC="887961813722",
    ... COST="15.95"
    ... )
    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/UPD/BARBIE.pdf",
    ... VENDORID=1068,
    ... VENDOR="UPD",
    ... ITEMNO="GRB509993",
    ... UPC="887961900224",
    ... COST="7.9"
    ... )
    """
    return marker_parser(
        pages,
        find_markers=find_markers,
        image_region=(0, -0.217, 0.222, 0.174),
        text_region=(-0.005, -0.04, 0.254, 0.1),
        extract_product_from_text=extract_product_from_text,
    )
