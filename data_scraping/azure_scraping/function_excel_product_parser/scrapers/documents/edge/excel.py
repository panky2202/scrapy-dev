from data_scraping.azure_scraping.common import excel_parser
from data_scraping.azure_scraping.common.assert_excel_parser import assert_excel_parser


def main(url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_excel_parser(
    ... parser=main,
    ... url=r"https://productparsersa.blob.core.windows.net/documents/EDGE/EXCEL/OFIVE%20MAY%202021%20ORDER.xlsx",
    ... VENDORID=1054,
    ... VENDOR='EDGE',
    ... ITEMNO='E-123',
    ... COST=0.95,
    ... UPC='818801011237',
    ... DESCRIPTION="6FT ROUND MICRO USB CABLE ASTD CLRS",
    ... )
    """

    return excel_parser(
        url,
        extract_product_from_data,
        header_marker='Item number',
    )


def extract_product_from_data(data):
    """
    >>> extract_product_from_data({"Item number": "123", "Text": "description",
    ... "UPC": 123, "Price": 1.20})
    {'VENDORID': 1054, 'VENDOR': 'EDGE', 'ITEMNO': '123', 'DESCRIPTION': 'description', 'UPC': 123, 'COST': 1.2}
    >>> extract_product_from_data({"Item number": "nan", "Text": "description",
    ... "UPC code": 123, "Price": 1.20})
    """
    if data.get('Item number') and data.get('Item number') != 'nan':
        return {
            'VENDORID': 1054,
            'VENDOR': 'EDGE',
            'ITEMNO': data.get('Item number'),
            'DESCRIPTION': data.get('Text'),
            'UPC': data.get('UPC'),
            'COST': data.get('Price'),
        }
