import json
import re

import scrapy


def extract_product_url(url):
    """
    >>> extract_product_url('https://tovlev.com/products/857436-01383-4.json')
    'https://tovlev.com/products/857436-01383-4'
    """
    m = re.compile("(.*).json")
    return m.search(url).group(1)


class TovLevSpider(scrapy.Spider):
    name = 'tovlev'
    start_urls = ['https://tovlev.com/collections/all']

    def parse(self, response, **kwargs):
        """ Grab product urls and go to next page

        @url https://tovlev.com/collections/all
        @returns requests 9
        @request https://tovlev.com/collections/all?page=2
        """
        products = response.css(".tt-product")
        for item in products:
            url = item.css("a::attr(href)").get()
            yield response.follow(f"{url}.json", callback=self.parse_product)

        next_page = response.css("a.autoscroll::attr(href)").get()
        if next_page:
            yield response.follow(next_page, self.parse)

    def parse_product(self, response):
        """ Grabbing product.

        @url https://tovlev.com/collections/all/products/886946-49834-3.json
        @returns items 1
        @partial {\
            "VENDORID": 1086,\
            "VENDOR": "TOV LEV",\
            "ITEMNO": "1788489",\
            "UPC": "886946498343",\
            "DESCRIPTION": "10.5in Moderno Dinner Plate by Libbey",\
            "COST": 1.15,\
            "IMAGE_URL": "https://cdn.shopify.com/s/files/1/0323/8726/8667/products/1788489.jpg?v=1589923010",\
            "CATEGORY": "Kitchen, Catering & Restaurant Supplies",\
            "DESCRIPTION2": "6 / 6 / 0.51 Cubic Ft.",\
            "PAGE_TITLE": "10.5in Moderno Dinner Plate by Libbey",\
            "PAGE_URL": "https://tovlev.com/collections/all/products/886946-49834-3"\
        }
        """

        product = json.loads(response.body)['product']

        for variant in product['variants']:
            yield {
                "VENDORID":1086,
                "VENDOR":'TOV LEV',
                "ITEMNO":variant['sku'],
                "UPC":variant['barcode'],
                "CATEGORY":product['product_type'],
                "DESCRIPTION":product['title'],
                "DESCRIPTION2":variant['title'],
                "IMAGE_URL":product['image']['src'] if product['image'] else None,
                "COST":variant['price'],
                "PAGE_TITLE":product['title'],
                "PAGE_URL":extract_product_url(response.url)
            }
