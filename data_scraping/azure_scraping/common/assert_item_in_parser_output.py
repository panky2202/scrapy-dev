import inspect
import os
import shutil

from data_scraping.azure_scraping.common import fetch_ocr_pages, get_ocr_source_url
from data_scraping.common import check_flex_contract, parse_product


def get_function_folder(f):
    """
    >>> get_function_folder(assert_item_in_parser_output).endswith(('azure_scraping/common', 'azure_scraping\\common'))
    True
    """
    return os.path.dirname(os.path.abspath(inspect.getfile(f)))


def assert_item_in_parser_output(parser, url, **kwargs):
    images_path = os.path.join(get_function_folder(parser), 'assert_item_in_parser_output')

    shutil.rmtree(images_path, ignore_errors=True)
    os.makedirs(images_path, exist_ok=True)

    results = parser(list(fetch_ocr_pages(url)), get_ocr_source_url(url))
    images, raw_products = zip(*results)

    if not images or not raw_products:
        return

    products = [parse_product(**p, PAGE_URL=url) for p in raw_products if p]

    for i, (image, product) in enumerate(zip(images, products)):
        try:
            if not product:
                continue
            name = product['ITEMNO'].replace('/', '-') if 'ITEMNO' in product else str(i)
            image.save(
                os.path.join(images_path, f'{name}.jpg'),
                format='JPEG'
            )
        except:
            pass

    check_flex_contract(kwargs, products)
