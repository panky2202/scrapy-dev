import logging

import azure.functions as func

from data_scraping.azure_scraping.common import store_products_service
from data_scraping.azure_scraping.common.excel import has_excel_extension
from data_scraping.azure_scraping.function_excel_product_parser.find_parser import find_parser
from data_scraping.common import parse_product


def prepare_products(url, products):
    """
    >>> ps = [{'VENDORID': 1, 'VENDOR': 'test', 'ITEMNO': '16', 'UPC': '123456789388'}]
    >>> next(prepare_products('https://test.com/vendor/data.xlsx', ps))
    {'VENDORID': 1, 'VENDOR': 'test', 'PAGE_URL': 'https://test.com/vendor/data.xlsx', 'ITEMNO': '16', 'UPC': '123456789388'}
    """
    for product in products:
        if not product:
            continue
        parsed_product = parse_product(**product, PAGE_URL=url)
        if parsed_product:
            yield parsed_product


def main(blob: func.InputStream):
    logging.info('>>> Parser: Python Blob trigger function processed %s', blob.name)

    url = blob.uri
    if not has_excel_extension(url):
        logging.info(f'>>> Parser: Skipping, not supported blob {url}')
        return

    parser = find_parser('data_scraping.azure_scraping.function_excel_product_parser.scrapers', url)
    if not parser:
        logging.error(f'>>> Skipping, could not find parser for {url}')
        return

    products = list(parser(url))
    logging.info(f'>>> Parser: Found {len(products)} products')

    data = list(prepare_products(url, products))

    if not data:
        return
    products = data

    store_products_service(products)
