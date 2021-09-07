import re
import scrapy

class Fred26(scrapy.Spider):
    name = "fred26"
    start_urls = ["https://www.fred26importers.com/"]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

    def parse(self, response, **kwargs):
        """Extracts categories urls
        @url https://www.fred26importers.com/
        @returns items 0
        @returns requests 15 30
        @request https://www.fred26importers.com/glassware?page=1000
        """
        raw_categories_urls = response.xpath("//a[@data-testid='gallery-item-click-action-link']/@href").extract()
        categories_urls = [f"{url}?page=1000" for url in raw_categories_urls]
        yield from response.follow_all(categories_urls, self.parse_sub_categories)

    def parse_sub_categories(self, response):
        """Extracts subcategories or products urls
        @url https://www.fred26importers.com/blenders
        @returns items 0
        @returns requests 5 20
        @request https://www.fred26importers.com/product-page/hamilton-beach-drinkmaster-drink-mixer
        """
        sub_categories_urls = response.xpath("//a[@data-testid='gallery-item-click-action-link']/@href").extract()
        if sub_categories_urls:
            yield from response.follow_all(sub_categories_urls, self.parse_products)
        else:
            yield from self.parse_products(response)

    def parse_products(self, response):
        """ Extracts products urls
        @url https://www.fred26importers.com/glassware?page=1000
        @returns items 0
        @returns requests 100 200
        @request https://www.fred26importers.com/product-page/libbey-4pc-nebula-glass-set-15-1oz-448ml
        """
        product_urls = response.xpath("//a[@data-hook='product-item-container']/@href").extract()
        yield from response.follow_all(product_urls, self.parse_details)

    def parse_details(self, response):
        """Parse details from responses for specific products
        @url https://www.fred26importers.com/product-page/stainless-steel-paella-pan
        @returns items 1
        @returns requests 0
        @partial {\
            "VENDORID": 14,\
            "VENDOR": "FRED26", \
            "UPC": "709174013747", \
            "ITEMNO": "01374", \
            "DESCRIPTION": "Stainless Steel Paella Pan", \
            "DESCRIPTION2": "• Stainless Steel", \
            "IMAGE_URL": "https://static.wixstatic.com/media/2bf1c1_96c7ffe59b77494791865e488f1f31d1~mv2_d_1800_1800_s_2.png/v1/fit/w_500,h_500,q_90/file.png", \
            "PK_SIZE": "6", \
            "PAGE_TITLE": "Stainless Steel Paella Pan | Fred 26 Importers", \
            "PAGE_URL": "https://www.fred26importers.com/product-page/stainless-steel-paella-pan" \
        }
        """
        sku = response.xpath("//div[@data-hook='sku']/text()").extract_first()
        item_info = response.xpath("//div[@data-hook='info-section-description']//p/text()").extract()
        variants = [info for info in item_info if re.match(r".*[0-9]{11,14}.*", info)]
        for variant in variants:
            upc = re.search(r"\D*([0-9]{11,14})\D*", variant).group(1)
            yield {
                "VENDORID": 14,
                "VENDOR": "FRED26",
                "UPC": upc,
                "ITEMNO": str(sku).replace("SKU:", "").strip(),
                "CATEGORY": None,
                "DESCRIPTION": response.xpath("//h1[@data-hook='product-title']/text()").extract_first(),
                "IMAGE_URL": response.xpath('//meta[@property="og:image"]/@content').get(),
                "COST": None,
                "CASEPACK": None,
                "PK_SIZE": item_info[1],
                "DESCRIPTION2": response.xpath("//pre[@data-hook='description']/p/text()").extract_first(),
                "PAGE_TITLE": response.xpath("//head//title/text()").extract_first(),
                "PAGE_URL": response.url
            }

