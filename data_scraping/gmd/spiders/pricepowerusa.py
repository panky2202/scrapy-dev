import json
import re

import scrapy


class PricePowerUsaSpider(scrapy.Spider):
    name = 'pricepowerusa'
    start_urls = ['https://pricepowerusa.com/shop/']
    categories = {}

    def parse(self, response, **kwargs):
        """
        @url https://pricepowerusa.com/shop/
        @returns requests 10
        @request https://pricepowerusa.com/product-category/bath/
        @request https://pricepowerusa.com/product-category/home-decor/
        @request https://pricepowerusa.com/product-category/seasonal/
        """

        categories = response.xpath('//ul[contains(@class, "ywcca_category_accordion_widget")]/li[ul]/a/@href').getall()
        yield from response.follow_all(categories, self.parse_category)

    def parse_category(self, response):
        """ extracts products from categories with pagination

        @url https://pricepowerusa.com/product-category/kitchen/kitchen-tools/
        @request https://pricepowerusa.com/product/53008/
        """

        products = response.xpath('//div[contains(@class, "product-name")]/a/@href').extract()
        for product in products:
            yield response.follow(product, callback=self.parse_product)

        next_page = response.xpath('//a[contains(@class, "next page-numbers")]/@href').extract_first()
        if next_page:
            yield response.follow(next_page, callback=self.parse_category)

    def parse_product(self, response):
        """ extract product information

        @url https://pricepowerusa.com/product/1010302/
        @returns items 1
        @partial {\
            "VENDORID": 1097,\
            "VENDOR": "PRICE POWER", \
            "ITEMNO": "1010302", \
            "UPC": "840150502722", \
            "CATEGORY": "Cookware, Fry pans & griddles, Recommended", \
            "DESCRIPTION": "Non-Stick 9.5 Fry Pan with lid", \
            "IMAGE_URL": "https://pricepowerusa.com/wp-content/uploads/2021/01/1010302.jpg", \
            "PAGE_TITLE": "1010302 – Price Power Usa", \
            "PAGE_URL": "https://pricepowerusa.com/product/1010302/" \
        }
        """
        product_json = json.loads(
            response.xpath('//script[contains(@type, "application/ld+json")]/text()').extract_first()
        )
        product = product_json['@graph'][1]
        upc_field = response.xpath(
            '//div[contains(@class, "product-cases")]/p[text()[contains(., "UPC")]]/text()'
        ).get()

        yield {
            "VENDORID": 1097,
            "VENDOR": 'PRICE POWER',
            "ITEMNO": product['name'],
            "UPC": re.search('[0-9]+', upc_field).group() if upc_field else None,
            "CATEGORY": ', '.join(response.xpath('//span[contains(@class, "posted_in")]//a/text()').getall()),
            "DESCRIPTION": product['description'],
            "IMAGE_URL": product['image'],
            "PAGE_TITLE": response.css('title::text').get(),
            "PAGE_URL": response.request.url,
        }
