import json

import scrapy


class AmorusSpider(scrapy.Spider):
    name = 'Amorus'
    start_urls = ['https://www.amorususa.com/collections/all']

    def parse(self, response, **kwargs):
        """This function should extract and loop item urls.

        @url https://www.amorususa.com/collections/all
        @request https://www.amorususa.com/collections/all?page=2
        @returns items 0
        @returns requests 1 41
        """

        item_links = response.xpath("//div[contains(@class,'product')]/div[contains(@class,'product-top')]"
                                    "/a[@class='product-link']/@href").extract()
        yield from response.follow_all(item_links, self.parse_details)

        next_page = response.xpath("//span[@class='next']/a/@href").get()
        if next_page is not None:
            next_page = response.urljoin(next_page)
            yield scrapy.Request(next_page, callback=self.parse)

    def parse_details(self, response):
        """This function should extract data from 1 item page.

        @url https://www.amorususa.com/products/premium-angled-eyeliner-brush-116
        @returns items 1
        @returns requests 0
        @partial {\
            "VENDORID": 1047,\
            "VENDOR": "AMORUS",\
            "UPC": "1444113603656",\
            "ITEMNO": "BR-116",\
            "CATEGORY": "Tools & Brushes",\
            "DESCRIPTION": "116 - Angled Eyeliner Brush",\
            "IMAGE_URL": "https://cdn.shopify.com/s/files/1/1449/3336/products/116_Amorus_USA_Premium_Angled_Eyeliner_Eye_Makeup_Brush_Amor_Us_makeup_cosmetics_brushes_vegan_cruelty_free_a.jpg?v=1569023040",\
            "COST": 3.5, \
            "DESCRIPTION2": "This Premium 116 Angled Eyeliner Brush is designed to give you an effortless makeup application with a bent ferrule and precise brush head. Define your eye look while applying cream, liquid, gel or powder eyeliner with this ultra soft, vegan makeup brush; ideal for eye liner, lip liner or brow gels. What you'll love Soft Synthetic Bristles Custom-cut brush head How to Use Apply product to the tip of the brush and use small, feathered strokes towards the outer corner.",\
            "PAGE_TITLE": "Eyeliner Makeup Brush | Amorus USA",\
            "PAGE_URL": "https://www.amorususa.com/products/premium-angled-eyeliner-brush-116"\
        }
        """

        product_txt = response.xpath("//script[@id='ProductJson-1']/text()").get()
        product = json.loads(product_txt)

        for variant in product['variants']:
            yield {
                "VENDORID":1047,
                "VENDOR":'AMORUS',
                "ITEMNO":variant['sku'],
                "UPC":variant['barcode'],
                "CATEGORY":product['type'],
                "DESCRIPTION":variant['name'],
                "IMAGE_URL":next((x['src'] for x in product['media']), None),
                "COST":float(product['price']) / 100.0,
                "DESCRIPTION2":product['description'],
                "PAGE_TITLE":response.css('title::text').get(),
                "PAGE_URL":response.request.url
            }
