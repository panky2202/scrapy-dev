import re

import scrapy

from data_scraping.gmd.spiders.common import extract_casepack_from_description


def extract_product_id_from_description(x):
    """
    >>> extract_product_id_from_description("Wood document frame. P-1469.")
    'P-1469'

    >>> extract_product_id_from_description("Item#62281")
    '62281'

    >> extract_product_id_from_description("Item # P-122.")
    'P-122'

    >>> extract_product_id_from_description("Window box photo frame. 8x10 inch. 36 pcs.")

    """
    type_a = re.compile(r"p-([a-zA-Z0-9\-]+)", flags=re.IGNORECASE | re.MULTILINE)
    res_a = type_a.search(x)
    type_b = re.compile(r"item *# *([a-zA-Z0-9\-]+)", flags=re.IGNORECASE | re.MULTILINE)
    res_b = type_b.search(x)
    if res_a:
        return res_a.group()
    if res_b:
        return res_b.group(1)

class PricePowerSpider(scrapy.Spider):
    name = 'pricepower'
    start_urls = [
        'http://www.pricepowerintl.com/livingroom.htm',
        'http://www.pricepowerintl.com/kitchen.htm',
        'http://www.pricepowerintl.com/bathroom.htm',
        'http://www.pricepowerintl.com/basement.htm'
    ]

    def parse(self, response):
        """ Grab product pages.

        @url http://www.pricepowerintl.com/livingroom.htm
        @scrapes VENDORID VENDOR ITEMNO CATEGORY DESCRIPTION PAGE_TITLE PAGE_URL
        @returns items 50
        @partial {\
            "VENDORID": 1097,\
            "VENDOR": "PRICE POWER",\
            "PAGE_URL": "http://www.pricepowerintl.com/livingroom.htm",\
            "ITEMNO": "P-1258",\
            "IMAGE_URL": "http://www.pricepowerintl.com/images/catalog/livingroom/webPricePwrInt05-01.jpg",\
            "CATEGORY": "Living Room",\
            "DESCRIPTION": "Wood document frame. P-1258. 8.5x11 inch. 36 pcs.",\
            "CASEPACK": "36",\
            "PAGE_TITLE": "Living Room"\
        }
        """

        products = response.css("table[dir=ltr] table")[0].xpath("./td/table")
        category = response.css("nobr::text").get()

        for item in products:
            desc = ' '.join(item.xpath(".//p").getall())
            itemno = extract_product_id_from_description(desc)
            casepack = extract_casepack_from_description(desc.lower())
            href = item.css("a::attr(href)").get()
            image_url = response.urljoin(href) if href else None
            if desc or image_url:
                yield {
                    "VENDORID":1097,
                    "VENDOR":"PRICE POWER",
                    "ITEMNO":itemno,
                    "CATEGORY":category,
                    "DESCRIPTION":desc,
                    "IMAGE_URL":image_url,
                    "CASEPACK":casepack,
                    "PAGE_TITLE":response.css("title::text").get(),
                    "PAGE_URL":response.url,
                }

