from data_scraping.azure_scraping.common import extract_ocr_pattern
from data_scraping.azure_scraping.common import marker_parser
from data_scraping.azure_scraping.common.assert_item_in_parser_output import assert_item_in_parser_output


def is_invoice(ocr):
    """
    >>> is_invoice([
    ... ("1", 0.07, 0.5, 1, 1),
    ... ("INVOICE", 0.05, 0.5, 13, 1),
    ... ("27", 0.06, 0.5, 13, 1),
    ... ("690203100746", 0.3, 14, 1, 1),
    ... ])
    [(0.05, 0.5)]
    """

    result = [
        (left, top)
        for text, left, top, width, height in ocr
        if 'INVOICE' in text
    ]

    return result


def find_markers(ocr):
    """For each product on an image this function returns unique (x, y), eg, a marker point
    >>> find_markers([
    ... ("1", 0.07, 0.5, 1, 1),
    ... ("Number:", 0.05, 0.5, 13, 1),
    ... ("27", 0.06, 0.5, 13, 1),
    ... ("690203100746", 0.3, 14, 1, 1),
    ... ])
    [(0.05, 0.5)]
    """

    result = [
        (left, top)
        for text, left, top, width, height in ocr
        if text.startswith('Number:')
    ]

    return result


def extract_product_from_text(text):
    """Recives OCR text, extracts product. Text could contain garbage or wrong reads.
    >>> extract_product_from_text('''6 FOOT ROUND MICRO CABLE
    ... ASTD COLORS
    ... Item Number: E123
    ... Master Case: 48
    ... Inner Case: 12
    ... Item UPC: 818801011237
    ... Languages: English
    ... Case Colors: 6 Assorted'
    ... ''')
    {'VENDORID': 1054, 'VENDOR': 'EDGE', 'ITEMNO': 'E123', 'UPC': '818801011237', 'DESCRIPTION': '6 FOOT ROUND MICRO CABLE ASTD COLORS'}
    """

    def extract(pattern):
        return extract_ocr_pattern(pattern, text)

    return {
        "VENDORID": 1054,
        "VENDOR": "EDGE",
        "ITEMNO": extract(r'Item Number:\W*(\w+)'),
        "UPC": extract(r'Item UPC:\W*(\w+)'),
        "DESCRIPTION": extract(r'(.*)Item Number:'),
    }


def main(pages, url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/EDGE/PDF/example_big_images.pdf",
    ... VENDORID=1054,
    ... VENDOR="EDGE",
    ... ITEMNO="E466",
    ... UPC="818801014665",
    ... DESCRIPTION="2PC IPHONE KIT - 6FT BRAIDED CABLE + 2.1A CAR CHARGER"
    ... )
    """

    return marker_parser(
        [x for x in pages if not is_invoice(x[1])],
        find_markers=find_markers,
        image_region=(-0.57, -0.22, 0.50, 0.55),
        text_region=(-0.1, -0.135, 0.5, 0.33),
        extract_product_from_text=extract_product_from_text,
    )
