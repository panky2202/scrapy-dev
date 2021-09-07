from data_scraping.azure_scraping.common import table_parser, assert_item_in_parser_output
from data_scraping.azure_scraping.common.assert_item_in_parser_output import assert_item_in_parser_output


def main(pages, url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/JC%20Sales/PDF/jc1.pdf",
    ... VENDORID=1055,
    ... VENDOR='JC SALES',
    ... ITEMNO='84437',
    ... UPC='7501032940102',
    ... DESCRIPTION='SHOE POLISH LIQUID 60ML BL',
    ... )
    """

    return table_parser.table_parser(
        pages,
        extract_product_from_data=extract_product_from_data,
        header_marker='BARCODE',
        end_marker='PALLET',
        column_names=['LINE', 'ITEM', 'DESCRIPTION', 'BARCODE', 'UNIT_P', 'UM'],
    )


def extract_product_from_data(data):
    """Receives OCR text, extracts product. Text could contain garbage or wrong reads.

    >>> extract_product_from_data(['2T', '84437', 'SHOE POLISH LIQUID 60ML BLACK/NEGRO #KIWI', '7501032940102', '1PK', '0.55'])
    {'VENDORID': 1055, 'VENDOR': 'JC SALES', 'ITEMNO': '84437', 'DESCRIPTION': 'SHOE POLISH LIQUID 60ML BLACK/NEGRO #KIWI', 'UPC': '7501032940102'}
    """
    if not data:
        return None

    if 'PK' not in data[4]:
        return None

    return {
        'VENDORID': 1055,
        'VENDOR': 'JC SALES',
        'ITEMNO': data[1],
        'DESCRIPTION': data[2],
        'UPC': data[3],
    }
