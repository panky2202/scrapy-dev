import json

import scrapy

from data_scraping.gmd.spiders.common import extract_casepack_from_description


class CBBSpider(scrapy.Spider):
    name = 'CBB'
    start_urls = ['https://cbbgroup.com/collections/all']

    def parse(self, response):
        """This function should extract and loop item urls.

        @url https://cbbgroup.com/collections/all
        @returns items 0
        @returns requests 20
        @request https://cbbgroup.com/products/sb-7014
        @request https://cbbgroup.com/collections/all?page=2
        """

        item_links = response.xpath("//a[@class='grid-link']/@href").extract()
        yield from response.follow_all(item_links, self.parse_details)

        next_page = response.xpath("//a[contains(@title, 'Next')]/@href").extract_first()
        if next_page:
            yield response.follow(next_page, callback=self.parse)

    def parse_details(self, response):
        """This function should extract data from 1 item page.

        @url https://cbbgroup.com/products/sb-7014
        @returns items 1
        @returns requests 0
        @partial {\
            "VENDORID": 1133,\
            "VENDOR": "CBB",\
            "ITEMNO": "SB-7014",\
            "CATEGORY": "Soccer Balls",\
            "DESCRIPTION": "#2 SOCCER NN 3 COL MIX",\
            "IMAGE_URL": "https://cdn.shopify.com/s/files/1/0507/1536/1476/products/SB-7014.jpg?v=1609194691",\
            "PK_SIZE": "96",\
            "CASEPACK": "1", \
            "COST": 277.44, \
            "PAGE_TITLE": "#2 SOCCER NN 3 COL MIX – CBB Group Inc.",\
            "PAGE_URL": "https://cbbgroup.com/products/sb-7014"\
        }
        """

        product_text = response.xpath("//script[@id='ProductJson-product-template']/text()").extract_first()
        product = json.loads(product_text)

        for variant in product['variants']:
            yield {
                "VENDORID":1133,
                "VENDOR":'CBB',
                "ITEMNO":variant['sku'],
                "UPC":variant['barcode'],
                "CATEGORY":product['type'],
                "DESCRIPTION":variant['name'],
                "IMAGE_URL":next((x['src'] for x in product['media']), None),
                "COST":float(variant['price']) / 100.0,
                "CASEPACK":1,
                "PK_SIZE":extract_casepack_from_description(product['description']),
                "DESCRIPTION2":product['description'],
                "PAGE_TITLE":response.css('title::text').get(),
                "PAGE_URL":response.request.url
            }
