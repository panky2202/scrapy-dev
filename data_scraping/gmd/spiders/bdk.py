import scrapy


class BDKSpider(scrapy.Spider):
    name = 'BDK'
    start_urls = ['https://www.bdkauto.net/category.php?filter_name=%&maxlist=999']

    def parse(self, response, **kwargs):
        """ Grabbing category pages from UPD.

        @url https://www.bdkauto.net/category.php?filter_name=%&maxlist=10
        @returns requests 1 30
        @request https://www.bdkauto.net/p//af-103-vn/3-pack-paper-air-freshener
        """
        products = response.xpath("//a[@class='productDetailLink']/@href").extract()
        yield from response.follow_all(products, self.parse_details)

    def parse_details(self, response):
        """ Grabbing items from a category page.

        @url https://www.bdkauto.net/p2/floor-mats/cargo-liner/mt-170-bk/compact-suv-custom-fit-floor-mats
        @item \
            @VENDORID 1049 \
            @VENDOR BDK \
            @ITEMNO MT-170-BK \
            @CATEGORY All \
            @DESCRIPTION COMPACT SUV CUSTOM FIT FLOOR MATS \
            @IMAGE_URL https://www.bdkauto.net//upload//style/OF-170-BK.main.jpg \
            @CASEPACK 4 \
            @PAGE_TITLE Compact SUV Custom Fit Floor Mats - CARGO LINER FLOOR MATS | BDK \
            @PAGE_URL https://www.bdkauto.net/p2/floor-mats/cargo-liner/mt-170-bk/compact-suv-custom-fit-floor-mats
        """

        item_no = response.xpath("//*[@id='ltStyleName']/text()").get()
        description = response.xpath("//div[@class='detail-information']/h1[1]/text()").get()
        image_url = response.xpath("//div[@class='item']//img[1]/@src").extract_first()
        case = response.xpath("//*[@id='frmAddtoCart']//p[contains(text(),'Case Qty')]/text()").get()
        case = case.replace('Case Qty : ', '')
        cost = response.xpath("//div[@class='swatch']//@data-price").get()
        category = "All"
        yield {
            "VENDORID": 1049,
            "VENDOR": 'BDK',
            "ITEMNO": item_no,
            "UPC": '',
            "CATEGORY": category,
            "DESCRIPTION": description,
            "IMAGE_URL": image_url,
            "COST": cost,
            "CASEPACK": case,
            "PAGE_TITLE": response.css('title::text').get().replace(" -  | BDK", ""),
            "PAGE_URL": response.request.url
        }
