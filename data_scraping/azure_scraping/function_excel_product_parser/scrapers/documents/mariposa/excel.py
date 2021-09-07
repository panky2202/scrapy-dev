from data_scraping.azure_scraping.common import excel_parser
from data_scraping.azure_scraping.common.assert_excel_parser import assert_excel_parser


def main(url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_excel_parser(
    ... parser=main,
    ... url=r"https://gmdstoragestaging.blob.core.windows.net/documents/MARIPOSA/excel/GM%20Distributors%20Group%20Items%20Bought%20from%201-19-Current.xlsx",
    ... VENDORID=19,
    ... VENDOR='MARIPOSA',
    ... ITEMNO='AD-007',
    ... COST=0.55,
    ... UPC='810870022183',
    ... DESCRIPTION="Accessories-Fish Hook Earring-Gold25DZ/Case",
    ... )
    """

    return excel_parser(
        url,
        extract_product_from_data
    )


def extract_product_from_data(data):
    return {
        'VENDORID': 19,
        'VENDOR': 'MARIPOSA',
        'ITEMNO': data.get('Item'),
        'DESCRIPTION': data.get('Memo'),
        'UPC': data.get('UPC'),
        'COST': data.get('Sales Price'),
    }
