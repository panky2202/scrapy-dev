import importlib
from urllib.parse import unquote

from furl import furl

from data_scraping.azure_scraping.common import get_ocr_source_url, is_ocr_data_url


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
    >>> module_name_from_url('base.module', 'https://productparsersa.blob.core.windows.net/documents/vendor/pdf/test_data.pdf')
    'base.module.documents.vendor.pdf'

    >>> module_name_from_url('base.module', 'https://productparsersa.blob.core.windows.net/documents/vendor2/image/image.jpg')
    'base.module.documents.vendor2.image'

    >>> module_name_from_url('base', 'https://productparsersa.blob.core.windows.net/documents/vendor2/image/image.jpg/ocr.json')
    'base.documents.vendor2.image'

    >>> module_name_from_url('base.module', '/documents/vendor/SOME%20PDF/test_data.pdf')
    'base.module.documents.vendor.some_pdf'

    >>> module_name_from_url('base.module', '/documents/vendor/SOME%20PDF/test_data.pdf/ocr.json')
    'base.module.documents.vendor.some_pdf'

    >>> module_name_from_url('base.module', '/pdf/test_data.pdf')
    'base.module.pdf'

    >>> module_name_from_url('base.module', 'https://productparsersa.blob.core.windows.net/documents/vendor/excel/test_data.xls')
    'base.module.documents.vendor.excel'

    >>> module_name_from_url('base.module', 'https://productparsersa.blob.core.windows.net/documents/vendor2/excel/excel.xlsm')
    'base.module.documents.vendor2.excel'

    >>> module_name_from_url('base.module', '/documents/vendor3/EXCEL/test_data.xlsb')
    'base.module.documents.vendor3.excel'
    """

    base_url = get_ocr_source_url(url) if is_ocr_data_url(url) else url
    unquote_path = unquote(str(furl(base_url).path))
    path_without_document = unquote_path.split('/')[:-1]
    parts = [path_to_package_name(x) for x in path_without_document]
    valid_parts = [x for x in parts if x]
    parser_module = ".".join(valid_parts)

    return f'{base_module}.{parser_module}'


def find_parser(base_module, url):
    """
    >>> base = 'data_scraping.azure_scraping.common.find_parser.test'
    >>> find_parser(base, 'https://productparsersa.blob.core.windows.net/documents/uknown_parser/test_data.pdf')

    >>> find_parser(base, 'https://productparsersa.blob.core.windows.net/documents/vendor/pdf/test_data.pdf')()
    'vendor/pdf'

    >>> find_parser(base, 'https://productparsersa.blob.core.windows.net/documents/vendor2/image/image.jpg')()
    'vendor2/image'

    >>> find_parser(base, '/documents/vendor2/image/image.jpg')()
    'vendor2/image'

    >>> find_parser(base, '/documents/vendor2/image/image.jpg/ocr.json')()
    'vendor2/image'

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
