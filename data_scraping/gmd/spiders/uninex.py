import scrapy


class UninexSpider(scrapy.Spider):
    name = 'uninex'
    start_urls = ['https://uninex.com/items/']

    def parse(self, response, **kwargs):
        """ Grabbing category pages from UPD.

        @url https://uninex.com/items/
        @returns requests 1 60
        @request https://uninex.com/ac04etl-4ft-household-extension-cord/
        """
        items = response.xpath("//li[@class='product']//a/@href").extract()
        yield from response.follow_all(items, self.parse_details)

        next_page = response.xpath("//a[@class='pagination-item next']/@href").extract_first()
        if next_page:
            yield scrapy.Request(next_page, callback=self.parse)

    def parse_details(self, response):
        """ Grabbing items from a category page.

        @url https://uninex.com/ac04etl-4ft-household-extension-cord/
        @returns items 1
        @partial {\
            "VENDORID": 1064,\
            "VENDOR": "UNINEX",\
            "ITEMNO": "AC04ETL",\
            "UPC": "602846701693",\
            "DESCRIPTION": "AC04ETL, 4ft Household Extension Cord",\
            "IMAGE_URL": "https://cdn11.bigcommerce.com/s-7zvxpmfeq8/images/stencil/1000x1000/products/477/2923/AC04ETL_box1__79249.1599722095.png?c=1",\
            "CASEPACK": "50pcs",\
            "PAGE_TITLE": "AC04ETL, 4ft Household Extension Cord",\
            "PAGE_URL": "https://uninex.com/ac04etl-4ft-household-extension-cord/"\
        }
        """
        image_url = response.xpath("//img[@class='product-slideshow-image']/@src").get()
        description = response.xpath("//*[@class='single-product-title']/text()").get(default='').strip()
        item_no = response.xpath("//div[@data-product-sku-container]/span[2]/text()").get(default='').strip().replace(
            " ", "")
        upc = response.xpath("//div[ *[contains(text(),'UPC')]]/span[2]/text()").extract()[1]
        category = None
        case = response.xpath("//div[span[contains(text(),'Master Case:')]]/span[2]/text()").get()

        yield {
            'VENDORID': 1064,
            'VENDOR': 'UNINEX',
            'ITEMNO': item_no,
            'UPC': upc,
            'CATEGORY': category,
            'DESCRIPTION': description,
            'IMAGE_URL': image_url,
            'CASEPACK': case,
            'PAGE_TITLE': response.css('title::text').get(),
            'PAGE_URL': response.request.url
        }
