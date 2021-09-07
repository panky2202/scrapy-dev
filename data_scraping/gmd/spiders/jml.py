import scrapy
from scrapy import Request


class JmlSpider(scrapy.Spider):
    name = 'jml'
    start_urls = ['https://www.jmlhomefashion.com/']

    custom_settings = {
        'ROBOTSTXT_OBEY': False,
        'USER_AGENT': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36 Edg/89.0.774.76'
    }

    def parse(self, response, **kwargs):
        """ Grab category pages.

        @url https://www.jmlhomefashion.com/
        @returns items 0
        @returns requests 6
        @request https://www.jmlhomefashion.com/bedroom.html
        """

        category_links = response.xpath(
            '//a[@class="level-top "]/@href').extract()

        for link in category_links:
            yield scrapy.Request(link, self.parse_main)

    def parse_main(self, response):
        """
        extract some item's data and loop item urls.

        @url https://www.jmlhomefashion.com/bedroom.html
        @returns items 0
        @returns requests 1 10
        @request https://www.jmlhomefashion.com/bedroom.html?p=2
        @request https://www.jmlhomefashion.com/jml-heavy-fleece-blanket-plush-velvet-korean-style-mink-blanket-queen-size-79-x91-two-ply-reversible-raschel-blanket-silky-soft-wrinkle-and-fade-resistant-thick-bed-warm-blanket-black-floral.html \
            @COST 48.99 \
            @CATEGORY Bedroom \
            @DESCRIPTION JML Heavy Fleece Blanket, Plush Velvet Korean Style Mink Blanket Queen Size 79"x91", Two Ply Reversible Raschel Blanket - Silky Soft Wrinkle and Fade Resistant Thick Bed Warm Blanket, Black Floral \
        """

        for i in response.xpath('//li[@class="item product product-item"]'):
            cost = i.xpath('.//span[@class="price"]/text()').get().replace('$', '')
            category = response.xpath(
                '//span[@data-ui-id="page-title-wrapper"]/text()').get()
            description = i.xpath(
                'normalize-space(.//a[@class="product-item-link"]/text())').get()
            item_url = i.xpath(
                './/div[@class="product-item-info "]/a/@href').get()

            yield Request(url=item_url, callback=self.parse_details, cb_kwargs=dict(
                CATEGORY=category,
                COST=cost,
                DESCRIPTION=description
            ))

        next_page = response.xpath(
            '(//a[@class="action  next"]/@href)[2]').get()
        if next_page is not None:
            yield scrapy.Request(next_page, callback=self.parse_main)

    def parse_details(self, response, **kwargs):
        """ Parse a product page.
        @cb_kwargs {\
            "CATEGORY": "Bedroom",\
            "COST": 69.99,\
            "DESCRIPTION": "JML Fleece Blanket King Size, Heavy Korean Mink Blanket 85 X 95 Inches- 9 Lbs, Single Ply, Soft and Warm, Thick Raschel Printed Mink Blanket for Autumn,Winter,Bed,Home,Gifts, Burgundy Flower"\
            }

        @url https://www.jmlhomefashion.com/jml-fleece-blanket-king-size-heavy-korean-mink-blanket-85-x-95-inches-9-lbs-single-ply-soft-and-warm-thick-raschel-printed-mink-blanket-for-autumn-winter-bed-home-gifts-burgundy-flower.html
        @returns items 1
        @returns requests 0
        @partial {\
            "VENDORID": 17,\
            "VENDOR": "JML",\
            "PAGE_URL": "https://www.jmlhomefashion.com/jml-fleece-blanket-king-size-heavy-korean-mink-blanket-85-x-95-inches-9-lbs-single-ply-soft-and-warm-thick-raschel-printed-mink-blanket-for-autumn-winter-bed-home-gifts-burgundy-flower.html",\
            "ITEMNO": "January-S-02",\
            "IMAGE_URL": "https://www.jmlhomefashion.com/media/catalog/product/cache/79a006cdd27a4ff4fa0d94a051603fc5/0/2/02-1.jpg",\
            "COST": 69.99,\
            "CATEGORY": "Bedroom",\
            "DESCRIPTION": "JML Fleece Blanket King Size, Heavy Korean Mink Blanket 85 X 95 Inches- 9 Lbs, Single Ply, Soft and Warm, Thick Raschel Printed Mink Blanket for Autumn,Winter,Bed,Home,Gifts, Burgundy Flower",\
            "DESCRIPTION2": "100% High Premium Microfiber Polyester,SOFT & COMFORTABLE - This JML fleece soft blanket is made of 100% High Premium Microfiber Polyester which provides better fade resistance and has more elasticity to keep its shape, you will feel ultra soft and comfortable when snuggle with it. High Color Fastness, More Brilliant, No Fading and Lint Free. In autumn and winter, you can enjoy the comfort, warmth and quality of sleep that this beautiful warm plush fleece blanket brings you.,THICK & WARM - The 9 lbs fleece blanket has tight weaving structure which is thick and warm enough for using in autumn and winter. The blanket can quickly heat up and hold more air to keep you warm, time goes by, warmth continue, offers you different senses of softness and warmth to improve your sleep.,UNIQUE LUXURY BEDDING DECOR - The JML king Fleece Blanket for bed measured by 85\\" x 95\\" is large enough for Queen or King Size bed and perfect for homeowners with sophisticated tastes in decoration home. Using the embossing technology gives this Korean blanket a stronger three-dimensional sense, and brighten up your bedding.The brilliant color revives this blanket with an luxurious appearance to complement your room a noble feeling.,SPLENDID & GREAT GIFT IDEA: Exquisite workmanship and neat stitches enhance strong connections at seams and better structural strength with integrated outlook which effectively prevents disconnection and makes it more durable. You could choose this korean mink blanket as a gift for your family or friend on Christmas, Birthday, Wedding Days etc..,EASY TO CARE: Cause the vacuum package, the mink blanket may has some wrinkle, it will disappear when you normal use it for several days. Also, you could tumble dry on low heat for 20 minutes or machine wash in cold on gentle/delicate cycle (tumble dry on low). No Bleach and don't direct heat it.,Satisfaction Guaranteed: We offer 30 days return and 7x24 hours customer services. If you have any problems or advice about the mink fleece blanket, please feel free to contact us via Amazon message box. We have a professional team to solve your problem. Purchase with worry free.",\
            "PAGE_TITLE": "JML Fleece Blanket King Size, Heavy Korean Mink Blanket 85 X 95 Inches- 9 Lbs, Single Ply, Soft and Warm, Thick Raschel Printed Mink Blanket for Autumn,Winter,Bed,Home,Gifts, Burgundy Flower"\
        }
        """

        sku = response.xpath('//div[@itemprop="sku"]/text()').get()
        discription2 = ','.join(response.xpath(
            '(//ul[@class="a-unordered-list a-vertical a-spacing-mini"]/li/span/text())|(//div[@itemprop="description"]/ul/li/text())').getall())
        item_url = response.request.url
        page_title = response.xpath('//head/title/text()').get()
        image_url = response.xpath('//img[@class="gallery-placeholder__image"]/@src').get()

        yield {
            "VENDORID": 17,
            "VENDOR": 'JML',
            "ITEMNO": sku,
            "IMAGE_URL": image_url,
            "UPC": None,
            "CASEPACK": None,
            "PK_SIZE": None,
            "DESCRIPTION2": discription2,
            "PAGE_TITLE": page_title,
            "PAGE_URL": item_url,
            **kwargs
        }
