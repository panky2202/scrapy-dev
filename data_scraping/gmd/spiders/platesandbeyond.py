import scrapy


class platesandbeyondSpider(scrapy.Spider):
    name = 'platesandbeyond'
    start_urls = ['http://www.platesandbeyond.com/ais101/index.php']

    def parse_category(self, response, category):
        """ Grabbing items from a category page.

        @cb_kwargs {"category": "Health and Beauty"}
        @url http://platesandbeyond.com/ais101/itemdisp.php?action=Menu&dept=HEALT
        @returns items 3
        @partial {\
            "VENDORID": 25,\
            "VENDOR": "PLATES AND BEYOND",\
            "ITEMNO": "10298-12",\
            "CATEGORY": "Health and Beauty",\
            "DESCRIPTION": "9oz FEMENINE CARE WASH",\
            "IMAGE_URL": "http://platesandbeyond.com/images/items/10298-12.jpg",\
            "COST": 0.65,\
            "CASEPACK": "12",\
            "PK_SIZE": "12",\
            "PAGE_TITLE": "Plates & Beyond, Plates, Porcelain, Housewares, Baby, Health and Beauty, Plastics, Dollar items",\
            "PAGE_URL": "http://platesandbeyond.com/ais101/itemdisp.php?action=Menu&dept=HEALT"\
        }
        """

        products = response.css(".itdetail01")

        for _, product in enumerate(products):
            product = products[_]
            price = product.xpath(
                f".//input[contains(@name, 'price[{_ + 1}]')]/@value").get()
            if float(price) > 0.0:
                yield {
                    "VENDORID":25,
                    "VENDOR":"PLATES AND BEYOND",
                    "ITEMNO":product.xpath(f".//input[contains(@name, 'itemno[{_ + 1}]')]/@value").get(),
                    "UPC":None,
                    "CATEGORY":category,
                    "DESCRIPTION":product.xpath(f".//input[contains(@name, 'desc1[{_ + 1}]')]/@value").get(),
                    "IMAGE_URL":"http://platesandbeyond.com" + product.css(".detimage01 img::attr(src)").get(),
                    "COST":price,
                    "CASEPACK":product.xpath(f".//input[contains(@name, 'qtcase[{_ + 1}]')]/@value").get(),
                    "PK_SIZE":product.xpath(f".//input[contains(@name, 'qtpack[{_ + 1}]')]/@value").get(),
                    "DESCRIPTION2":None,
                    "PAGE_TITLE":response.css('title::text').get(),
                    "PAGE_URL":response.request.url
                }
        next_page = response.css(".pagenextlink::attr(href)").get()
        if next_page:
            yield scrapy.Request(url=f"http://www.platesandbeyond.com{next_page}", callback=self.parse_category,
                                 cb_kwargs=dict(category=category))

    def parse(self, response):
        """ Grabbing category pages from UPD.

        @url http://www.platesandbeyond.com/ais101/index.php
        @returns requests 23
        @request http://www.platesandbeyond.com/ais101/itemdisp.php?action=Menu&dept=0003
        @request http://www.platesandbeyond.com/ais101/itemdisp.php?action=Menu&dept=TOOLS
        """

        category_links = response.css(".menuitem a::attr(href)").getall()
        category_names = response.css(".menuitem a::text").getall()

        for (name, link) in zip(category_names, category_links):
            yield scrapy.Request(url=f"http://www.platesandbeyond.com/ais101/{link}", callback=self.parse_category,
                                 cb_kwargs=dict(category=name))
