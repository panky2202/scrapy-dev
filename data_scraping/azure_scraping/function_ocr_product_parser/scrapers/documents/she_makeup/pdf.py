import re

from data_scraping.azure_scraping.common import extract_ocr_pattern, marker_parser, assert_item_in_parser_output, \
    table_parser


def main(pages, url):
    """
    >>> assert_item_in_parser_output.assert_item_in_parser_output(
    ... parser=main,
    ... url=r"https://gmdstoragestaging.blob.core.windows.net/documents/SHE%20MAKEUP/PDF/Makeup%20She%20Catalog%20-%20small.pdf",
    ... VENDORID=30,
    ... VENDOR="SHE MAKEUP",
    ... ITEMNO="AC100",
    ... DESCRIPTION="Concealer w/ Brush"
    ... )

    >>> assert_item_in_parser_output.assert_item_in_parser_output(
    ... parser=main,
    ... url=r"https://gmdstoragestaging.blob.core.windows.net/documents/SHE%20MAKEUP/PDF/PriceList.pdf",
    ... VENDORID=30,
    ... VENDOR="SHE MAKEUP",
    ... ITEMNO="AC100",
    ... DESCRIPTION="Concelaer w/ Brush",
    ... UPC="8580960071002"
    ... )
    """

    layout = ''
    first_page = None
    for page_image, ocr in pages:
        if not first_page:
            first_page = [(page_image, ocr)]
        if layout == '':
            layout = get_layout(ocr)
        if layout == 'images':
            yield from process_images_layout([(page_image, ocr)])
        elif layout == 'images_wprice':
            yield from process_images_wprice_layout([(page_image, ocr)])
        else:
            yield from process_table_layout([(page_image, ocr)], first_page)


def process_images_layout(pages):
    yield from marker_parser(
        pages,
        find_markers=find_markers,
        image_region=(-0.09, -0.20, 0.18, 0.19),
        text_region=(-0.09, 0, 0.2, 0.04),
        extract_product_from_text=extract_product_from_text
    )


def process_images_wprice_layout(pages):
    pass


def process_table_layout(pages, first_page):
    yield from table_parser.table_parser(
        pages,
        extract_product_from_data=extract_product_from_table,
        header_marker='Page',
        column_names=['Item', 'Description', 'UPC', 'Mastercase'],
        first_page=first_page
    )


def find_markers(ocr):
    """For each product on an image this function returns unique (x, y), eg, a marker point
    >>> find_markers([
    ... ("AC100", 1, 1, 1, 0.01),
    ... ("AC107", 12, 1, 12, 0.01),
    ... ("Concealer w/ Brush", 12, 1, 13, 0.01),
    ... ("Stick Concealer", 1, 1, 1, 0.01),
    ... ])
    [(1.5, 1), (18.0, 1)]
    """

    return [
        (left + width/2, top)
        for text, left, top, width, height in ocr
        if (re.match(r"[A-Z]+[0-9]+|[0-9]+[A-Z]+", text) and 0.009 <= height <= 0.011)
    ]


def extract_product_from_text(text):
    """Recives OCR text, extracts product. Text could contain garbage or wrong reads.
    >>> extract_product_from_text('''AC100
    ... Concealer w/ Brush''')
    {'VENDORID': 30, 'VENDOR': 'SHE MAKEUP', 'ITEMNO': 'AC100', 'DESCRIPTION': 'Concealer w/ Brush'}
    >>> extract_product_from_text('''AC107
    ... Stick Concealer''')
    {'VENDORID': 30, 'VENDOR': 'SHE MAKEUP', 'ITEMNO': 'AC107', 'DESCRIPTION': 'Stick Concealer'}
    """

    def extract(pattern, occurrence=0):
        return extract_ocr_pattern(pattern, text, occurrence)

    item_no = extract(r"\w+")
    description = extract(r"\s.+")
    return {
        "VENDORID": 30,
        "VENDOR": "SHE MAKEUP",
        "ITEMNO": item_no,
        "DESCRIPTION": description
    }


def extract_product_from_table(data):
    """Receives data array and outputs product dictionary
    >>> extract_product_from_table(['1234', 'Product Description', '123 dz', '12345678'])
    {'VENDORID': 30, 'VENDOR': 'SHE MAKEUP', 'ITEMNO': '1234', 'DESCRIPTION': 'Product Description', 'UPC': '12345678'}

    >>> extract_product_from_table(['1234', 'Product Description', '123', '12345678'])
    """

    if 'dz' not in data[2]:
        return

    return {
        "VENDORID": 30,
        "VENDOR": "SHE MAKEUP",
        "ITEMNO": data[0],
        "DESCRIPTION": data[1],
        "UPC": data[3],
    }


def get_layout(ocr):
    """
    Return what kind of layout is being parsed: table, images or images_wprice
    >>> get_layout([
    ... ('LOL_INTERNET', 1, 1, 1, 1),
    ... ('UPC', 2, 2, 2, 2),
    ... ('Garbage', 3, 3, 3, 3),
    ... ])
    'table'
    >>> get_layout([
    ... ('S.he', 1, 1, 1, 1),
    ... ('Prod1', 2, 2, 2, 2),
    ... ('$1.99', 3, 3, 3, 3),
    ... ])
    'images_wprice'
    >>> get_layout([
    ... ('S.he', 1, 1, 1, 1),
    ... ('LOLinternet', 2, 2, 2, 2),
    ... ('Foo', 3, 3, 3, 3),
    ... ])
    'images'
    """
    layout = ''
    for text, left, top, width, height in ocr:
        if text == 'UPC':
            return 'table'

        if text == 'S.he':
            layout = 'images'

        if layout == 'images' and '$' in text:
            return 'images_wprice'

    return layout

