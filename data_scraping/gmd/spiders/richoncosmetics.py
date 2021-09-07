# Todo richoncosmetics is down, we could uncomment the spider once is it is up
# import re
#
# import scrapy
# from furl import furl
#
# from data_scraping.gmd.spiders.common import extract_casepack_from_description, extract_cost_from_usd_price
#
#
# def extract_item_number(sku):
#     """
#     >>> extract_item_number('Product SKU: BUF67')
#     'BUF67'
#     """
#     return re.search(r"Product SKU: (.*)", sku).group(1)
#
#
# class RickonCosmeticsSpider(scrapy.Spider):
#     name = 'richoncosmetics'
#     start_urls = ['https://www.richoncosmetics.com/']
#
#     def parse(self, response):
#         """ Grabbing category pages.
#
#         @url https://www.richoncosmetics.com
#         @returns requests 5
#         @request https://www.richoncosmetics.com/eyes.html?product_list_limit=all
#         @request https://www.richoncosmetics.com/lips.html?product_list_limit=all
#         """
#
#         categories = response.xpath('//nav/ul/li/a[contains(@class, "level-top")]/@href').extract()
#         for category in categories:
#             url = furl(category).add({'product_list_limit': 'all'}).url
#             yield response.follow(url, callback=self.parse_category)
#
#     def parse_category(self, response):
#         """ Parse all products from a category page
#
#         @url https://www.richoncosmetics.com/beautycare.html?product_list_limit=all
#         @returns items 170
#         @partial {\
#             "VENDORID": 1114,\
#             "VENDOR": "RICH ON COSMETICS",\
#             "PAGE_URL": "https://www.richoncosmetics.com/stainless-steel-tweezers-230pt.html",\
#             "ITEMNO": "230PT",\
#             "CATEGORY": "Beauty Care",\
#             "DESCRIPTION": "Stainless Steel Tweezers (230PT) Princessa 120 piece box",\
#             "IMAGE_URL": "https://www.richoncosmetics.com/pub/media/catalog/product/cache/small_image/270x300/beff4985b56e3afdbeabfc89641a4582/2/3/230pt.png",\
#             "COST": 1.99,\
#             "CASEPACK": "120",\
#             "PAGE_TITLE": "Beauty Care"\
#         }
#         @partial {\
#             "VENDORID": 1114,\
#             "VENDOR": "RICH ON COSMETICS",\
#             "PAGE_URL": "https://www.richoncosmetics.com/toe-separators-tos17h.html",\
#             "ITEMNO": "TOS17H",\
#             "CATEGORY": "Beauty Care",\
#             "DESCRIPTION": "Toe Separators (TOS17H) Princessa 2 piece set 48 piece display",\
#             "IMAGE_URL": "https://www.richoncosmetics.com/pub/media/catalog/product/cache/small_image/270x300/beff4985b56e3afdbeabfc89641a4582/t/o/tos17h.png",\
#             "COST": 1,\
#             "CASEPACK": "2",\
#             "PAGE_TITLE": "Beauty Care"\
#         }
#         """
#
#         items = response.css(".product-item-info")
#         for item in items:
#             description = item.css(".product-item-link::text").get()
#             yield {
#                 "VENDORID":1114,
#                 "VENDOR":"RICH ON COSMETICS",
#                 "ITEMNO":extract_item_number(item.css(".sku strong::text").get()),
#                 "UPC":None,
#                 "CATEGORY":response.xpath("//meta[contains(@name, 'description')]/@content").get(),
#                 "DESCRIPTION":description,
#                 "IMAGE_URL":item.css("img::attr(src)").get(),
#                 "COST":extract_cost_from_usd_price(item.css(".price::text").get()),
#                 "CASEPACK":extract_casepack_from_description(description),
#                 "PK_SIZE":None,
#                 "DESCRIPTION2":None,
#                 "PAGE_TITLE":response.css('title::text').get(),
#                 "PAGE_URL":item.css(".product-item-link::attr(href)").get(),
#             }
