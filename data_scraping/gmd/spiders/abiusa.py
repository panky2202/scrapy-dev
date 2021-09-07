import scrapy

from data_scraping.gmd.spiders.common import extract_casepack_from_description


class ABIUSASpider(scrapy.Spider):
    name = 'abiusa'
    start_urls = ['http://abiusagroup.com/shop/']

    def parse_product(self, response):
        """ Parse a product page.

        @url http://abiusagroup.com/product/royal-blue-peva-table-cover-rolls/
        @returns items 1
        @partial {\
            "VENDORID": 4,\
            "VENDOR": "ABI USA Group",\
            "PAGE_URL": "http://abiusagroup.com/product/royal-blue-peva-table-cover-rolls/",\
            "ITEMNO": "TCW/RBL",\
            "CATEGORY": "Party Supplies",\
            "DESCRIPTION": "ROYAL BLUE PEVA TABLE COVER ROLLS",\
            "DESCRIPTION2": "40′′ x 100 ft 8 Rolls/Case Available in different colors: Lavender, Purple, Light Pink, Hot Pink, Fuchsia, Red, Brown, Orange, Light Yellow, Dark Yellow, Neon Green, Green, Light Blue, Turquoise, Royal Blue, Ivory, White, Black, Gold (Metallic), Silver (Metallic).",\
            "CASEPACK": "8",\
            "PAGE_TITLE": "ROYAL BLUE PEVA TABLE COVER ROLLS – ABI USA Group",\
            "IMAGE_URL": "http://abiusagroup.com/wp-content/uploads/2015/12/ROYAL_BLUE__78509_1450395050_1280_1280.jpg"\
        }
        """
        categories = response.css("nav.breadcrumbs a").xpath(".//text()").getall()
        desc = response.xpath("//meta[contains(@property, 'og:title')]/@content").get()
        desc2 = ' '.join(response.xpath("//*[@id='tab-description']//text()").getall())

        yield {
            "VENDORID":4,
            "VENDOR":"ABI USA Group",
            "ITEMNO":response.css("span.sku::text").get(),
            "UPC":None,
            "CATEGORY":categories[1] if len(categories) > 1 else None,
            "DESCRIPTION":desc,
            "IMAGE_URL":response.xpath("//meta[contains(@property, 'og:image')]/@content").get(),
            "COST":None,
            "CASEPACK":extract_casepack_from_description(desc + ' ' + desc2),
            "PK_SIZE":None,
            "DESCRIPTION2":desc2,
            "PAGE_TITLE":response.css("title::text").get(),
            "PAGE_URL":response.url,
        }

    def parse(self, response):
        """ Grab product pages.

        @url http://abiusagroup.com/shop/
        @returns requests 10
        @request http://abiusagroup.com/shop/page/2/
        """

        products = response.css(".product-thumbnail-single::attr(href)").getall()
        yield from response.follow_all(products, callback=self.parse_product)
        current_page = response.css(".page-numbers .current")
        next_page = current_page.xpath("../following-sibling::li/a/@href").get()
        if next_page:
            yield scrapy.Request(url=next_page, callback=self.parse)
