from data_scraping.azure_scraping.common import excel_parser
from data_scraping.azure_scraping.common.assert_excel_parser import assert_excel_parser


def main(url):
    """
    >>> assert_excel_parser(
    ... parser=main,
    ... url=r"https://productparsersa.blob.core.windows.net/documents/SHE%20MAKEUP/EXCEL/She%20Compact%20Press%20Powder%20Color%20list%20With%20Other%20Company%20Name%201026-12.xls",
    ... VENDORID=30,
    ... VENDOR='SHE MAKEUP',
    ... ITEMNO='PP01',
    ... UPC='819749010511',
    ... DESCRIPTION="Porcelain",
    ... )
    """

    return excel_parser(
        url,
        extract_product_from_data,
        header_marker='#'
    )


def extract_product_from_data(data):
    return {
        'VENDORID': 30,
        'VENDOR': 'SHE MAKEUP',
        'ITEMNO': data['She #'].strip(),
        'DESCRIPTION': data['Color Name'].strip(),
        'UPC': data['Upc Bar code'].strip()
    }
