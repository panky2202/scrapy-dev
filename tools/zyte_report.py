import argparse
import json
import os
from types import SimpleNamespace

import requests

from data_scraping.common import parse_product


def zyte(project_id, api_key):
    def get_items_from_zyte():
        """ Get parsed items from Zyte. Returns generator.
        """
        r = requests.get(f'https://storage.scrapinghub.com/items/{project_id}', auth=(api_key, ''), stream=True)
        for line in r.iter_lines():
            if line:
                yield json.loads(line.decode('utf-8'))

    return SimpleNamespace(
        get_items=get_items_from_zyte,
    )


def print_zyte_report(z):
    products = dict()
    for item in z.get_items():
        product = parse_product(**item)
        if not product:
            continue

        key = (item['VENDORID'], item['VENDOR'], item['ITEMNO'])
        products[key] = dict(UPC=product.get('UPC'), IMAGE_URL=product.get('IMAGE_URL'))

    report = {
        'total_items': len(products),
        'items_with_upc': sum(True for x in products.values() if x['UPC']),
        'items_with_image': sum(True for x in products.values() if x['IMAGE_URL']),
        'items_with_upc_and_image': sum(True for x in products.values() if x['UPC'] and x['IMAGE_URL']),
    }

    print(report)


def zyte_report():
    parser = argparse.ArgumentParser(description='Builds report on Zyte data status')
    parser.add_argument('--project_id', '-p', type=int, help='Zyte project id', required=True)
    args = parser.parse_args()

    api_key = os.environ['SHUB_APIKEY']
    project_id = args.project_id

    z = zyte(project_id, api_key)

    print_zyte_report(z)
