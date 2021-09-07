import scrapy


class FourSeasonsSpider(scrapy.Spider):
    name = 'FourSeasons'
    start_urls = ['https://www.4sgm.com/']

    def parse(self, response, **kwargs):
        """This function should extract category urls and adds ?size 50000 as query parameter to url.

        @url https://www.4sgm.com/
        @request https://www.4sgm.com/category.jhtm?cid=30
        @returns items 0
        @returns requests 10 20
        """

        categories = response.css("#searchCategory > option::attr(value)").extract()
        for category in categories:
            url = f"https://www.4sgm.com/category.jhtm?cid={category}"
            yield response.follow(url, self.parse_categories)

    def parse_categories(self, response):
        """This function should extract item urls.

        @url https://www.4sgm.com/category.jhtm?cid=30
        @request https://www.4sgm.com/product/42801/12-Piece-LOL-Surprise-Mini-Coin-Purse-Set.html
        @returns items 0
        @returns requests 20 50
        """

        items = response.css(".product_name > a::attr(href)").extract()
        yield from response.follow_all(items, self.parse_details)

        next_page = response.css('.pageNavNext::attr(href)').extract_first()
        if next_page:
            yield response.follow(next_page, callback=self.parse_categories)

    def parse_details(self, response):
        """ Grabbing items from a category page.

        @url https://www.4sgm.com/product/30193/384-Page-School-Zone-Coloring-Book.html
        @returns items 1
        @item \
            @VENDORID 13 \
            @VENDOR FOUR SEASONS \
            @ITEMNO 30193 \
            @UPC '076645125026 \
            @CATEGORY Books \
            @DESCRIPTION 384 Page School Zone Coloring Book \
            @IMAGE_URL https://www.4sgm.com/assets/Image/Product/detailsbig/30193.jpg \
            @PAGE_TITLE Wholesale 384 Page School Zone Coloring Book \
            @PAGE_URL https://www.4sgm.com/product/30193/384-Page-School-Zone-Coloring-Book.html
        """

        upc = response.xpath(
            '//div[div[@class="spec_title" and contains(text(), "UPC Number")]]/''div[@class="spec_info"]/text()').get(
            default='').strip()

        yield {
            "VENDORID": 13,
            "VENDOR": 'FOUR SEASONS',
            "ITEMNO": response.css('.details_product_sku::text').get(),
            "UPC": upc,
            "CATEGORY": response.xpath('//ul[contains(@class, "breadcrumb")]//li[3]/a/text()').extract_first(),
            "DESCRIPTION": response.css('.details_product_name::text').get(),
            "IMAGE_URL": response.urljoin(response.css('.details_image_box img::attr(src)').get()),
            "COST": response.css(".unit_price > td::text").get('').replace('$', ''),
            "DESCRIPTION2": response.css('.description_text::text').extract_first(),
            "PAGE_TITLE": response.css('title::text').get(),
            "PAGE_URL": response.request.url
        }
