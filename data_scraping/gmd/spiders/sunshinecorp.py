import json
import re

import scrapy

from data_scraping.common import parse_product
from data_scraping.gmd.spiders.common import extract_casepack_from_description, extract_cost_from_usd_price


def extract_category(tags):
    """
    >>> extract_category(['04 - Boys Underwear', 'bottoms', 'mens'])
    ' Boys Underwear'

    >>> extract_category([])

    >>> extract_category(None)
    """
    if not tags:
        return
    return next((x.split('-')[-1] for x in tags), None)


def get_pricing_url(product_id):
    return f"https://volumediscount.hulkapps.com/shop/get_offer_table?pid={product_id}&store_id=sunshine-int-l-corporation.myshopify.com"


class SunshineCorpSpider(scrapy.Spider):
    name = 'sunshinecorp'
    start_urls = ['https://sunshine5866.com/collections']

    def parse(self, response, **kwargs):
        """ Grabbing category pages from sunshinecorp.

        @url https://sunshine5866.com/collections
        @returns requests 5
        @request https://sunshine5866.com/collections/ladies-panties
        @request https://sunshine5866.com/collections/07-t-shirts-a-shirt
        """

        categories = response.xpath('//a[contains(@class, "collection-grid-item__link")]/@href').extract()
        yield from response.follow_all(categories, self.parse_category)

    def parse_category(self, response):
        """ Grabbing products from sunshinecorp.

        @url https://sunshine5866.com/collections/ladies-panties
        @request https://sunshine5866.com/collections/ladies-panties/products/l413c-s
        @request https://sunshine5866.com/collections/ladies-panties?page=2
        """

        products = response.xpath('//a[contains(@class, "grid-view-item__link")]/@href').extract()
        for product in products:
            yield response.follow(product, callback=self.parse_product)

        next_page = response.xpath('//a[contains(@class, "btn--narrow")]/@href').extract_first()
        if next_page:
            yield response.follow(next_page, callback=self.parse_category)

    def parse_product(self, response):
        """ Grabbing product from sunshinecorp.

        @url https://sunshine5866.com/collections/ladies-panties/products/l413c-s
        @item \
            @VENDOR SUNSHINE CORP \
            @ITEMNO l413c/s \
            @UPC 7591295041371 \
            @CASEPACK 24 \
            @PAGE_TITLE Ladies' 100% Cotton Panty – Sunshine Int’l Corporation \
            @CATEGORY Ladies Panties \
            @PAGE_URL https://sunshine5866.com/collections/ladies-panties/products/l413c-s \
            @DESCRIPTION Ladies' 100% Cotton Panty - S \
            @DESCRIPTION2 Prices are per dozen. Box Quantity: 24 DZ - S (6), M (6), L (6), XL (6) \
            @IMAGE_URL https://cdn.shopify.com/s/files/1/0460/2088/6687/products/LkI0PX2.jpg?v=1602289861
        """

        data = re.search(r'window.hulkapps.product = (.*)window.hulkapps.product_collection = \[', response.text,
                         flags=re.M | re.S).group(1)
        product = json.loads(data)
        for variant in product['variants']:
            yield parse_product(
                VENDORID=32,
                VENDOR='SUNSHINE CORP',
                ITEMNO=variant['sku'],
                UPC=variant['barcode'],
                CASEPACK=extract_casepack_from_description(product['description']),
                PK_SIZE=None,
                PAGE_TITLE=response.css('title::text').get(),
                CATEGORY=extract_category(product['tags']),
                PAGE_URL=response.request.url,
                DESCRIPTION=variant['name'],
                DESCRIPTION2=product['description'],
                IMAGE_URL=next((x['src'] for x in product['media']), None)
            )
