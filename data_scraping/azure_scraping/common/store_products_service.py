import os

from data_scraping.common import parse_product, upload_products


def store_products_service(products):
    parsed_products = [parse_product(**product) for product in products]
    try:
        scraping_api = os.environ.get('SCRAPING_API')
        upload_products(scraping_api, parsed_products)
    except Exception as e:
        print('Error uploading items:', e)
