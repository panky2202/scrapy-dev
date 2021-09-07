import re

import scrapy


class BargainSpider(scrapy.Spider):
    name = 'Bargain'
    start_urls = ['https://www.bargainw.com/wholesale/1082/Wholesale-Products.html']

    def parse(self, response, **kwargs):
        """This function should extract and loop item urls.

        @url https://www.bargainw.com/wholesale/1082/Wholesale-Products.html
        @returns items 0
        @returns requests 24 100
        """

        item_links = response.xpath("//div[@class='product_name']/a/@href").extract()
        yield from response.follow_all(item_links, self.parse_details)

        next_page = response.xpath('//a[@class="pageNavLink pageNavNext"]/@href').get()
        if next_page is not None:
            next_page = response.urljoin(next_page)
            yield scrapy.Request(next_page, callback=self.parse)

    def parse_details(self, response):
        """This function should extract data from 1 item page.

        @url https://www.bargainw.com/wholesale-product/618537/100-Grand-Bar.html?cid=1082
        @returns items 1
        @returns requests 0
        @scrapes VENDORID VENDOR ITEMNO UPC CATEGORY DESCRIPTION IMAGE_URL COST CASEPACK PK_SIZE DESCRIPTION2 PAGE_TITLE PAGE_URL
        """

        itemno = response.xpath('//td[contains(text(), "Sku#")]/text()').get()
        if itemno is not None:
            itemno = itemno.replace('Sku#', '').strip()
        else:
            itemno = response.xpath("//div[contains(@class, 'product_form')][1]/@data-product").get(default='')
            itemno = re.search(r'"sku":".*?"', itemno)
            itemno = itemno.group(0).replace('"sku":', '').replace('"', '') if itemno is not None else None

        image_url = response.urljoin(response.xpath("//img[@class='img-responsive cloudzoom-gallery']/@src").get(
            default='').replace(' ', ''))
        if image_url is not None:
            image_url = image_url.replace('thumb', 'detailsbig')

        cost = response.xpath("//span[@class='price_value']/text()").get()
        if cost is not None:
            cost = float(cost.replace('$', '').strip())

        category = response.xpath("//div[normalize-space(text())='Category']/following-sibling::div/text()").get(
            default='').strip()
        if category == '':
            category = None

        pk_size = response.xpath(
            "//div[div[@class='spec_title' and contains(text(), 'Case Quantity')]]/div[@class='spec_info']/text()").get(
            default='').strip()
        if pk_size == '':
            pk_size = None

        upc = response.xpath("//span[@class='upc_value']/text()").get(default='').replace('#', '').strip()
        if upc == '':
            upc = None

        description2 = response.xpath(
            "//div[div[@class='spec_title' and contains(text(), 'System Name')]]/div[@class='spec_info']/text()").get(
            default='').strip()
        if description2 == '':
            description2 = None

        yield {
            "VENDORID": 1148,
            "VENDOR": 'BARGAIN',
            "ITEMNO": itemno,
            "UPC": upc,
            "CATEGORY": category,
            "DESCRIPTION": response.xpath("//div[@class='details_cateory_name']/text()").get(default='').strip(),
            "IMAGE_URL": image_url,
            "COST": cost if cost > 0 else None,
            "CASEPACK": response.xpath("//span[@class='casepack_value']/text()").get(default='').strip(),
            "PK_SIZE": pk_size,
            "DESCRIPTION2": description2,
            "PAGE_TITLE": response.css('title::text').get(),
            "PAGE_URL": response.request.url
        }
