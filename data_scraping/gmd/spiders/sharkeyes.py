import re
import scrapy


class SharkeyesSpider(scrapy.Spider):
    name = 'sharkeyes'
    start_urls = ['https://www.sharkeyes.com/']

    def parse(self, response, **kwargs):
        """ Grabbing category pages from sharkeyes.

        @url https://www.sharkeyes.com/
        @returns requests 1 10
        @request https://www.sharkeyes.com/new-arrivals/
        """

        categories = response.css(".has-subMenu::attr(href)").extract()
        yield from response.follow_all(categories, self.parse_category)

    def parse_category(self, response):
        """ Grabbing items from sharkeyes.

        @url https://www.sharkeyes.com/categories/dollar-store-deals.html
        @returns requests 1 20
        @request https://www.sharkeyes.com/products/wholesale-assorted-colors-metal-polycarbonate-uv400-style-sunglasses-case-sgasst300.html
        """

        products = response.css('.card-figure__link::attr(href)').extract()
        for product in products:
            yield response.follow(product, callback=self.parse_product)

        next_page = response.xpath("//a[@aria-label='Next']/@href").extract_first()
        if next_page is not None:
            if next_page:
                yield scrapy.Request(next_page, callback=self.parse_category)

    def parse_product(self, response):
        """ Grabbing items from a category page.

          @url https://www.sharkeyes.com/products/wholesale-assorted-colors-metal-uv400-aviator-fashion-sunglasses-women-1-dozen-with-tags-ds276.html
          @item \
              @VENDORID 1204 \
              @VENDOR SHARK EYES \
              @ITEMNO DS276 \
              @CATEGORY New Arrivals \
              @DESCRIPTION Wholesale Assorted Colors Metal UV400 Aviator Fashion Sunglasses Women | 1 Dozen with Tags | DS276 \
              @IMAGE_URL https://cdn11.bigcommerce.com/s-wz39e45/images/stencil/1280x1280/products/4105/35016/Womens-Shield-Sunglasses-DS276-A__82119.1623259060.jpg?c=2 \
              @PAGE_TITLE Wholesale Assorted Colors Metal UV400 Aviator Fashion Sunglasses Women | 1 Dozen with Tags | DS276 - Shark Eyes, Inc. - Wholesale Sunglasses, Reading Glasses, & Displays \
              @PAGE_URL https://www.sharkeyes.com/products/wholesale-assorted-colors-metal-uv400-aviator-fashion-sunglasses-women-1-dozen-with-tags-ds276.html
          """

        image_url = response.xpath("//a[@itemprop='image']/@href").get()
        description = response.xpath('//meta[@property="og:title"]/@content').get()

        item_no = response.xpath('//dd[@itemprop="sku"]/text()').get()
        if not item_no:
            item_no = description.split('|')[-1]

        category = response.xpath(".//a[@class='breadcrumb-label']/span/text()").extract()
        if len(category) > 0:
            category = category[1]

        description2 = " ".join(response.xpath("//div[@itemprop='description']").extract())

        # extract all unique UPC from description2
        upc = re.findall(r'\d{10,14}', description2)

        # remove duplicates
        unique_upc = list(dict.fromkeys(upc))
        if not unique_upc:
            unique_upc.append("")

        # Iterating the index
        for upc in unique_upc:
            yield {
                "VENDORID": 1204,
                "VENDOR": 'SHARK EYES',
                "ITEMNO": item_no,
                "UPC": upc,
                "CATEGORY": category,
                "DESCRIPTION": description,
                "IMAGE_URL": image_url,
                "PAGE_TITLE": response.css('title::text').get(),
                "PAGE_URL": response.request.url,
            }
