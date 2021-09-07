import re

from data_scraping.azure_scraping.common import extract_ocr_pattern, marker_parser, assert_item_in_parser_output, \
    table_parser


def main(pages, url):
    """
    >>> assert_item_in_parser_output.assert_item_in_parser_output(
    ... parser=main,
    ... url=r"https://gmdstoragestaging.blob.core.windows.net/documents/PRICE%20POWER/PDF/GMD%20BROWNVILLE.pdf",
    ... VENDORID=1097,
    ... VENDOR="PRICE POWER",
    ... ITEMNO="55069",
    ... DESCRIPTION="Plastic Jar W. Handle Asst.Color",
    ... UPC="6972049648014",
    ... )

    >>> assert_item_in_parser_output.assert_item_in_parser_output(
    ... parser=main,
    ... url=r"https://gmdstoragestaging.blob.core.windows.net/documents/PRICE%20POWER/PDF/GMD%20BROWNSVILLE%20PICTURES.pdf",
    ... VENDORID=1097,
    ... VENDOR="PRICE POWER",
    ... ITEMNO="55022",
    ... DESCRIPTION="Plastic Silicone Ice Cube Tray 10"
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
        image_region=(-0.24, 0, 0.2, 0.16),
        text_region=(-0.04, 0, 0.25, 0.25),
        extract_product_from_text=extract_product_from_text
    )


def process_table_layout(pages, first_page=None):
    yield from table_parser.table_parser(
        pages,
        extract_product_from_data=extract_product_from_table,
        header_marker='Description',
        column_names=['Item', 'Description', 'Pack'],
        first_page=first_page,
        end_marker='Vol:'
    )


def find_markers(ocr):
    """For each product on an image this function returns unique (x, y), eg, a marker point
    >>> find_markers([
    ... ("Item: AC100", 1, 1, 1, 0.01),
    ... ("Item: AC107", 12, 1, 12, 0.01),
    ... ("Concealer w/ Brush", 12, 1, 13, 0.01),
    ... ("Stick Concealer", 1, 1, 1, 0.01),
    ... ])
    [(1.5, 1), (18.0, 1)]
    """

    return [
        (left + width/2, top)
        for text, left, top, width, height in ocr
        if (re.match(r"Item:", text))
    ]


def extract_product_from_text(text):
    """
    >>> extract_product_from_text('''Item: 550A69
    ... Plastic Jar W. Handle Asst.Color
    ... Color:
    ... Size:
    ... Packing: 48 Pc/Case
    ... Case Weight: 6.39 lb
    ... Case Volume: 1.90 ft
    ... Unit: PC Price: 0.450
    ... ¬fi%£Q"PV−''')
    {'VENDORID': 1097, 'VENDOR': 'PRICE POWER', 'ITEMNO': '550A69', 'DESCRIPTION': ' Plastic Jar W. Handle Asst.Color'}
    """
    def extract(pattern, occurrence=0):
        return extract_ocr_pattern(pattern, text, occurrence)

    item_no = extract(r"Item: \S+")
    description = extract(r".+Color:").replace(item_no, '').replace(' Color', '')
    item_no = item_no.replace('Item: ', '')
    return {
        "VENDORID": 1097,
        "VENDOR": "PRICE POWER",
        "ITEMNO": item_no,
        "DESCRIPTION": description
    }


def extract_product_from_table(data):
    """Receives data array and outputs product dictionary
    >>> extract_product_from_table(['1234', 'Product Description 12345678', '123 PC'])
    {'VENDORID': 1097, 'VENDOR': 'PRICE POWER', 'ITEMNO': '1234', 'DESCRIPTION': 'Product Description', 'UPC': '12345678'}

    >>> extract_product_from_table(['1234', 'Product Description 12345678', '123'])
    """
    def extract(pattern, text, occurrence):
        return extract_ocr_pattern(pattern, text, occurrence)

    if 'PC' not in data[2]:
        return

    upc = extract(r'\d{8,}', data[1], 0)
    description = data[1].replace(upc, '').strip()

    return {
        "VENDORID": 1097,
        "VENDOR": "PRICE POWER",
        "ITEMNO": data[0],
        "DESCRIPTION": description,
        "UPC": upc,
    }


def get_layout(ocr):
    """
    Return what kind of layout is being parsed: table, images or images_wprice
    >>> get_layout([
    ... ('LOL_INTERNET', 1, 1, 1, 1),
    ... ('Customer', 2, 2, 2, 2),
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
        if text == 'Customer':
            return 'table'

        if text == 'Color:':
            return 'images'

    return None

