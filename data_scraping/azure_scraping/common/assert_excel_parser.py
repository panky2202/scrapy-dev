import inspect
import os

from data_scraping.common import check_flex_contract
from data_scraping.common import parse_product


def get_function_folder(f):
    """
    >>> get_function_folder(assert_excel_parser).endswith(('azure_scraping/common', 'azure_scraping\\common'))
    True
    """
    return os.path.dirname(os.path.abspath(inspect.getfile(f)))


def assert_excel_parser(parser, url, **kwargs):
    results = parser(url)

    if not results:
        return

    products = [parse_product(**p, PAGE_URL=url) for p in results if p]
    check_flex_contract(kwargs, products)
