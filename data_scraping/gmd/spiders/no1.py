import scrapy
import re


class No1Spider(scrapy.Spider):
    name = 'no1'
    allowed_domains = ['celaviproducts.com']
    start_urls = ['http://celaviproducts.com/']

    def parse(self, response):
        """This function extracts and loops category urls.

        @url https://celaviproducts.com/
        @returns items 0
        @returns requests 6
        @request https://celaviproducts.com/product-category/beauty-tools/
        """
        categories = response.xpath('//ul[@class="mega-menu-main"]/li/a/@href').extract()
        print(f"categories quantity: {len(categories)}")

        yield from response.follow_all(categories, self.parse_category)

    def parse_category(self, response):
        """This function extracts and loops products urls.

        @url https://celaviproducts.com/product-category/makeup/
        @returns items 0
        @returns requests 0 25
        @request https://celaviproducts.com/products/makeup/lip/cosmls015-5pcs-matte-lipstick/
        """
        products = response.xpath('//div[@class="product-thumbnail"]/a/@href').extract()
        for product in products:
            yield response.follow(product, self.parse_product)

        next_page = response.xpath('//div[@class="nav-links"]/a/@href').extract_first()
        if next_page:
            yield response.follow(next_page, self.parse_category)

    def parse_product(self, response):
        """This function extracts data from 1 item page.

        @url https://celaviproducts.com/products/hair-brushes-tools/hair-brush/diamond-oval-brush/
        @returns items 1
        @returns requests 0
        @scrapes VENDORID VENDOR ITEMNO UPC CATEGORY DESCRIPTION IMAGE_URL PAGE_TITLE PAGE_URL
        @item \
            @VENDORID 23 \
            @VENDOR NO1 \
            @ITEMNO HRXR008 \
            @CATEGORY Hair Brush \
            @DESCRIPTION Celavi Diamond Cushion Oval Brush is an ultra-soft cushion detangler making it perfect for everyday gentle brushing. \
            @IMAGE_URL https://celaviproducts.com/wp-content/uploads/2017/09/hrxr008-840x840.jpg \
            @PAGE_TITLE HRXR008 -Diamond Oval Cushion Brush – CÉLAVI BEAUTY & COSMETICS\
            @PAGE_URL https://celaviproducts.com/products/hair-brushes-tools/hair-brush/diamond-oval-brush/
        """

        upc = None
        description_items = response.xpath('//div[contains(@class, "product-details")]')
        product_detail_row = description_items.xpath('./div[@class="ProductDetail__ProductRow"]')

        if product_detail_row:
            description_items = product_detail_row
        description_items = description_items.xpath('.//text()[normalize-space()]').extract()

        updated_description_items = description_items.copy()
        for description_item in description_items:
            if re.search(r'UPC:.*', description_item):
                upc = re.search(r'UPC:.*', description_item).group(0).replace('UPC:', '').strip()
                updated_description_items.remove(description_item)
                break

        description_section = response.xpath('//div[@class="ProductDetail__productContent"]//text()')
        if description_section:
            main_description = description_section.extract_first()
        else:
            main_description = updated_description_items[-1].strip() if updated_description_items else None

        sku = response.xpath('//span[@class="sku"]/text()').get()
        if not sku:
            product_title = response.xpath('//h1[contains(@class, "product_title")]/text()').get()
            sku = product_title.split(' ')[0]

        yield {
            "VENDORID": 23,
            "VENDOR": 'NO1',
            "ITEMNO": sku,
            "UPC": upc,
            "CATEGORY": response.xpath('//a[@rel="tag"]/text()').extract_first(),
            "DESCRIPTION": main_description,
            "IMAGE_URL": response.xpath('//div[@class="woocommerce-product-gallery__image"]//img/@src').get(),
            "COST": None,
            "CASEPACK": None,
            "PK_SIZE": None,
            "DESCRIPTION2": None,
            "PAGE_TITLE": response.css('title::text').get(),
            "PAGE_URL": response.request.url
        }
