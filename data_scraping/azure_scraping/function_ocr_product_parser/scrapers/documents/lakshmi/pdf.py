from data_scraping.azure_scraping.common import table_parser, assert_item_in_parser_output
from data_scraping.azure_scraping.common.assert_item_in_parser_output import assert_item_in_parser_output


def main(pages, url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/LAKSHMI/PDF/barcodes616%20part%201.pdf",
    ... VENDORID=1199,
    ... VENDOR='LAKSHMI',
    ... ITEMNO='LB1344',
    ... DESCRIPTION='LADIES BIKINI - FREE SIZE',
    ... UPC='180022013445'
    ... )
    """

    yield from table_parser.table_parser(
        pages,
        extract_product_from_data=extract_product_from_data,
        header_marker='Description',
        end_marker='Subtotal',
        column_names=['Item', 'Description', 'Barcode'],
    )


def extract_product_from_data(data):
    """Recives OCR text, extracts product. Text could contain garbage or wrong reads.

    >>> extract_product_from_data(['LM-1601', 'LADIES MAMA BRIEF - FREE SIZE', '180022 01344 5'])
    {'VENDORID': 1199, 'VENDOR': 'LAKSHMI', 'ITEMNO': 'LM-1601', 'DESCRIPTION': 'LADIES MAMA BRIEF - FREE SIZE', 'UPC': '180022013445'}
    """
    if not data or ' ' in data[0]:
        return
    return {
        'VENDORID': 1199,
        'VENDOR': 'LAKSHMI',
        'ITEMNO': data[0],
        'DESCRIPTION': data[1],
        'UPC': data[2].replace(' ', '')
    }
