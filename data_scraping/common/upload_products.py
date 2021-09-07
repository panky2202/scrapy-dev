from gql import Client, gql
from gql.transport.requests import RequestsHTTPTransport

from data_scraping.common import parse_product


def upload_products(scraping_api, products):
    products = [x for x in products if x]
    if not products or not scraping_api:
        print('---> Skipping upload_products')
        return

    print('---> upload_products', len(products))
    client = Client(transport=RequestsHTTPTransport(url=scraping_api, retries=5))
    params = {"products": [map_product(x) for x in products]}
    results = client.execute(gql(
        """
        mutation scrapy($products: [AddProductInput!]!) {
          addProducts(input: {products: $products}) {
            success
            message
          }
        }
        """
    ), variable_values=params)
    return results


def map_product(item):
    """
    >>> map_product(parse_product(
    ... VENDORID=1,
    ... VENDOR='SAMPLE_VENDOR',
    ... PAGE_URL='https://example.com',
    ... ITEMNO='test item 1',
    ... IMAGE_URL='https://example.com/image.jpg',
    ... COST='12.3333',
    ... UPC='725272730430',
    ... CATEGORY='test',
    ... DESCRIPTION='test test',
    ... CASEPACK='pk10',
    ... PK_SIZE='size 10',
    ... DESCRIPTION2='test test test',
    ... PAGE_TITLE='testing title',
    ... ))
    {'vendorId': '1', 'itemNo': 'test item 1', 'category': 'test', 'upc': '725272730430', 'description': 'test test', 'description2': 'test test test', 'imageUrl': 'https://example.com/image.jpg', 'sourceUrl': 'https://example.com', 'pkSize': 'size 10', 'price': '12.3333'}
    """
    res = {
        'vendorId': item.get('VENDORID'),
        'itemNo': item.get('ITEMNO'),
        'category': item.get('CATEGORY'),
        'upc': item.get('UPC'),
        'description': item.get('DESCRIPTION'),
        'description2': item.get('DESCRIPTION2'),
        'imageUrl': item.get('IMAGE_URL'),
        'sourceUrl': item.get('PAGE_URL'),
        'pkSize': item.get('PK_SIZE'),
        'price': item.get('COST'),
    }

    return {k: str(v) for k, v in res.items() if v is not None}
