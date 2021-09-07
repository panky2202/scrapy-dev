import json

import scrapy


class HandscraftSpider(scrapy.Spider):
    name = 'handscraft'
    start_urls = ['https://www.handscraft.com']

    def parse(self, response, **kwargs):
        """ Grabbing category pages from handscraft.

        @url https://www.handscraft.com
        @returns requests 5
        @request https://www.handscraft.com/collections/hands-craft-diy-3d-wooden-puzzle-diy-model-kits-craft-kits-3d-wooden-puzzle
        @request https://www.handscraft.com/collections/music-box
        """

        categories = response.xpath('//*[@id="site-navigation"]//ul//a/@href').extract()
        yield from response.follow_all(categories, self.parse_category)

    def parse_category(self, response):
        """ Grabbing category with pagination.

        @url https://www.handscraft.com/collections/hands-craft-diy-3d-wooden-puzzle-diy-model-kits-craft-kits-3d-wooden-puzzle
        @returns requests 5
        """

        products = response.xpath('//a[contains(@class, "product-item")]/@href').extract()
        for product in products:
            yield response.follow(product, callback=self.parse_product)

        next_page = response.xpath('//div[contains(@class, "box__paginate")]//a/@href').extract_first()
        if next_page:
            yield response.follow(next_page, callback=self.parse_category)

    def parse_product(self, response):
        """ Grabbing product.

        @url https://www.handscraft.com/products/mc701-diy-3d-wooden-puzzle-army-suv
        @returns items 1
        @partial {\
            "VENDORID": 1100,\
            "VENDOR": "HANDSCRAFT", \
            "ITEMNO": "MC701", \
            "UPC": "850005994510", \
            "CATEGORY": "DIY 3D Wooden Puzzle", \
            "DESCRIPTION": "3D Wooden Puzzle | Military Vehicle", \
            "DESCRIPTION2": "MC701, DIY 3D Wooden Puzzle. Military 4 Wheeler.1:18 Scale Military Field Car.Rugged off-road wheels and weapon decoration.Vivid Detailing. Ages 14+.Assembled Size: 7.44 x 3.9 x 3.5 Inches.", \
            "IMAGE_URL": "https://cdn.shopify.com/s/files/1/2464/1049/products/eeb6a4ea-86fc-51be-a984-4024ca956daa_1024x.gif?v=1594769517", \
            "COST": 24.99, \
            "PAGE_TITLE": "3D Wooden Puzzle | Military Vehicle– Hands Craft US, Inc.", \
            "PAGE_URL": "https://www.handscraft.com/products/mc701-diy-3d-wooden-puzzle-army-suv" \
        }
        """

        product = json.loads(
            response.xpath('//script[contains(@type, "application/ld+json")]/text()').extract_first()
        )
        for offer in product['offers']:
            yield {
                "VENDORID":1100,
                "VENDOR":'HANDSCRAFT',
                "ITEMNO":offer['sku'],
                "UPC":product['gtin12'],
                "CATEGORY":product['category'],
                "DESCRIPTION":product['name'],
                "IMAGE_URL":product['image']['url'],
                "COST":offer['price'],
                "CASEPACK":None,
                "PK_SIZE":None,
                "DESCRIPTION2": product['description'].replace('\n', '').replace('Scale\xa0Military', 'Scale Military'),
                "PAGE_TITLE":response.css('title::text').get(),
                "PAGE_URL":response.request.url,
            }
