import re

import scrapy

from data_scraping.common import parse_product


class ArtoySpider(scrapy.Spider):
    name = 'Artoy'

    login_user = "jwlee@gmdstoresinc.com"
    login_password = "granmercado"

    def start_requests(self):
        yield scrapy.Request("http://www.artoytrading.com/Ecommerce/General/Login.aspx", callback=self.login_page)

    def login_page(self, response):
        req = scrapy.FormRequest.from_response(
            response=response,
            formid="aspnetForm",
            formdata={"ctl00$ContentPlaceHolder1$VerifyLogin1$txtEmail": self.login_user,
                      "ctl00$ContentPlaceHolder1$VerifyLogin1$txtPassword": self.login_password,
                      "ctl00$ContentPlaceHolder1$VerifyLogin1$ibtnSignIn.x": "91",
                      "ctl00$ContentPlaceHolder1$VerifyLogin1$ibtnSignIn.y": "17"},
            callback=self.parse
        )
        yield req

    def parse(self, response, **kwargs):
        """ Grabbing category pages.

        @url http://www.artoytrading.com/Ecommerce/General/MyAccount.aspx
        @request http://www.artoytrading.com/Ecommerce/General/BrowseCategory.aspx?CategoryId=9
        @request http://www.artoytrading.com/Ecommerce/General/BrowseCategory.aspx?CategoryId=6
        @returns requests 29
        @returns items 0 0
        """

        categories = response.xpath("//a[contains(@href,'BrowseCategory.aspx')]/@href").extract()
        yield from response.follow_all(categories, self.parse_items)

    def parse_items(self, response):
        """ Grabbing item pages.

        @url http://www.artoytrading.com/Ecommerce/General/BrowseCategory.aspx?CategoryId=20
        @returns requests 0
        @returns items 0 0
        """

        # Grab item urls
        items = response.xpath("//a[contains(@id, 'ProductDataList_TextLink')]/@href").extract()
        yield from response.follow_all(items, self.parse_details)

        # Pagination
        next_page = response.xpath("//input[@value='Next' and not(@disabled='disabled')]").get()
        if next_page is not None:
            yield scrapy.FormRequest.from_response(
                response=response,
                formid="aspnetForm",
                formdata={"ctl00$ContentPlaceHolder1$BrowserProduct$btnNext": 'Next'},
                callback=self.parse_items)

    def parse_details(self, response):
        """ Grabbing item data from item details page.

        @url http://www.artoytrading.com/Ecommerce/General/GeneralProductDetail.aspx?PROD_CD=ARM147
        @returns items 1
        @returns requests 0
        @partial {\
            "VENDORID": 7,\
            "VENDOR": "ARTOY", \
            "PAGE_URL": "http://www.artoytrading.com/Ecommerce/General/GeneralProductDetail.aspx?PROD_CD=ARM147", \
            "ITEMNO": "ARM147", \
            "IMAGE_URL": "http://www.artoytrading.com/Pic/Items/ARM147.JPG", \
            "DESCRIPTION": "2.75\\" POOPSTER PUTTY ON BLISTER CARD", \
            "CASEPACK": "72", \
            "PK_SIZE": "24", \
            "DESCRIPTION2": "SIZE: 4.75L X 7H IN CS/PK SIZE: 72/24 CASE WEIGHT: 14.0000 LB CASE VOLUME: 0.8165 CUFT", \
            "PAGE_TITLE": "Artoy | Wholesale Toys | Novelties | Impulse Toys | Joy in Every Toy!" \
        }
        """

        description2 = ' '.join(response.xpath("//span[contains(@id, '_s7')]/text()").extract())
        try:
            cpack_psize = re.search(r'CS/PK SIZE: \d+\/\d+', description2).group(0)
            casepack = re.findall(r'\d+', cpack_psize)[0]
            pk_size = re.findall(r'\d+', cpack_psize)[1]
        except AttributeError or IndexError:
            casepack = None
            pk_size = None

        yield parse_product(
            VENDORID=7,
            VENDOR='ARTOY',
            ITEMNO=response.xpath("//span[contains(@id, 'PROD_CD')]/text()").get(),
            DESCRIPTION=response.xpath("//span[contains(@id, '_s2')]/text()").get(),
            IMAGE_URL=response.urljoin(response.xpath("//img[contains(@id, 'ProdImg')]/@src").get(default='')),
            COST=response.xpath("//tr[td[span[text()='Price:']]]/td[2]/text()").get(default='').strip(),
            CASEPACK=casepack,
            PK_SIZE=pk_size,
            DESCRIPTION2=description2,
            PAGE_TITLE=response.css('title::text').get(),
            PAGE_URL=response.request.url
        )
