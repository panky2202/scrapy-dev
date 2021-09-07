import re
from shutil import which

import scrapy
from scrapy_selenium import SeleniumRequest


# Libs
# pip install scrapy-selenium

# Called by: scrapy crawl  She_MakeUp -O SM.csv

class She_MakeUp(scrapy.Spider):
    # Spider Settings
    name = 'She_MakeUp'
    start_urls = ['https://www.makeupshe.com/']
    SELENIUM_DRIVER_NAME = 'chrome'
    SELENIUM_DRIVER_EXECUTABLE_PATH = which('geckodriver')
    print(SELENIUM_DRIVER_EXECUTABLE_PATH)
    SELENIUM_DRIVER_ARGUMENTS = ['--headless']  # '--headless' if using chrome instead of firefox
    DOWNLOADER_MIDDLEWARES = {'scrapy_selenium.SeleniumMiddleware': 800}

    # Main Function
    def start_requests(self):
        yield SeleniumRequest(url='https://www.makeupshe.com/', callback=self.parse_main)

    def parse_main(self, response):
        ### PENDING CLICK ON SHOW MORE
        # driver = response.request.meta['driver']
        #
        # for i in range(30):
        #     try:
        #         bt = driver.find_element(By.XPATH,"//button[@data-testid='matrix-gallery-show-more-button']")
        #         bt.click()
        #     except:
        #         pass

        # Extract Categories URLs
        Categories = response.xpath("//ul[@id='comp-jgdy240jitemsContainer']//a/@href").extract()

        # Loop Categories
        yield from response.follow_all(Categories, self.parse_details)

    def parse_details(self, response):
        Items = response.xpath("//div[@data-testid='gallery-item-item']")
        # Loop items
        for i in Items:
            # Data refinements
            Item_no = "'" + i.xpath(".//div[@data-testid='gallery-item-title']/text()").get(default='').strip()
            Category = response.css('title::text').get().split('|')[0]
            Image_url = i.xpath(".//@data-image-info").get()
            Image_url = re.search(r'"uri":".*?"', Image_url)
            Image_url = Image_url.group(0) if Image_url is not None else ''
            Image_url = Image_url.replace('"uri":"', '').replace('"', '')
            Image_url = "https://static.wixstatic.com/media/" + Image_url if Image_url != '' else ''

            # Data dictionary
            yield {
                'VENDORID': '30',
                'VENDOR': 'SHE MAKEUP',
                'ITEMNO': Item_no,
                'UPC': '',
                'CATEGORY': Category,
                'DESCRIPTION': '',
                'IMAGE_URL': Image_url,
                'COST': '',
                'CASEPACK': '',
                'PK_SIZE': '',
                'DESCRIPTION2': '',
                'PAGE_TITLE': response.css('title::text').get(),
                'PAGE_URL': response.request.url
            }

# #ENABLE FOR DEBUGING
# process = CrawlerProcess(settings={
#     "FEEDS": {
#         "items.json": {"format": "json"},
#     },
# })
#
# process.crawl(She_MakeUp) #Change to spider name
# process.start() # the script will block here until the crawling is finished
