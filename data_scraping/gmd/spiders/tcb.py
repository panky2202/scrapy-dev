# !!! DISABLED CUZ TCB website is down
#
# import re
#
# import scrapy
# from scrapy import FormRequest
# from scrapy import Request
#
#
# class TCBSpider(scrapy.Spider):
#     name = 'TCB'
#
#     def start_requests(self):
#         """ Start spider making a request to login
#
#         @url http://www.tcbimports.com/ais101/WebPass.php
#         @returns requests 1
#         @returns items 0 0
#         """
#         yield FormRequest("http://www.tcbimports.com/ais101/WebPass.php",
#                           formdata={"userno": "662", "passno": "662", "action": "Login"},
#                           callback=self.after_login)
#
#     def after_login(self, response):
#         """ Handle login response to grab session cookie
#
#         @url http://www.tcbimports.com/ais101/index.php
#         @returns requests 1
#         @returns items 0 0
#         """
#         cookie = response.headers.getlist('Set-Cookie')[0].decode("utf-8").split(";")[0].split("=")
#         yield Request('http://www.tcbimports.com/ais101/index.php', cookies={cookie[0]: cookie[1]}, callback=self.parse,
#                       meta={'cookie': cookie})
#
#     def parse(self, response, **kwargs):
#         """ Grabbing category pages.
#
#         @url http://www.tcbimports.com/ais101/index.php
#         @request http://www.tcbimports.com/ais101/itemdisp.php?action=Menu&dept=BABY
#         @request http://www.tcbimports.com/ais101/itemdisp.php?action=Menu&dept=BATH
#         @returns requests 20 30
#         @returns items 0 0
#         """
#
#         categories = response.xpath("//table[@class='menuitem']//a/@href").extract()
#         yield from response.follow_all(categories, self.parse_details)
#
#     def parse_details(self, response):
#         """ Grabbing items from a category page.
#
#         @url http://www.tcbimports.com/ais101/itemdisp.php?action=Menu&dept=BATH
#         @returns requests 0 0
#         """
#
#         for i in response.xpath("//table[@class='itdetail01']"):
#             image_url = response.urljoin(i.xpath(".//td[@class='detimage01']//img[1]/@src").get())
#             category = response.request.url
#             category = re.search(r'dept=\w+', category)
#             category = category.group(0).replace('dept=', '') if category is not None else None
#             item_no = i.xpath(".//input[contains(@name, 'itemno')]/@value").get()
#             description = i.xpath(".//input[contains(@name, 'desc1')]/@value").get()
#             casepack = i.xpath(".//input[contains(@name, 'qtcase')]/@value").get()
#             pk_size = i.xpath(".//input[contains(@name, 'qtpack')]/@value").get()
#             price = float(i.xpath(".//input[contains(@name, 'price')]/@value").get(default=0))
#             yield {
#                 "VENDORID":9,
#                 "VENDOR":'TCB',
#                 "ITEMNO":item_no or None,
#                 "UPC":None,
#                 "CATEGORY":category or None,
#                 "DESCRIPTION":description or None,
#                 "IMAGE_URL":image_url or None,
#                 "COST":price,
#                 "CASEPACK":casepack or None,
#                 "PK_SIZE":pk_size or None,
#                 "DESCRIPTION2":None,
#                 "PAGE_TITLE":response.css('title::text').get(),
#                 "PAGE_URL":response.request.url
#             }
#
