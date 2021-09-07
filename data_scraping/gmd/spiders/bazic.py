import json
import scrapy


class BazicSpider(scrapy.Spider):
    name = 'Bazic'
    start_urls = ['https://www.bazicstore.com/collections/all']

    def parse(self, response, **kwargs):
        """This function should extract and loop item urls.

        @url https://www.bazicstore.com/collections/all
        @returns items 0
        @returns requests 48
        @request https://www.bazicstore.com/collections/all/products/575.json
        """

        item_links = response.css("a[itemprop='url']::attr(href)").extract()
        item_links = map(lambda link: link + '.json', item_links)
        yield from response.follow_all(item_links, self.parse_details)

        next_page = response.css("span[class='next'] > a::attr(href)").get()
        if next_page is not None:
            next_page = response.urljoin(next_page)
            yield scrapy.Request(next_page, callback=self.parse)

    def parse_details(self, response):
        """This function should extract data from 1 item page.

        @url https://www.bazicstore.com/products/3812.json
        @returns items 1
        @returns requests 0
        @partial {\
            "VENDORID": 9,\
            "VENDOR": "BAZIC", \
            "ITEMNO": "3812-EACH", \
            "UPC": "764608038123", \
            "CATEGORY": "Labels", \
            "DESCRIPTION": "\\"HELLO my name is\\" Name Badge Label (25/Pack)", \
            "DESCRIPTION2": "UNIT - 1 Unit @ $1.79 Per Unit", \
            "IMAGE_URL": "https://cdn.shopify.com/s/files/1/0881/8264/products/3812.jpeg?v=1608655971", \
            "COST": 1.79, \
            "PAGE_URL": "https://www.bazicstore.com/products/3812.json" \
        }
        """

        product = json.loads(response.body)['product']

        for variant in product['variants']:
            yield {
                "VENDORID": 9,
                "VENDOR": 'BAZIC',
                "ITEMNO": variant['sku'],
                "UPC": variant['barcode'],
                "CATEGORY": product['product_type'],
                "DESCRIPTION": product['title'],
                "IMAGE_URL": next((x['src'] for x in product['images']), None),
                "COST": float(variant['price']),
                "DESCRIPTION2": variant['option1'],
                "PAGE_URL": response.request.url
            }
