import json
import scrapy

from data_scraping.gmd.spiders.common.parse_xml import parse_xml


class BeautyCreationsSpider(scrapy.Spider):
    name = 'beautycreations'

    def start_requests(self):
        """This function should grab a list of item urls

        @request https://www.beautycreationscosmetics.com/products/gel-eye-liner
        @returns requests 1 900
        """
        root = parse_xml('https://www.beautycreationscosmetics.com/sitemap.xml')
        item_list = root.find("sitemap").text
        root = parse_xml(item_list)
        items = root.find_all("loc")
        for item in items:
            yield scrapy.Request(item.text, callback=self.parse)

    def parse(self, response, **kwargs):
        """This function should extract data from 1 item page.

        @url https://www.beautycreationscosmetics.com/collections/35mm-faux-mink-lashes/products/business-talk-35mm-faux-mink
        @returns items 1
        @returns requests 0
        @scrapes VENDORID VENDOR ITEMNO UPC CATEGORY DESCRIPTION IMAGE_URL COST DESCRIPTION2 PAGE_TITLE PAGE_URL
        @partial {\
            "VENDORID": 1120,\
            "VENDOR": "BEAUTY CREATIONS",\
            "ITEMNO": "EL35MM-BUSINESS TALK",\
            "CATEGORY": "35MM FAUX MINK LASHES",\
            "DESCRIPTION": "BUSINESS TALK 35MM FAUX MINK",\
            "IMAGE_URL": "https://cdn.shopify.com/s/files/1/1406/2336/products/BUSINESSTALKSWATCH.jpg?v=1614103205", \
            "DESCRIPTION2": "<meta charset=\\"utf-8\\"><span style=\\"color: #e950b7;\\">From our  \
                  newest line of lashes, our 35MM faux mink lash is here to  \
                  take your look to the next level!</span>", \
            "COST": 6.99, \
            "UPC": "683609864060", \
            "PAGE_TITLE": "BUSINESS TALK 35MM FAUX MINK | BEAUTY CREATIONS COSMETICS",\
            "PAGE_URL": "https://www.beautycreationscosmetics.com/collections/35mm-faux-mink-lashes/products/business-talk-35mm-faux-mink"\
        }
        """
        json_data = response.xpath('//*[@id="shopify-section-product"]/script/text()')
        json_data = json_data.re_first(r"product_json\s*=\s*({.*?});")
        json_obj = json.loads(json_data)

        description = json_obj['title']
        image = 'https:' + json_obj['featured_image']
        item = json_obj['handle']
        description2 = json_obj['description']
        cost = float(json_obj['price'] / 100.0)

        for variant in json_obj['variants']:
            yield {
                "VENDORID": 1120,
                "VENDOR": 'BEAUTY CREATIONS',
                "ITEMNO": variant['sku'],
                "UPC": variant['barcode'],
                "CATEGORY": response.xpath('//ul[contains(@class, "breadcrumbs")]/li[3]/a/text()').get() or None,
                "DESCRIPTION": description,
                "IMAGE_URL": image,
                "COST": cost,
                "DESCRIPTION2": description2,
                "PAGE_TITLE": response.css('title::text').get(),
                "PAGE_URL": response.request.url,
            }
