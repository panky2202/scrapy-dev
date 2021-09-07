import importlib
from urllib.parse import unquote

from furl import furl


def path_to_package_name(vendor: str):
    """
    >>> path_to_package_name('TCB')
    'tcb'

    >>> path_to_package_name('Dollar Empire')
    'dollar_empire'

    >>> path_to_package_name('')
    """
    if not vendor:
        return
    return vendor.lower().replace(' ', '_')


def module_name_from_url(base_module, url):
    """
    >>> module_name_from_url('base.module', 'https://productparsersa.blob.core.windows.net/documents/vendor/excel/test_data.xls')
    'base.module.documents.vendor.excel'

    >>> module_name_from_url('base.module', 'https://productparsersa.blob.core.windows.net/documents/vendor2/excel/excel.xlsm')
    'base.module.documents.vendor2.excel'

    >>> module_name_from_url('base.module', '/documents/vendor3/EXCEL/test_data.xlsb')
    'base.module.documents.vendor3.excel'
    """

    unquote_path = unquote(str(furl(url).path))
    path_without_document = unquote_path.split('/')[:-1]
    parts = [path_to_package_name(x) for x in path_without_document]
    valid_parts = [x for x in parts if x]
    parser_module = ".".join(valid_parts)

    return f'{base_module}.{parser_module}'


def find_parser(base_module, url):
    """
    >>> base = 'data_scraping.azure_scraping.function_excel_product_parser.find_parser.test'
    >>> find_parser(base, '/documents/vendor3/excel/excel.xls')()
    'vendor3/excel'

    >>> find_parser(base, 'https://productparsersa.blob.core.windows.net/documents/vendor3/excel/excel.xlsb')()
    'vendor3/excel'
    """
    try:
        module = importlib.import_module(module_name_from_url(base_module, url))
        return module.main
    except ModuleNotFoundError:
        pass
