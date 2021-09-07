import re

import scrapy

from data_scraping.common import parse_product


class SanteeSpider(scrapy.Spider):
    name = 'Santee'
    start_urls = ['https://www.santeecosmeticsusa.com/?s=&post_type=product&count=50']

    def parse(self, response, **kwargs):
        """This function should extract and loop item urls.

        @url https://www.santeecosmeticsusa.com/?s=&post_type=product&count=50
        @request https://www.santeecosmeticsusa.com/product/9-palette-shimmer-eyeshadow/
        @returns items 0
        @returns requests 1 51
        """

        item_links = response.xpath("//a[@class='product-loop-title']/@href").extract()

        yield from response.follow_all(item_links, callback=self.parse_details)

        next_page = response.xpath("//a[@class='next page-numbers']/@href").get()
        if next_page:
            yield response.follow(next_page, callback=self.parse)

    def parse_details(self, response):
        """This function should extract data from 1 item page.

        @url https://www.santeecosmeticsusa.com/product/st196/
        @returns items 1
        @returns requests 0
        @item \
            @VENDORID 27 \
            @VENDOR SANTEE \
            @ITEMNO ST196 \
            @CATEGORY LIPS , Lipstick \
            @DESCRIPTION Moisture Lipstick \
            @IMAGE_URL https://www.santeecosmeticsusa.com/wp-content/uploads/2018/11/ST196.jpg \
            @PK_SIZE 48 \
            @CASEPACK 6 \
            @PAGE_TITLE ST196 - Santee Cosmetics USASantee Cosmetics USA \
            @PAGE_URL https://www.santeecosmeticsusa.com/product/st196/
        """

        description = response.xpath("//div[@class='description']/p/text()").get(default='')
        description = re.findall(r'\D+\(', description)[0].replace("(", "") or None

        pk_size = response.xpath("//div[@class='description']/p/text()").get(default='')
        pk_size = re.search(r'\(.+', pk_size)
        if pk_size is not None:
            pk_size = re.findall(r'\d+', pk_size.group(0))[-1]

        casepack = response.xpath("//div[@class='description']/p/text()").get(default='')
        casepack = re.search(r'\(.+', casepack)
        if casepack is not None:
            casepack = re.findall(r'\d+', casepack.group(0))[0]

        yield parse_product(
            VENDORID=27,
            VENDOR='SANTEE',
            ITEMNO=response.xpath("//*[@class='product_title']/text()").get(),
            CATEGORY=" ".join(
                response.xpath("//span[@class='posted_in']//text()").extract()).replace('Categories: ', '') or None,
            DESCRIPTION=description,
            IMAGE_URL=response.xpath("//div[@class='product-essential']//a/@href").get(),
            CASEPACK=casepack,
            PK_SIZE=pk_size,
            PAGE_TITLE=response.css('title::text').get(),
            PAGE_URL=response.request.url
        )
