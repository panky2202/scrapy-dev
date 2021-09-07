from data_scraping.azure_scraping.common import table_parser, assert_item_in_parser_output, extract_ocr_pattern
from data_scraping.azure_scraping.common.assert_item_in_parser_output import assert_item_in_parser_output


def main(pages, url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/MRC/PDF/SO74210.pdf",
    ... VENDORID=22,
    ... VENDOR='MRC',
    ... ITEMNO='89073-H-BLK',
    ... COST=1.95,
    ... DESCRIPTION='BRA (144) TERI LASER TSHIRT BLACK 34B/1 36B/1 34C/1 36C/2 38C/1',
    ... )
    """

    yield from table_parser.table_parser(
        pages,
        extract_product_from_data=extract_product_from_data,
        header_marker='PRICE',
        end_marker='REMARKS',
        column_names=['ITEM', 'DESCRIPTION', 'UNITS', 'PRICE'],
        main_col=2
    )


def extract_product_from_data(data):
    """Recives OCR text, extracts product. Text could contain garbage or wrong reads.

    >>> extract_product_from_data(['89073-H-BLK (17Wx18Hx25L)', 'BRA (144) TERI LASER TSHIRT BLACK 34B/1 36B/1 34C/1 36C/2 38C/1', '576', '$1.95'])
    {'VENDORID': 22, 'VENDOR': 'MRC', 'ITEMNO': '89073-H-BLK', 'DESCRIPTION': 'BRA (144) TERI LASER TSHIRT BLACK 34B/1 36B/1 34C/1 36C/2 38C/1', 'COST': 1.95}
    """

    def extract(pattern, text, occurrence=0):
        return extract_ocr_pattern(pattern, text, occurrence)

    if not data:
        return None

    if '$' not in data[3]:
        return None

    return {
        'VENDORID': 22,
        'VENDOR': 'MRC',
        'ITEMNO': extract(r'\S+', data[0]),
        'DESCRIPTION': data[1],
        'COST': float(data[3].replace('$', '')),
    }
