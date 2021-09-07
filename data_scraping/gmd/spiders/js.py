import re

import scrapy
from scrapy import Request


class JCSpider(scrapy.Spider):
    name = 'JCSpider'
    start_urls = ['https://www.jcsalesweb.com']

    def parse(self, response, **kwargs):
        """This function should only extract and loop all category urls.

        @url https://www.jcsalesweb.com/
        @returns items 0
        @returns requests 10
        """
        category_links = response.xpath('.//a[contains(@class,"block-brands__item-link")]/@href').extract()
        yield from response.follow_all(category_links, self.parse_main)

    def parse_main(self, response):
        """This function should only extact items data from page.

        @url https://www.jcsalesweb.com/Catalog/Category/3006-Accessories
        @returns items 0
        @returns requests 10
        @scrapes VENDORID VENDOR ITEMNO UPC CATEGORY DESCRIPTION IMAGE_URL COST CASEPACK PK_SIZE DESCRIPTION2 PAGE_TITLE PAGE_URL
        """

        for i in response.xpath('//div[contains(@class,"products-list__item")]'):
            item = {
                "VENDORID": 1055,
                "VENDOR": 'JC SALES',
                "ITEMNO": i.xpath('.//span[contains(text(),"Item No:")]/text()').get().replace('Item No:', '').strip(),
                "DESCRIPTION": i.xpath('.//div[contains(@class,"product-card__name")]//a/text()').get(),
                "IMAGE_URL": i.xpath('.//div[contains(@class,"product-card__image")]//img[1]/@src').get(),
                "PAGE_TITLE": response.css('title::text').get(),
                "PAGE_URL": response.request.url
            }
            yield Request(response.urljoin(i.xpath('.//a[contains(@class,"image__body")]/@href').get()),
                          self.parse_details, meta={'item': item})

        next_page = response.xpath('//a[text()=">"]/@href').get()
        if next_page is not None:
            next_page = response.urljoin(next_page)
            yield scrapy.Request(next_page, callback=self.parse_main)

    def parse_details(self, response):
        item = response.meta['item']
        item['CATEGORY'] = response.xpath('//span[@class = "breadcrumb"][last()]/a/text()').get()
        barcode_text = " ".join(response.xpath('//div[contains(text(), "Barcode:")]/text()').extract())
        upc = re.search(r'\d+', barcode_text)
        item['UPC'] = upc.group(0) if upc is not None else ''
        yield item
