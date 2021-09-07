from data_scraping.azure_scraping.common import excel_parser
from data_scraping.azure_scraping.common.assert_excel_parser import assert_excel_parser


def main(url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_excel_parser(
    ... parser=main,
    ... url=r"https://productparsersa.blob.core.windows.net/documents/ZMC/ZMC%20EXCEL/ZR%2010631%20052919EA.xlsx",
    ... VENDORID=38,
    ... VENDOR='ZMC',
    ... ITEMNO='7655-4',
    ... COST=4.25,
    ... UPC='690123016554',
    ... DESCRIPTION="SUPER SOAKER WATER GUN, 18DZ/CTN",
    ... )
    """

    return excel_parser(
        url,
        extract_product_from_data,
        header_marker='Item #',
        bottom_marker='Total'
    )


def extract_product_from_data(data):
    """ {} -> {}
    >>> extract_product_from_data({"Item #": "123", "Description": "description",
    ... "UPC code": 123, "Price": 1.20})
    {'VENDORID': 38, 'VENDOR': 'ZMC', 'ITEMNO': '123', 'DESCRIPTION': 'description', 'UPC': 123, 'COST': 1.2}
    >>> extract_product_from_data({"Item #": "nan", "Description": "description",
    ... "UPC code": 123, "Price": 1.20})
    """
    if data.get('Item #') and data.get('Item #') != 'nan':
        return {
            'VENDORID': 38,
            'VENDOR': 'ZMC',
            'ITEMNO': data.get('Item #'),
            'DESCRIPTION': data.get('Description'),
            'UPC': data.get('UPC code'),
            'COST': data.get('Price'),
        }
