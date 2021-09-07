import scrapy
import re


class MariposaSpider(scrapy.Spider):
    name = 'Mariposa'
    start_urls = ['http://angelscraftusa.com/']

    def parse(self, response, **kwargs):
        """This function extracts and loops category urls.

        @url http://angelscraftusa.com/
        @returns items 0
        @returns requests 16
        @request https://angelscraftusa.com/craft-essentials/
        """

        categories = response.xpath('//nav[@class="navPages"]/div/div/ul/li/a/@href').extract()
        yield from response.follow_all(categories, self.parse_category)

    def parse_category(self, response):
        """This function extracts and loops products urls.

        @url http://angelscraftusa.com/categories/flowers.html
        @returns items 0
        @returns requests 0 13
        @request https://angelscraftusa.com/flowers/flr-073-canvas-flower-patch-w-wood-bead-mauve-pink/
        """

        products = response.xpath('//figure[@class="card-figure"]/a/@href').extract()
        for product in products:
            yield response.follow(product, callback=self.parse_product)

        has_next = response.xpath('//li[@class="pagination-item pagination-item--next"]/a/@href').extract_first()
        if has_next:
            yield response.follow(has_next, callback=self.parse_category)

    def parse_product(self, response):
        """This function extracts data from 1 item page.

        @url https://angelscraftusa.com/flowers/fds-002-floral-tape
        @returns items 1
        @returns requests 0
        @scrapes VENDORID VENDOR ITEMNO UPC CATEGORY DESCRIPTION IMAGE_URL CASEPACK PAGE_TITLE PAGE_URL
        @item \
            @VENDORID 19 \
            @VENDOR MARIPOSA \
            @ITEMNO FDS-002 \
            @UPC 819887029970 \
            @CATEGORY Flowers \
            @DESCRIPTION Floral Tape (Light Green), 12mm, 30yard \
            @IMAGE_URL https://cdn11.bigcommerce.com/s-p93tlqifci/images/stencil/608x608/products/
                2844/3298/FDS-001__24074.1607369620.JPG?c=2 \
            @CASEPACK 240 \
            @PAGE_TITLE FDS-002 Floral Tape - Angels Craft\
            @PAGE_URL http://angelscraftusa.com/flowers/fds-002-floral-tape/
        """

        product_title = response.xpath('//meta[@property="og:title"]/@content').get().replace('"', '')
        upc = response.xpath('//dd[contains(@class, "info-value--upc")]/text()').get()

        description_items = response.xpath('//div/div[@itemprop="description"]/p/text()').extract()
        case_pack = ''

        for description_item in description_items:
            if re.search(r'Case Pack:.*', description_item):
                case_pack = re.search(r'Case Pack:.*', description_item).group(0).replace('Case Pack:', '').strip()

            if not upc and re.search(r'UPC #:.*', description_item):
                upc = re.search(r'UPC #:.*', description_item).group(0).replace('UPC #:','').strip()

        if not case_pack:
            case_pack = response.xpath(f'//div[contains(@class,"info-value--cfCase")]/text()').get()

        yield {
            "VENDORID": 19,
            "VENDOR": 'MARIPOSA',
            "ITEMNO": response.xpath('//dd[contains(@class,"info-value--sku")]/text()').get(),
            "UPC": upc,
            "CATEGORY": response.xpath('//main/ul/li[2]/a/span/text()').get(),
            "DESCRIPTION": response.xpath('//div/div[@itemprop="description"]/p/text()').extract_first(),
            "IMAGE_URL": response.xpath(f'//img[contains(@title, "{product_title}")]/@src').get(),
            "COST": None,
            "CASEPACK": case_pack,
            "PK_SIZE": None,
            "DESCRIPTION2": None,
            "PAGE_TITLE": response.css('title::text').get(),
            "PAGE_URL": response.request.url
        }
