from data_scraping.azure_scraping.common import table_parser, assert_item_in_parser_output
from data_scraping.azure_scraping.common.assert_item_in_parser_output import assert_item_in_parser_output


def main(pages, url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/BAZIC/PDF/50119587.pdf",
    ... VENDORID=9,
    ... VENDOR='BAZIC',
    ... ITEMNO='115',
    ... COST=0.39,
    ... UPC='764608001158',
    ... DESCRIPTION='BAZIC Razor Replacement Blade with Tube (8/Tube)',
    ... )
    """

    return table_parser.table_parser(
        pages=pages,
        extract_product_from_data=extract_product_from_data,
        header_marker='Description',
        end_marker='Subtotal',
        column_names=['#', 'Item', 'Description', 'UPC', 'Price'],
    )


def extract_product_from_data(data):
    """Receives OCR text, extracts product. Text could contain garbage or wrong reads.

    >>> extract_product_from_data(['001', '115', 'BAZIC Razor Replacement Blade with Tube (8/Tube)', '764608001158', '$ 0.3900'])
    {'VENDORID': 9, 'VENDOR': 'BAZIC', 'ITEMNO': '115', 'DESCRIPTION': 'BAZIC Razor Replacement Blade with Tube (8/Tube)', 'UPC': '764608001158', 'COST': '0.3900'}
    """
    if not data:
        return None

    if len(data[0]) != 3:
        return None

    return {
        'VENDORID': 9,
        'VENDOR': 'BAZIC',
        'ITEMNO': data[1],
        'DESCRIPTION': data[2],
        'UPC': data[3],
        'COST': data[4].replace('$', '').strip()
    }
