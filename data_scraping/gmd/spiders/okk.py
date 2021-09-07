import scrapy


class OKKSpider(scrapy.Spider):
    name = 'OKK'

    login_user = "plee@gmdstoresinc.com"
    login_password = "toys"

    def start_requests(self):
        yield scrapy.Request("http://www.okktoys.com/Ecommerce/General/login.aspx", callback=self.login_page)

    def login_page(self, response):
        req = scrapy.FormRequest.from_response(
            response=response,
            formid="aspnetForm",
            formdata={
                "ctl00$T$VerifyLogin1$txtEmail": self.login_user,
                "ctl00$T$VerifyLogin1$txtPassword": self.login_password,
                "ctl00$T$VerifyLogin1$ibtnSignIn.x": "71",
                "ctl00$T$VerifyLogin1$ibtnSignIn.y": "10"
            },
            callback=self.after_login
        )
        yield req

    def after_login(self, response, **kwargs):
        """ Grabbing items from a category page.

        @url http://www.okktoys.com/ecommerce/General/BrowseCategory.aspx?CategoryId=36
        @returns requests 1
        """
        yield scrapy.Request(
            'http://www.okktoys.com/ecommerce/General/BrowseCategory.aspx?CategoryId=36',
            callback=self.parse_categories
        )

    def parse_categories(self, response):
        """ Grabbing items from a category page.

        @url http://www.okktoys.com/ecommerce/General/BrowseCategory.aspx?CategoryId=36
        @returns requests 1 40
        """

        category_urls = response.css('ul.category li a::attr(href)').getall()
        yield from response.follow_all(category_urls, callback=self.parse_shelf)

    def parse_shelf(self, response):
        """ Grabbing items from a category page.

        @url http://www.okktoys.com/ecommerce/General/BrowseCategory.aspx?CategoryId=36
        @returns requests 0 40
        """
        product_urls = response.xpath("//table[@id='ctl00_T_Product2_ProductDataList']//a[img]/@href").getall()
        yield from response.follow_all(product_urls, callback=self.parse_product_page)

        next_page = response.xpath("//input[@id='ctl00_T_Product2_btnNext' and not(@disabled)]/@href").get()
        if next_page:
            yield response.follow(next_page, callback=self.parse_shelf)

    def parse_product_page(self, response):
        """This function should extract data from 1 item page.

        @url http://www.okktoys.com/ecommerce/general/CategoryProductDetail.aspx?CategoryId=13&PROD_CD=20100-48-DPY
        @returns items 0
        @returns requests 0
        @partial {\
            "VENDORID": 1059,\
            "VENDOR": "OKK",\
            "PAGE_URL": "http://www.okktoys.com/ecommerce/General/VerifyLogin.aspx",\
            "IMAGE_URL": "http://www.okktoys.com/ecommerce/General/VerifyLogin.aspx"\
        }
        """

        image_url = response.css("#ctl00_T_ProductDetail01_ProdImg::attr(src)").get('')
        image_url = image_url.replace('/Pic/large/', '/OKKPICTURES/').replace('-01.', '.')
        category = response.css('a.CategoryLink::text').get()
        item_no = response.css("#ctl00_T_ProductDetail01_lblPROD_CD::text").get()
        description = response.css("#ctl00_T_ProductDetail01_s2::text").get()
        description2 = response.css("#ctl00_T_ProductDetail01_Htmlencodelabel1::text").get()
        price = ''.join(response.xpath('//td[contains(., "Price:")]/following-sibling::td/text()').getall())
        yield {
            'VENDORID': 1059,
            'VENDOR': 'OKK',
            'ITEMNO': item_no,
            'CATEGORY': category,
            'DESCRIPTION': description,
            'IMAGE_URL': response.urljoin(image_url),
            'COST': price,
            'DESCRIPTION2': description2,
            'PAGE_TITLE': description,
            'PAGE_URL': response.request.url
        }

