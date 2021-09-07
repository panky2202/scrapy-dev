from data_scraping.azure_scraping.common import upc_parser, assert_item_in_parser_output
from data_scraping.azure_scraping.common.assert_item_in_parser_output import assert_item_in_parser_output


def main(pages, url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url='https://gmdstoragestaging.blob.core.windows.net/documents/CBB/CBB%20PICS/0816.jpg',
    ... VENDORID=10,
    ... VENDOR='CBB',
    ... ITEMNO='0816',
    ... UPC='850011008164',
    ... )
    """

    return upc_parser(pages, url, vendor_id=10, vendor='CBB')
