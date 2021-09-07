import scrapy


class UPDSpider(scrapy.Spider):
    name = 'UPD'
    start_urls = ['https://www.updinc.net/']

    def parse(self, response, **kwargs):
        """ Grabbing category pages from UPD.

        @url https://www.updinc.net/
        @returns requests 10 20
        @request https://www.updinc.net/catalog/?catid=9&pageNum=1
        @request https://www.updinc.net/catalog/?catid=3&pageNum=1
        """
        categories = response.xpath("//ul[@id='navcat']//a[contains(@href,'catid')]/@href").extract()
        yield from response.follow_all(categories, self.parse_details)

    def parse_details(self, response):
        """ Grabbing items from a category page.

        @url https://www.updinc.net/catalog/?catid=13&pageNum=1&itemcount=4
        @returns items 4
        @request https://www.updinc.net/catalog/?catid=13&pageNum=2
        @item \
            @VENDORID 1068 \
            @VENDOR UPD \
            @ITEMNO 0055324 \
            @UPC 852538005534 \
            @CATEGORY Bath and Beauty \
            @DESCRIPTION Wholesale Rio Bandages \
            @IMAGE_URL https://www.updinc.net/products/_photos/?0055324.jpg \
            @CASEPACK 24 \
            @PAGE_TITLE Wholesale Children's Licensed Products: Bath and Beauty \
            @PAGE_URL https://www.updinc.net/catalog/?catid=13&pageNum=1&itemcount=4
        """
        items = response.xpath("//*[@id='all']//div[@class='prdct-box']")
        for i in items:
            image_url = response.urljoin(i.xpath(".//div[@class='prdct-box1']/a[1]/@href").get())
            description = i.xpath(".//div[@class='prdct-box2']//a[1]/text()").get()
            item_no = i.xpath(".//div[@class='prdct-box2']//text()[3]").get(default='').strip()
            upc = i.xpath(".//*[contains(text(),'UPC')]/following-sibling::text()[1]").extract()[0].strip()
            category = i.xpath("//*[@id='all']//*[@class='products']/text()").get()
            case = i.xpath(".//*[contains(text(),'Case')]/following-sibling::text()[1]").extract()[0]
            yield {
                "VENDORID":1068,
                "VENDOR":'UPD',
                "ITEMNO":item_no,
                "UPC":upc,
                "CATEGORY":category,
                "DESCRIPTION":description,
                "IMAGE_URL":image_url,
                "CASEPACK":case,
                "PAGE_TITLE":response.css('title::text').get(),
                "PAGE_URL":response.request.url
            }

        next_page = response.xpath("//p[@class='page-num']//a/@href").extract()
        if next_page is not None:
            for n in next_page:
                next_page_url = response.urljoin(n)
                yield scrapy.Request(next_page_url, callback=self.parse_details)
