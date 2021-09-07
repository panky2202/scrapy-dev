import json

import scrapy


class KanmaincSpider(scrapy.Spider):
    name = 'kanmainc'
    start_urls = ['https://kanmainc.com/collections/all']

    def parse(self, response):
        """This function should extract and loop item urls.

        @url https://kanmainc.com/collections/all
        @returns items 0
        @returns requests 41
        @request https://kanmainc.com/collections/all?page=2
        """

        item_links = response.css('.grid-uniform a.product-grid-item::attr(href)').getall()
        yield from response.follow_all(item_links, self.parse_details)

        next_page = response.xpath('//ul[@class="pagination-custom"]//a[@title="Next »"]/@href').get()
        if next_page is not None:
            yield response.follow(next_page, callback=self.parse)

    def parse_details(self, response):
        """This function should extract data from 1 item page.

        @url https://kanmainc.com/products/super-soft-quilted-blanket-qb-22-pink
        @returns items 1
        @partial {\
            "VENDORID": 1045,\
            "VENDOR": "KANMA", \
            "ITEMNO": "QB22-BOBK-PIK-B", \
            "UPC": "653552479925", \
            "CATEGORY": "blanket", \
            "DESCRIPTION": "super soft quilted blanket, QB-22 PINK", \
            "DESCRIPTION2": "SUPER SOFT QUILTED BLANKET FILLING 100% POLYESTER SIZE:100*140CM", \
            "IMAGE_URL": "https://cdn.shopify.com/s/files/1/2062/5399/products/QB-22PINK.jpg?v=1594801336", \
            "COST": 21.99, \
            "PAGE_TITLE": "super soft quilted blanket, QB-22 PINK – kanmainc", \
            "PAGE_URL": "https://kanmainc.com/products/super-soft-quilted-blanket-qb-22-pink" \
        }
        """

        json_data = response.css('#ProductJson-product-template ::text').get()
        product = json.loads(json_data)
        for variant in product['variants']:
            yield {
                "VENDORID":1045,
                "VENDOR":'KANMA',
                "ITEMNO":variant['sku'],
                "UPC":variant['barcode'],
                "CATEGORY":product['type'],
                "DESCRIPTION":variant['name'],
                "IMAGE_URL":next((x['src'] for x in product['media']), None),
                "COST":float(variant['price']) / 100.0,
                "CASEPACK":None,
                "PK_SIZE":None,
                "DESCRIPTION2":product['description'],
                "PAGE_TITLE":response.css('title::text').get(),
                "PAGE_URL":response.request.url,
            }
