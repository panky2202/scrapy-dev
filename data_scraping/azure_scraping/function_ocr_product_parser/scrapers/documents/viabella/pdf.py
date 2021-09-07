import re

from data_scraping.azure_scraping.common import extract_ocr_pattern, marker_parser
from data_scraping.azure_scraping.common.assert_item_in_parser_output import assert_item_in_parser_output


def find_markers(ocr):
    """For each product on an image this function returns unique (x, y), eg, a marker point
    >>> find_markers([
    ... ('hello', 1, 1, 1, 1),
    ... ('Item:', -0.001, -0.001, 13, 1),
    ... ('Item:', -0.001, -0.001, 13, 1),
    ... ('item', 1, 1, 1, 1),
    ... ])
    [(-0.001, -0.001), (-0.001, -0.001)]
    """
    
    return [
        (left, top)
        for text, left, top, width, height in ocr
        if re.match(r"Item:", text)
    ]


def extract_product_from_text(text):
    """Recives OCR text, extracts product. Text could contain garbage or wrong reads.
    >>> extract_product_from_text('''
    ... Item: B12X7F-ASST
    ... 
    ... SUNFLOWER MUM MIX BH X12
    ... UPC: 763713350076
    ... ''')
    {'VENDORID': 1209, 'VENDOR': 'VIABELLA', 'ITEMNO': 'B12X7F-ASST', 'DESCRIPTION': 'SUNFLOWER MUM MIX BH X12', 'UPC': '763713350076'}
    """

    def extract(pattern):
        return extract_ocr_pattern(pattern, text)
    product_data = text.split("\n")
    itemno = ""
    upc = ""
    description = ""
    regexp = re.compile(r'[A-Z]+|[a-z]+')
    for line in product_data:
        if "Item:" in line:
            itemno = line.replace("Item: ","")
        elif "UPC:" in line:
            upc = line.replace("UPC: ","")
        elif regexp.search(line):
            description = line
    return {
        "VENDORID": 1209,
        "VENDOR": "VIABELLA",
        "ITEMNO": itemno,
        "DESCRIPTION": description, 
        "UPC":upc,       
    }


def main(pages, url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/VIABELLA/PDF/OMS%20PICTURE%20IN%20EXCEL-OFIVE.pdf",
    ... VENDORID=1209,
    ... VENDOR="VIABELLA",
    ... ITEMNO="B12X7F-ASST",
    ... DESCRIPTION="SUNFLOWER MUM MIX BH X12",
    ... UPC="763713350076"
    ... )
    """
    
    return marker_parser(
        pages,
        find_markers=find_markers,
        image_region=(-0.19, -0.004, 0.16, 0.125),
        text_region=(0, -0.005, 0.25, 0.125),
        extract_product_from_text=extract_product_from_text,        
    )
