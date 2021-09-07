import re

from data_scraping.azure_scraping.common import table_parser, assert_item_in_parser_output, marker_parser
from data_scraping.azure_scraping.common.assert_item_in_parser_output import assert_item_in_parser_output


def main(pages, url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    # >>> assert_item_in_parser_output(
    # ... parser=main,
    # ... url="https://gmdstoragestaging.blob.core.windows.net/documents/DOLLAR_EMPIRE/PDF/INV25821.pdf",
    # ... VENDORID=1051,
    # ... VENDOR='DOLLAR EMPIRE',
    # ... ITEMNO='12776A',
    # ... COST=0.69,
    # ... UPC='8276801277619',
    # ... DESCRIPTION='BAG SHOPPING NEW US',
    # ... )

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/DOLLAR_EMPIRE/PDF/INV25821PIC.pdf",
    ... VENDORID=1051,
    ... VENDOR='DOLLAR EMPIRE',
    ... ITEMNO='12776A',
    ... COST=0.69,
    ... DESCRIPTION='BAG SHOPPING NEW US DOLLAR;17.7X20X8" 2ASST 12/BOX 96/CTN Qty 192',
    ... )
    """

    layout = ''
    for page_image, ocr in pages:
        if layout == '':
            layout = get_layout(ocr)
        if layout == 'images':
            yield from process_images_layout([(page_image, ocr)])
        else:
            yield from process_table_layout([(page_image, ocr)])


def process_images_layout(pages):
    yield from marker_parser(
        pages,
        find_markers=find_markers,
        image_region=(0, 0.05, 0.2, 0.12),
        text_region=(0, 0, 0.27, 0.05),
        extract_product_from_text=extract_product_from_text
    )


def process_table_layout(pages, first_page=None):
    yield from table_parser.table_parser(
        pages=pages,
        extract_product_from_data=extract_product_from_data,
        header_marker='Line',
        end_marker='Tot',
        column_names=['Item', 'UPC/Barcode', 'Description', 'Price'],
        first_page=None,
        custom_columns={'DESCRIPTION': (0, 0.15)}
    )


def find_markers(ocr):
    """For each product on an image this function returns unique (x, y), eg, a marker point
    >>> find_markers([
    ... ("12345B", 1, 1, 1, 0.01),
    ... ("12345A", 12, 1, 12, 0.01),
    ... ("Concealer w/ Brush", 12, 1, 13, 0.01),
    ... ("Stick Concealer", 1, 1, 1, 0.01),
    ... ])
    [(1, 1), (12, 1)]
    """

    return [
        (left, top)
        for text, left, top, width, height in ocr
        if (re.match(r"\d{5,}", text))
    ]


def get_layout(ocr):
    """
    Return what kind of layout is being parsed: table, images or images_wprice
    >>> get_layout([
    ... ('LOL_INTERNET', 1, 1, 1, 1),
    ... ('Invoice', 2, 2, 2, 2),
    ... ('Garbage', 3, 3, 3, 3),
    ... ])
    'table'
    >>> get_layout([
    ... ('Color:', 1, 1, 1, 1),
    ... ('LOLinternet', 2, 2, 2, 2),
    ... ('Foo', 3, 3, 3, 3),
    ... ])
    'images'
    """
    for text, left, top, width, height in ocr:
        if text == 'Invoice':
            return 'table'
    return 'images'


def extract_product_from_text(text):
    """
    >>> extract_product_from_text('''12776A 0.69
    ... BATTERIES,4pk AA SPRHVY PANASO
    ... BAG SHOPPING NEW US
    ... DOLLAR;17.7X20X8" 2ASST
    ... 12/BOX 96/CTN Qty''')
    {'VENDORID': 1051, 'VENDOR': 'DOLLAR EMPIRE', 'ITEMNO': '12776A', 'DESCRIPTION': 'BATTERIES,4pk AA SPRHVY PANASO BAG SHOPPING NEW US DOLLAR;17.7X20X8" 2ASST 12/BOX 96/CTN Qty', 'COST': '0.69'}
    """
    if "profit margin" in text:
        return None
    item_no = re.search(r"(\S+)", text).group(1)
    cost = re.search(r"\S+\s(\S+)", text).group(1)
    description = re.search(r"\S+\s\S+\s(.+)", text, flags=re.DOTALL).group(1).replace("\n", " ")
    return {
        "VENDORID": 1051,
        "VENDOR": "DOLLAR EMPIRE",
        "ITEMNO": item_no,
        "DESCRIPTION": description,
        "COST": cost
    }


def extract_product_from_data(data):
    """Receives OCR text, extracts product. Text could contain garbage or wrong reads.

    >>> extract_product_from_data(['12776A', '8276801277619', 'BAG SHOPPING NEW US', '0.69'])
    {'VENDORID': 1051, 'VENDOR': 'DOLLAR EMPIRE', 'ITEMNO': '12776A', 'DESCRIPTION': 'BAG SHOPPING NEW US', 'UPC': '8276801277619', 'COST': '0.69'}
    """
    if not data:
        return None

    return {
        'VENDORID': 1051,
        'VENDOR': 'DOLLAR EMPIRE',
        "ITEMNO": data[0],
        "DESCRIPTION": data[2],
        "UPC": data[1],
        "COST": data[3],
    }
