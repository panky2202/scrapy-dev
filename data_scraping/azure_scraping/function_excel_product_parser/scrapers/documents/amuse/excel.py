from data_scraping.azure_scraping.common import excel_parser
from data_scraping.azure_scraping.common.assert_excel_parser import assert_excel_parser


def main(url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_excel_parser(
    ... parser=main,
    ... url=r"https://gmdstoragestaging.blob.core.windows.net/documents/AMUSE/EXCEL/GRAN%20MERCADO-SPRING%20INTO%20THE%20SEASON.xlsx",
    ... VENDORID=1203,
    ... VENDOR='AMUSE',
    ... ITEMNO='AM612',
    ... COST=1.8333333333333333,
    ... UPC='4713616471916',
    ... DESCRIPTION="Amuse Professional Setting Mist (Hydrating)",
    ... )
    """

    return excel_parser(
        url,
        extract_product_from_data,
        header_marker="ITEM"
    )


def extract_product_from_data(data):
    return {
        'VENDORID': 1203,
        'VENDOR': 'AMUSE',
        'ITEMNO': data.get('ITEM'),
        'DESCRIPTION': data.get('DESCRIPTION'),
        'UPC': data.get(6),
        'COST': data.get('price/UNIT'),
    }
