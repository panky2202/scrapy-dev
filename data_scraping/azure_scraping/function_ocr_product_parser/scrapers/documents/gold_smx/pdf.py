from data_scraping.azure_scraping.common import table_parser, assert_item_in_parser_output
from data_scraping.azure_scraping.common.assert_item_in_parser_output import assert_item_in_parser_output


def main(pages, url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/GOLD%20SMX/PDF/10318.pdf",
    ... VENDORID=1163,
    ... VENDOR='GOLD SMX',
    ... ITEMNO='A011',
    ... COST=1.15,
    ... UPC='690192180514',
    ... DESCRIPTION='PLASTIC BB PELLETS IN BOTTLE, 72PC/CTN',
    ... )
    """
    return table_parser.table_parser(
        pages=pages,
        extract_product_from_data=extract_product_from_data,
        header_marker='DESCRIPTION',
        end_marker='Total',
        column_names=['ITEM', 'UPC', 'DESCRIPTION', 'PRICE'],
        first_page=None,
        custom_columns={'DESCRIPTION': (-0.1, 0.22)}
    )


def extract_product_from_data(data):
    """Receives OCR text, extracts product. Text could contain garbage or wrong reads.

    >>> extract_product_from_data(['A011', '690192180514', 'PLASTIC BB PELLETS IN BOTTLE, 72PC/CTN', '1.15'])
    {'VENDORID': 1163, 'VENDOR': 'GOLD SMX', 'ITEMNO': 'A011', 'DESCRIPTION': 'PLASTIC BB PELLETS IN BOTTLE, 72PC/CTN', 'UPC': '690192180514', 'COST': '1.15'}
    """
    if not data:
        return None

    return {
        'VENDORID': 1163,
        'VENDOR': 'GOLD SMX',
        "ITEMNO": data[0],
        "DESCRIPTION": data[2],
        "UPC": data[1],
        "COST": data[3],
    }
