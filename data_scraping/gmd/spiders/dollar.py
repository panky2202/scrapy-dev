import scrapy


class DollarSpider(scrapy.Spider):
    name = 'Dollar'
    start_urls = ['https://dollarempirellc.com/index.php?main_page=products_all&disp_order=4']

    def parse(self, response, **kwargs):
        """This function should extract and loop item urls.

        @url https://dollarempirellc.com/index.php?main_page=products_all&disp_order=4
        @returns items 0
        @returns requests 100
        """

        item_links = response.xpath('//div[@class="product_name"]/a/@href').extract()
        yield from response.follow_all(item_links, self.parse_details)

        next_page = response.xpath('//a[contains(@title,"Next Page")]/@href').extract_first()
        if next_page:
            yield response.follow(next_page, callback=self.parse)

    def parse_details(self, response):
        """This function should extract data from 1 item page.

        @url https://dollarempirellc.com/index.php?main_page=product_info&cPath=10_96&products_id=8474
        @returns items 1
        @returns requests 0
        @partial {\
            "VENDORID": 1051,\
            "VENDOR": "DOLLAR EMPIRE",\
            "ITEMNO": "18065",\
            "CATEGORY": "Home & Houseware",\
            "DESCRIPTION": "Round Laundry Basket with Handle Size: 13.25\\" Dia x 8.5\\" H Packing: 12/BX 48/CTN Lightweight And Durable Basket To Hold Dirty Or Clean Laundry",\
            "IMAGE_URL": "https://dollarempirellc.com/images/18065.JPG",\
            "PAGE_TITLE": "18065 : Wholesale 99 cents Items, Dollar Store Items, and Discount Stores.",\
            "PAGE_URL": "https://dollarempirellc.com/index.php?main_page=product_info&cPath=10_96&products_id=8474"\
        }
        """

        yield {
            "VENDORID":1051,
            "VENDOR":'DOLLAR EMPIRE',
            "ITEMNO":response.xpath('//*[@id="productName"]/text()').get(),
            "UPC":None,
            "CATEGORY":response.xpath('//div[@id="navBreadCrumb"]/a[2]/text()').get(),
            "DESCRIPTION":''.join(response.xpath('//div[@id="productDescription"]/text()').extract()),
            "IMAGE_URL":response.urljoin(response.xpath('//div[@id="productMainImage"]/div/a/@href').get()),
            "COST":None,
            "CASEPACK":None,
            "PK_SIZE":None,
            "DESCRIPTION2":None,
            "PAGE_TITLE":response.css('title::text').get(),
            "PAGE_URL":response.request.url
        }
