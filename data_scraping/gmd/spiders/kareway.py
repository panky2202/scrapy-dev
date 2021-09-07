import json

import scrapy

from data_scraping.gmd.spiders.common import extract_casepack_from_description


class KarewaySpider(scrapy.Spider):
    name = 'Kareway'
    start_urls = ['https://kareway.com/collections']

    def parse(self, response, **kwargs):
        """This function should extract and loop category urls.

        @url https://kareway.com/collections
        @returns items 0
        @returns requests 10 50
        @request https://kareway.com/collections/makeup-accessories
        """

        category_links = response.xpath('//*[contains(concat( " ", @class, " " ), concat( " ", "collection-title", " " ))]//a/@href').extract()
        yield from response.follow_all(category_links, self.parse_items)

    def parse_items(self, response):
        """This function should extract and loop item urls.

        @url https://kareway.com/collections/black-friday-cyber-monday-epielle-pure-aid
        @request https://kareway.com/collections/black-friday-cyber-monday-epielle-pure-aid?page=2
        @returns items 0
        @returns requests 1 100
        @request https://kareway.com/collections/black-friday-cyber-monday-epielle-pure-aid/products/epielle-calming-mask-cica-tiger-grass
        @request https://kareway.com/collections/black-friday-cyber-monday-epielle-pure-aid?page=2
        """

        item_links = response.xpath('//*[contains(concat( " ", @class, " " ), concat( " ", "product-list-item-title", " " ))]//a/@href').extract()
        yield from response.follow_all(item_links, self.parse_details)

        next_page = response.xpath('//*[contains(concat( " ", @class, " " ), concat( " ", "next", " " ))]/a/@href').extract_first()
        if next_page:
            yield response.follow(next_page, callback=self.parse)

    def parse_details(self, response):
        """This function should extract data from 1 item page.

        @url https://kareway.com/collections/black-friday-cyber-monday-epielle-pure-aid/products/epielle-calming-mask-cica-tiger-grass
        @returns items 1
        @returns requests 0
        @partial {\
            "VENDORID": 1126,\
            "VENDOR": "KAREWAY", \
            "ITEMNO": "0395", \
            "CATEGORY": "beauty, Face, face care, Face Mask, Facial, new", \
            "DESCRIPTION": "epielle Calming Mask Cica & Tiger Grass", \
            "DESCRIPTION2": "epielle Calming Mask Cica & Tiger Grass epielle Calming Sheet Mask with Cica and Hemp seed oil repairs and hydrates to strengthen the skin barrier. The concentrated serum in the skin-fit contouring sheet provides intense moisturizing and soothing. Take better care of your skin with epielle. How To Use 1. After cleansing, use toner to refine skin texture 2. Take out the mask sheet and apply it on the face, avoiding eye and lip areas 3. Remove the sheet after 15-20 minutes and gently pat to allow the remaining formula to absorb into skin 4. Follow up with other skincare products afterward depending on you skin condition Cautions 1. Avoid using on blemishes, pimples, irritated or sunburned skin 2. Stop using if skin becomes red, swollen, or itchy during and after use. if pain persists after the mask is peeled off and the above signs occur, discontinue immediately and consult your doctor. 3. Avoid contact with the eye. If contact occurs, rinse eyes thoroughly with water. 4. For external use only 5. keep out of reach of children Ingredients Water, Methylpropanediol, Glycerin, Centella Asiatica (Cica) Extract, Cannabis sativa (Hemp) Seed Extract, Sodium Hyaluronate, Cannabis Sativa (Hemp) Seed oil, Allantoin, Betaine, Sorbitol, Alcohol Denat., Glyceryl Acrylate/Acrylic Acid Copolymer, Propylene Glycol, PVM/MA Copolymer, Niacinamide, Ammonium Acryloyldimethyltaurate/VP Copolymer, Hydroxyethylcellulose, PEG-60 Hydrogenated Castor Oil, Hydrosyacetophenone, Chlorphenesin, Fragrance", \
            "IMAGE_URL": "https://cdn.shopify.com/s/files/1/2804/9422/products/0395_F.jpg?v=1602174395", \
            "COST": 1.55, \
            "PAGE_TITLE": "epielle Calming Mask Cica & Tiger Grass – Kareway", \
            "PAGE_URL": "https://kareway.com/collections/black-friday-cyber-monday-epielle-pure-aid/products/epielle-calming-mask-cica-tiger-grass" \
        }
        """

        product_text = response.xpath('//script[@data-section-type="product"]/text()').extract_first()
        product = json.loads(product_text)["product"]

        for variant in product['variants']:
            yield {
                "VENDORID":1126,
                "VENDOR":'KAREWAY',
                "ITEMNO":variant['sku'].split('-')[0],
                "UPC":variant['barcode'],
                "CATEGORY":', '.join(product['tags']),
                "DESCRIPTION":variant['name'],
                "IMAGE_URL":next((x['src'] for x in product['media']), None),
                "COST":float(variant['price']) / 100.0,
                "CASEPACK":1,
                "PK_SIZE":extract_casepack_from_description(product['description']),
                "DESCRIPTION2":product['description'],
                "PAGE_TITLE":response.css('title::text').get(),
                "PAGE_URL":response.request.url
            }
