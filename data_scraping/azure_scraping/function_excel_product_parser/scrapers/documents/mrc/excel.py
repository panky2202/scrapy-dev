from data_scraping.azure_scraping.common import excel_parser
from data_scraping.azure_scraping.common.assert_excel_parser import assert_excel_parser


def main(url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_excel_parser(
    ... parser=main,
    ... url=r"https://gmdstoragestaging.blob.core.windows.net/documents/MRC/EXCEL/OFive%20May%20Order%20PO%20052021.xlsx",
    ... VENDORID=22,
    ... VENDOR='MRC',
    ... ITEMNO='89073-H-BLK',
    ... UPC='780742442176',
    ... DESCRIPTION="BLACK",
    ... )
    """

    return excel_parser(
        url,
        extract_product_from_data
    )


def extract_product_from_data(data):
    return {
        'VENDORID': 22,
        'VENDOR': 'MRC',
        'ITEMNO': data.get('Item No.'),
        'DESCRIPTION': data.get('Color'),
        'UPC': data.get('UPC'),
    }
