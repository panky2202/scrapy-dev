import re

from data_scraping.azure_scraping.common import table_parser, assert_item_in_parser_output, marker_parser
from data_scraping.azure_scraping.common.assert_item_in_parser_output import assert_item_in_parser_output


def main(pages, url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/FOUR_SEASONS/PDF/B062853-HIDALGO.pdf",
    ... VENDORID=13,
    ... VENDOR='FOUR SEASONS',
    ... ITEMNO='66256',
    ... COST=0.45,
    ... UPC='073096500235',
    ... DESCRIPTION='BATTERIES,4pk AA SPRHVY PANASO',
    ... )

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/FOUR_SEASONS/PDF/B062853-PICS.pdf",
    ... VENDORID=13,
    ... VENDOR='FOUR SEASONS',
    ... ITEMNO='66256',
    ... COST=0.45,
    ... DESCRIPTION='BATTERIES,4pk AA SPRHVY PANASO QOH: 75,384 CP/IP: 48/0 Cub.: 0.20 S.Ft/CS Org.: POL Wt.: 8.2 LB/CS',
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
        image_region=(0, -0.18, 0.22, 0.17),
        text_region=(0, 0, 0.23, 0.1),
        extract_product_from_text=extract_product_from_text
    )


def process_table_layout(pages, first_page=None):
    yield from table_parser.table_parser(
        pages=pages,
        extract_product_from_data=extract_product_from_data,
        header_marker='DESCRIPTION',
        end_marker=('PALLETS:', 'STRICTLY'),
        column_names=['NO', 'UPC', 'DESCRIPTION', 'PRICE'],
        first_page=None,
        custom_columns={'DESCRIPTION': (-0.1, 0.1)}
    )


def find_markers(ocr):
    """For each product on an image this function returns unique (x, y), eg, a marker point
    >>> find_markers([
    ... ("Item AC100", 1, 1, 1, 0.01),
    ... ("Item AC107", 12, 1, 12, 0.01),
    ... ("Concealer w/ Brush", 12, 1, 13, 0.01),
    ... ("Stick Concealer", 1, 1, 1, 0.01),
    ... ])
    [(1, 1), (12, 1)]
    """

    return [
        (left, top)
        for text, left, top, width, height in ocr
        if (re.match(r"Item", text))
    ]


def get_layout(ocr):
    """
    Return what kind of layout is being parsed: table, images or images_wprice
    >>> get_layout([
    ... ('LOL_INTERNET', 1, 1, 1, 1),
    ... ('INVOICE', 2, 2, 2, 2),
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
        if text == 'INVOICE':
            return 'table'
    return 'images'


def extract_product_from_text(text):
    """
    >>> extract_product_from_text('''Item #: 66256 0.45
    ... BATTERIES,4pk AA SPRHVY PANASO
    ... QOH: 75,384
    ... CP/IP: 48/0 Cub.: 0.20 S.Ft/CS
    ... Org.: POL Wt.: 8.2 LB/CS''')
    {'VENDORID': 13, 'VENDOR': 'FOUR SEASONS', 'ITEMNO': '66256', 'DESCRIPTION': 'BATTERIES,4pk AA SPRHVY PANASO QOH: 75,384 CP/IP: 48/0 Cub.: 0.20 S.Ft/CS Org.: POL Wt.: 8.2 LB/CS', 'COST': '0.45'}
    """
    item_no = re.search(r"Item #: (\S+)", text).group(1)
    cost = re.search(r"Item #: \S+\s(\S+)", text).group(1)
    description = re.search(r"Item #: \S+\s\S+\s(.+)", text, flags=re.DOTALL).group(1).replace("\n", " ")
    return {
        "VENDORID": 13,
        "VENDOR": "FOUR SEASONS",
        "ITEMNO": item_no,
        "DESCRIPTION": description,
        "COST": cost
    }


def extract_product_from_data(data):
    """Receives OCR text, extracts product. Text could contain garbage or wrong reads.

    >>> extract_product_from_data(['66256', 'BATTERIES,4pk AA SPRHVY PANASO', '073096500235', '0.45'])
    {'VENDORID': 13, 'VENDOR': 'FOUR SEASONS', 'ITEMNO': '66256', 'DESCRIPTION': 'BATTERIES,4pk AA SPRHVY PANASO', 'UPC': '073096500235', 'COST': '0.45'}
    """
    if not data:
        return None

    return {
        'VENDORID': 13,
        'VENDOR': 'FOUR SEASONS',
        "ITEMNO": data[0],
        "DESCRIPTION": data[1],
        "UPC": data[2],
        "COST": data[3],
    }
