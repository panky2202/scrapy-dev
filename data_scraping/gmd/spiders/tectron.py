import re

import scrapy


class TectronSpider(scrapy.Spider):
    name = 'Tectron'
    start_urls = ['https://tectronint.squarespace.com/']

    def parse(self, response):
        category_links = response.xpath('//a[contains(@href, "https://tectronint.squarespace.com/")]/@href').extract()
        yield from response.follow_all(category_links, self.parse_main)

    def parse_main(self, response):
        item_links = response.xpath('//div[@class="summary-title"]/a/@href').extract()
        yield from response.follow_all(item_links, self.parse_details)

    def parse_details(self, response):
        item = {
            'VENDORID': '1113',
            'VENDOR': 'TECTRON',
            'ITEMNO': '',
            'UPC': '',
            'CATEGORY': '',
            'DESCRIPTION': response.xpath('//h1[@class="ProductItem-details-title"]/text()').get(),
            'IMAGE_URL': response.xpath('//div[@class="ProductItem-gallery-slides"]//img[1]/@data-src').get(),
            'COST': response.xpath('//div[@class="product-price"]/span[1]/text()').get(),
            'CASEPACK': '',
            'PK_SIZE': '',
            'DESCRIPTION2': response.xpath('//meta[@name="description"]/text()').get(),
            'PAGE_TITLE': response.css('title::text').get(),
            'PAGE_URL': response.request.url
        }

        description_text = response.xpath('//meta[@name="description"]/@content').get()
        item['ITEMNO'] = re.search(r'Item no\.:.*', description_text).group(0).replace('Item no.:',
                                                                                       '').strip() if re.search(
            r'Item no\.:.*', description_text) is not None else ''
        item['UPC'] = re.search(r'UPC Code:.*', description_text).group(0).replace('UPC Code:',
                                                                                   '').strip() if re.search(
            r'UPC Code:.*', description_text) is not None else ''
        item['CASEPACK'] = re.search(r'Case Pack: \d+', description_text).group(0).replace('Case Pack:',
                                                                                           '').strip() if re.search(
            r'Case Pack: \d+', description_text) is not None else ''

        yield item
