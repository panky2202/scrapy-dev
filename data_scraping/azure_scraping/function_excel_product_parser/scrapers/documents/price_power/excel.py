from data_scraping.azure_scraping.common import excel_parser
from data_scraping.azure_scraping.common.assert_excel_parser import assert_excel_parser


def main(url):
    """
    >>> assert_excel_parser(
    ... parser=main,
    ... url=r"https://gmdstoragestaging.blob.core.windows.net/documents/PRICE%20POWER/EXCEL/PRICE%20POWER%20USA%20QUOTES%20missing%205-21.xlsx",
    ... VENDORID=1097,
    ... VENDOR='PRICE POWER',
    ... ITEMNO='FH-219-24',
    ... DESCRIPTION="SS Casserole/Dutch Oven w/ Glass Lid 24cm 4.5L",
    ... )
    """

    return excel_parser(
        url,
        extract_product_from_data,
        header_marker='ITEM NO.'
    )


def extract_product_from_data(data):
    return {
        'VENDORID': 1097,
        'VENDOR': 'PRICE POWER',
        'ITEMNO': data['ITEM NO.'].strip(),
        'DESCRIPTION': data['DESCRIPTION'].strip()
    }
