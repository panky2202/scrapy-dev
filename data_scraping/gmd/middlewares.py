import logging
import os
from opencensus.ext.azure.log_exporter import AzureLogHandler
from scrapy import signals


class SpiderNameStats:
    def __init__(self, stats):
        self.stats = stats

    @classmethod
    def from_crawler(cls, crawler):
        if hasattr(crawler, 'spider'):
            crawler.stats.set_value('spider_name', crawler.spider.name)
        return cls(crawler.stats)


class AzureLogging:
    def __init__(self, connection_string=None):
        self.connection_string = connection_string

    @classmethod
    def from_crawler(cls, crawler):
        connection_string = crawler.settings.get('APPLICATIONINSIGHTS_CONNECTION_STRING', None)
        if not connection_string:
            connection_string = os.environ['APPLICATIONINSIGHTS_CONNECTION_STRING']

        ext = cls(connection_string)
        crawler.signals.connect(ext.spider_opened, signal=signals.spider_opened)
        return ext

    def spider_opened(self, spider):
        if self.connection_string:
            logger = logging.getLogger()
            logger.addHandler(AzureLogHandler(connection_string=self.connection_string))
