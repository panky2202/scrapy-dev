import re

from data_scraping.azure_scraping.common import extract_ocr_pattern, marker_parser
from data_scraping.azure_scraping.common.assert_item_in_parser_output import assert_item_in_parser_output


def find_markers(ocr):
    """For each product on an image this function returns unique (x, y), eg, a marker point
    >>> find_markers([
    ... ("Upc", 1, 1, 1, 1),
    ... ("Upc", 12, 1, 13, 1),
    ... ("#/CS", 12, 1, 13, 1),
    ... ("#/CS:", 1, 1, 1, 1),
    ... ])
    [(12, 1), (1, 1)]
    """

    result = [
        (left, top)
        for text, left, top, width, height in ocr
        if (re.match(r"(#/CS).*", text))
    ]

    return result


def extract_product_from_text(text):
    """Recives OCR text, extracts product. Text could contain garbage or wrong reads.
    >>> extract_product_from_text('''ITEM ID: 54093 DESC.: 10PC FOAM BRUSH SET
    ... BROCHA DE ESPEONJA 10PC
    ... UPC NO: 874619-54093-2 WEIGHT: 6.60 LB QTY: 1 CS U.PRICE: 0.65
    ... #/CS: 48 PC VOLUME: 1.99 CF T.UNITS: 48 AMOUNT: 31.20'4''')
    {'VENDORID': 34, 'VENDOR': 'TCB', 'ITEMNO': '54093', 'DESCRIPTION': '10PC FOAM BRUSH SET BROCHA DE ESPEONJA 10PC', 'COST': '0.65', 'UPC': '874619540932'}
    >>> extract_product_from_text('''VD993
    ... CLC DIAMOND DSGN 8.6(H) X
    ... #/CS: 24 PC #/PK: 24 PC
    ... 817503012993
    ... VD993 $ 0.85''')
    {'VENDORID': 34, 'VENDOR': 'TCB', 'ITEMNO': 'VD993', 'DESCRIPTION': 'CLC DIAMOND DSGN 8.6(H) X', 'COST': '0.85', 'UPC': '17503012993'}
    """

    def extract(pattern):
        return extract_ocr_pattern(pattern, text)

    if does_belongs_to_a_eight_pages_layout(text):
        item_no = extract(r"ITEM ID:(.*) DESC")
        description = extract(r"DESC\s?.:(.*)UPC NO")
        raw_upc = extract(r"UPC NO:(.*) WEIGHT")
        upc = raw_upc.replace("-", "") if raw_upc else ""
        price = extract(r"U.PRICE: ([0-9]*\.[0-9]*)")
    else:
        item_no = extract(r"([-A-Z0-9]*).*")
        description = extract(r"[-A-Z0-9]*(.*)#/CS")
        raw_upc = extract(r"PC.*([0-9]{11,13})")
        upc = raw_upc.replace("-", "") if raw_upc else ""
        price = extract(r"\$\s*([0-9]*\.[0-9]*)")
    return {
        "VENDORID": 34,
        "VENDOR": "TCB",
        "ITEMNO": item_no,
        "DESCRIPTION": description,
        "COST": price,
        "UPC": upc
    }

def does_belongs_to_a_eight_pages_layout(text):
    """
    >>> does_belongs_to_a_eight_pages_layout("ITEM ID")
    True
    >>> does_belongs_to_a_eight_pages_layout("No matching ")
    False
    """
    return bool(re.match(r"ITEM\s?ID", text))

def main(pages, url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/TCB/pdf/tcb_twenty_products_fast_test.jpg",
    ... VENDORID=34,
    ... VENDOR="TCB",
    ... ITEMNO="ZDL-14FU",
    ... COST=0.79,
    ... DESCRIPTION="14IN PAPER LANTERN FUCHSIA",
    ... )

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/TCB/pdf/tcb_six_products_fast_test.jpg",
    ... VENDORID=34,
    ... VENDOR="TCB",
    ... ITEMNO="080115",
    ... COST=1.59,
    ... UPC="602500700101",
    ... DESCRIPTION="TURQUOISE 3X8IN METALLIC FOIL CURTAIN CORTINA DE ALUMINIO TURQUESA 3X8 PULG",
    ... )
    """
    for page_image, ocr in pages:
        markers = find_markers(ocr)
        if has_twenty_pages_layout(markers):
            yield from process_twenty_product_layout_page(ocr, page_image)
        else:
            yield from process_eight_products_layout_page(ocr, page_image)


def has_twenty_pages_layout(markers):
    """
    >>> has_twenty_pages_layout([(0.066, 0.19), (0.508, 0.455), (0.066, 0.91), (0.508, 0.91)])
    True
    """
    return markers[0][0] < 0.18


def process_eight_products_layout_page(ocr, page_image):
    """ (page_image, page_ocr) ->  [(product_image, product), ...] """
    yield from marker_parser(
        [(page_image, ocr)],
        find_markers=find_markers,
        text_region=(-0.02, -0.06, 0.8, 0.07),
        image_region=(-0.13, -0.055, 0.12, 0.085),
        extract_product_from_text=extract_product_from_text,
    )


def process_twenty_product_layout_page(ocr, page_image):
    """ (page_image, page_ocr) ->  [(product_image, product), ...] """
    yield from marker_parser(
        [(page_image, ocr)],
        find_markers=find_markers,
        text_region=(-0.003, -0.025, 0.18, 0.06),
        image_region=(-0.003, -0.18, 0.18, 0.16),
        extract_product_from_text=extract_product_from_text,
    )
