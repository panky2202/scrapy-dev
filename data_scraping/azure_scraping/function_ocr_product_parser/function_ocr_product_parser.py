import logging

import azure.functions as func

from data_scraping.azure_scraping.common import is_ocr_data_url, fetch_ocr_pages, get_ocr_source_url, \
    store_products_service, store_products_images_service
from data_scraping.azure_scraping.common.find_parser import find_parser
from data_scraping.azure_scraping.function_ocr_product_parser.get_product_image_url import get_product_image_url
from data_scraping.common import parse_product


def prepare_products(ocr_url, products):
    """
    >>> ps = [('image', {'VENDORID': 1, 'VENDOR': 'test', 'ITEMNO': '16', 'UPC': '123456789'})]
    >>> next(prepare_products('https://test.com/vendor/data.pdf/ocr.json', ps))
    (('https://test.com/images/1_16.jpg', 'image'), {'VENDORID': 1, 'VENDOR': 'test', 'PAGE_URL': 'https://test.com/vendor/data.pdf', 'ITEMNO': '16', 'IMAGE_URL': 'https://test.com/images/1_16.jpg', 'UPC': '123456789'})
    """
    url = get_ocr_source_url(ocr_url)
    for image, product in products:
        if not product:
            continue
        image_url = get_product_image_url(url, product) if image else None
        parsed_product = parse_product(**product, IMAGE_URL=image_url, PAGE_URL=url)
        if parsed_product:
            yield (image_url, image), parsed_product


def main(blob: func.InputStream):
    logging.info('>>> Parser: Python Blob trigger function processed %s', blob.name)

    url = blob.uri
    if not is_ocr_data_url(url):
        logging.info(f'>>> Parser: Skipping, not supported blob {url}')
        return

    parser = find_parser('data_scraping.azure_scraping.function_ocr_product_parser.scrapers', url)
    if not parser:
        logging.error(f'>>> Skipping, could not find parser for {url}')
        return

    products = list(parser(fetch_ocr_pages(url), get_ocr_source_url(url)))
    logging.info(f'>>> Parser: Found {len(products)} products')

    data = list(zip(*prepare_products(url, products)))

    if not data:
        return
    images, products = data

    store_products_images_service(images)
    store_products_service(products)
