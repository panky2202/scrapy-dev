import re

from data_scraping.azure_scraping.common import extract_ocr_pattern, marker_parser
from data_scraping.azure_scraping.common.assert_item_in_parser_output import assert_item_in_parser_output


def find_markers(ocr):
    """For each product on an image this function returns unique (x, y), eg, a marker point
    >>> find_markers([
    ... ("Upc", 1, 1, 1, 1),
    ... ("Upc", 12, 1, 13, 1),
    ... ("Price", 12, 1, 13, 1),
    ... ("Price:", 1, 1, 1, 1),
    ... ])
    [(12, 1), (1, 1)]
    """

    result = [
        (left, top)
        for text, left, top, width, height in ocr
        if (re.match(r"(Price).*", text))
    ]

    return result


def extract_product_from_text(text):
    """Recives OCR text, extracts product. Text could contain garbage or wrong reads.
    >>> extract_product_from_text('''ST257B
    ... Charm Killer Pro Eyeshadow(1/2dz/display, 6dz/case)
    ... Price: $26.40 / DZ
    ... UPC Code: 849609017664''')
    {'VENDORID': 27, 'VENDOR': 'SANTEE', 'ITEMNO': 'ST257B', 'DESCRIPTION': 'Charm Killer Pro Eyeshadow(1/2dz/display, 6dz/case)', 'COST': '26.40', 'UPC': '849609017664'}
    >>> extract_product_from_text(''' & CONTOUR ..
    ... JK035
    ... Blush & Contour (6pc/display, 4dz/case)
    ... Price: $23 UPC Code: 849609012362
    ... NATURAL GLOW''')
    {'VENDORID': 27, 'VENDOR': 'SANTEE', 'ITEMNO': 'JK035', 'DESCRIPTION': 'Blush & Contour (6pc/display, 4dz/case)', 'COST': '23', 'UPC': '849609012362'}
    """

    def extract(pattern):
        return extract_ocr_pattern(pattern, text)

    item_no = extract(r"([A-Z]+[0-9]+[A-Z]?[\s]?([A-Z]+[\-][A-Z]+)?)")
    text = text[text.find(item_no) + len(item_no):]
    description = extract(r"(.*)Price")
    price = extract(r"Price: \$(\d+(\.\d*)?).*UPC")
    upc = extract(r"UPC Code: (\d*)")
    return {
        "VENDORID": 27,
        "VENDOR": "SANTEE",
        "ITEMNO": item_no,
        "DESCRIPTION": description,
        "COST": price,
        "UPC": upc
    }


def main(pages, url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/SANTEE/PDF/fast_test_image.png",
    ... VENDORID=27,
    ... VENDOR="SANTEE",
    ... ITEMNO="ST257B",
    ... COST=26.4,
    ... UPC="849609017664",
    ... DESCRIPTION="Charm Killer Pro Eyeshadow(1/2dz/display, 6dz/case)",
    ... )
    """
    for page_image, ocr in pages:
        markers = find_markers(ocr)
        if has_four_pages_layout(markers):
            yield from process_four_product_layout_page(ocr, page_image)
        else:
            yield from process_eight_products_layout_page(ocr, page_image)


def has_four_pages_layout(markers):
    """
    >>> has_four_pages_layout([(0.066, 0.455), (0.508, 0.455), (0.066, 0.91), (0.508, 0.91)])
    True
    """
    return markers[0][1] > 0.3


def process_eight_products_layout_page(ocr, page_image):
    """ (page_image, page_ocr) ->  [(product_image, product), ...] """
    yield from marker_parser(
        [(page_image, ocr)],
        find_markers=find_markers,
        image_region=(0.090, -0.21, 0.3, 0.18),
        text_region=(-0.01, -0.04, 0.42, 0.05),
        extract_product_from_text=extract_product_from_text,
    )


def process_four_product_layout_page(ocr, page_image):
    """ (page_image, page_ocr) ->  [(product_image, product), ...] """
    yield from marker_parser(
        [(page_image, ocr)],
        find_markers=find_markers,
        image_region=(-0.01, -0.41, 0.44, 0.35),
        text_region=(-0.01, -0.07, 0.42, 0.11),
        extract_product_from_text=extract_product_from_text,
    )
