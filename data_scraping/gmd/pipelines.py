import os

from itemadapter import ItemAdapter
from scrapy.exceptions import DropItem

from data_scraping.common import parse_product, upload_products


class ProductPipeline:
    def process_item(self, item, spider):
        adapter = ItemAdapter(item)
        product = parse_product(**item)
        if 'vendor_id' not in spider.crawler.stats.get_stats():
            spider.crawler.stats.set_value('vendor_id', product['VENDORID'])
            spider.crawler.stats.set_value('vendor_name', product['VENDOR'])
        if product:
            return product
        else:
            raise DropItem(f"{item} dropped")


class UploadToScrapingAPI:
    CHUNK_SIZE = 900
    item_buffer = []

    def __init__(self, scraping_api):
        self.scraping_api = scraping_api

    @classmethod
    def from_crawler(cls, crawler):
        scraping_api = crawler.settings.get('SCRAPING_API')
        if not scraping_api:
            scraping_api = os.environ['SCRAPING_API']
        return cls(scraping_api=scraping_api)

    def upload_items(self):
        try:
            upload_products(self.scraping_api, self.item_buffer)
            self.item_buffer.clear()
        except Exception as e:
            print('---> Error uploading items', e)

    def push_item(self, item):
        self.item_buffer.append(item)
        if len(self.item_buffer) >= self.CHUNK_SIZE:
            self.upload_items()

    def process_item(self, item, _):
        self.push_item(item)
        return item

    def close_spider(self, _):
        self.upload_items()
