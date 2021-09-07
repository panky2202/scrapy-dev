from data_scraping.azure_scraping.common import table_parser, assert_item_in_parser_output
from data_scraping.azure_scraping.common.assert_item_in_parser_output import assert_item_in_parser_output


def main(pages, url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]
    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/MARIPOSA/PDF/Inv_26534_from_Mariposa_USA_Inc._12304.pdf",
    ... VENDORID='19',
    ... VENDOR='MARIPOSA 1',
    ... ITEMNO='BO-043',
    ... UPC='819887023411',
    ... COST=0.79,
    ... DESCRIPTION='Plastic Bottle, 4.6cm x 8.0cm, 2ct10dz/cs',
    ... )

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/MARIPOSA/PDF/2.pdf",
    ... VENDORID='19',
    ... VENDOR='MARIPOSA 1',
    ... ITEMNO='HB-016SL',
    ... UPC='810070470050',
    ... COST=0.69,
    ... DESCRIPTION='Glitter Wooden Alphabet Letters Silver, 15mm, 78pc/ct 25dz/case',
    ... )
    """

    return table_parser.table_parser(
        pages=pages,
        extract_product_from_data=extract_product_from_data,
        header_marker='Description',
        end_marker='Total',
        column_names=['Item', 'Description', 'Rate', 'UPC'],
        first_page=None,
        custom_columns={'Description': (-0.1, 0.22)}
    )


def extract_product_from_data(data):
    """Receives OCR text, extracts product. Text could contain garbage or wrong reads.

    >>> extract_product_from_data(['BO-034', 'Glass Drop bottles 15ml: diameter 2.4cm x 6cm tall. 2pc/pk 20dz/cs', '0.69', '819887028720'])
    {'VENDORID': 19, 'VENDOR': 'MARIPOSA 1', 'ITEMNO': 'BO-034', 'DESCRIPTION': 'Glass Drop bottles 15ml: diameter 2.4cm x 6cm tall. 2pc/pk 20dz/cs', 'UPC': '819887028720', 'COST': '0.69'}
    """
    return {
        'VENDORID': 19,
        'VENDOR': 'MARIPOSA 1',
        'ITEMNO': data[0],
        'DESCRIPTION': data[1],
        'UPC': data[3],
        'COST': data[2],
    }
