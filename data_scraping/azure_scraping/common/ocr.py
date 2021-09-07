import io
import json
import re
from itertools import chain

from PIL import Image
from pdf2image import convert_from_bytes

from data_scraping.azure_scraping.common import extract_extension, azure_blob_service


def is_ocr_data_url(url):
    return url.endswith('ocr.json')


def has_ocr_extension(url):
    return extract_extension(url) in ['pdf', 'png', 'jpg', 'jpeg', 'tif', 'tiff']


def url_supports_ocr(url):
    """
    >>> url_supports_ocr('hello.zip')
    False

    >>> url_supports_ocr('hello.jpg')
    True

    >>> url_supports_ocr('.jpg')
    True

    >>> url_supports_ocr('documents/example/test_data.pdf/1_00004.jpg')
    False

    >>> url_supports_ocr('documents/example/test_data.jpg/1_00004.jpg')
    False

    >>> url_supports_ocr('example/test_data.jpg/1_00004.jpg')
    False
    """
    parts = url.split('/')
    if len(parts) > 2:
        if has_ocr_extension(parts[-2]):
            return False
    return has_ocr_extension(url)


def get_ocr_data_url(url):
    """
    >>> get_ocr_data_url('https://productparsersa.blob.core.windows.net/documents/example/test_data.pdf')
    'https://productparsersa.blob.core.windows.net/documents/example/test_data.pdf/ocr.json'

    >>> get_ocr_data_url('https://productparsersa.blob.core.windows.net/documents/example/test_data.json')

    >>> get_ocr_data_url('test_data.pdf')
    'test_data.pdf/ocr.json'

    >>> get_ocr_data_url('https://productparsersa.blob.core.windows.net/documents/example/test_data.pdf/ocr.json')
    'https://productparsersa.blob.core.windows.net/documents/example/test_data.pdf/ocr.json'
    """
    if is_ocr_data_url(url):
        return url
    return '/'.join(url.split('/') + ['ocr.json']) if url_supports_ocr(url) else None


def get_ocr_source_url(ocr_url):
    """
    >>> get_ocr_source_url('https://productparsersa.blob.core.windows.net/documents/example/test_data.pdf/ocr.json')
    'https://productparsersa.blob.core.windows.net/documents/example/test_data.pdf'

    >>> get_ocr_source_url('https://productparsersa.blob.core.windows.net/documents/example/test_data.pdf')
    'https://productparsersa.blob.core.windows.net/documents/example/test_data.pdf'

    >>> get_ocr_source_url('https://productparsersa.blob.core.windows.net/documents/example/test_data.json')

    >>> get_ocr_source_url('test_data.pdf')
    'test_data.pdf'
    """
    result = '/'.join(ocr_url.split('/')[:-1]) if is_ocr_data_url(ocr_url) else ocr_url
    return result if url_supports_ocr(result) else None


def fetch_ocr_pages(url):
    ocr_url = get_ocr_data_url(url)
    source_url = get_ocr_source_url(url)

    service = azure_blob_service()
    ocr = json.loads(service.get_blob_data(ocr_url))
    source = service.get_blob_data(source_url)

    if extract_extension(source_url) == 'pdf':
        pdf = source
        images = convert_from_bytes(pdf, dpi=400)
        yield from zip(images, ocr)
    else:
        image = Image.open(io.BytesIO(source))
        yield image, list(chain(*list(ocr)))


def extract_ocr_pattern(pattern, string, occurrence=1, multiline=False):
    """OCR-specific pattern extraction. Takes into account common OCR errors.

    >>> extract_ocr_pattern(r'LOL(.*)INTERNET', 'LOL   ..:. \\n 42 \\n  ..:: INTERNET')
    '42'

    >>> extract_ocr_pattern(r'IMPOSSIBLE', 'some error string')
    """
    if not string:
        return
    search = re.search(pattern, string, flags=re.DOTALL if not multiline else (re.DOTALL | re.MULTILINE))
    return search.group(occurrence).strip('.: \n').replace('\n', ' ') if search else None


def has_excel_extension(url):
    return extract_extension(url) in ['xls', 'xlsx', 'xlsb', 'xlsm']
