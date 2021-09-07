from data_scraping.azure_scraping.common import marker_parser
from data_scraping.azure_scraping.common.assert_item_in_parser_output import assert_item_in_parser_output


def find_markers(ocr):
    """For each product on an image this function returns unique (x, y), eg, a marker point
    >>> find_markers([
    ... ("1", 0.07, 0.5, 1, 1),
    ... ("Case:", 0.05, 0.5, 13, 1),
    ... ("27", 0.06, 0.5, 13, 1),
    ... ("690203100746", 0.3, 14, 1, 1),
    ... ])
    [(0.05, 0.5)]
    """

    result = [
        (left, top)
        for text, left, top, width, height in ocr
        if text.startswith('Case:')
    ]

    return result


def extract_product_from_text(text):
    """Recives OCR text, extracts product. Text could contain garbage or wrong reads.
    >>> extract_product_from_text('''115-PF-76154
    ... Party Is Here Banner
    ... Case: 144
    ... 9 Cases
    ... ''')
    {'VENDORID': 1113, 'VENDOR': 'TECTRON', 'ITEMNO': '115-PF-76154', 'DESCRIPTION': 'Party Is Here Banner'}
    """

    items = text.strip('\n\r ').split('\n')

    return {
        "VENDORID": 1113,
        "VENDOR": "TECTRON",
        "ITEMNO": items[0],
        "DESCRIPTION": items[1],
    }


def main(pages, url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/TECTRON/PDF/example.pdf",
    ... VENDORID=1113,
    ... VENDOR="TECTRON",
    ... ITEMNO="115-PF-78802",
    ... DESCRIPTION='Dancing Bear Blowouts'
    ... )

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/TECTRON/PDF/example.pdf",
    ... VENDORID=1113,
    ... VENDOR="TECTRON",
    ... ITEMNO="115-PF-78813",
    ... DESCRIPTION='Table Cloth Dancing Bear'
    ... )
    """

    return marker_parser(
        pages,
        find_markers=find_markers,
        image_region=(0, -0.35, 0.4, 0.3),
        text_region=(-0.005, -0.035, 0.4, 0.10),
        extract_product_from_text=extract_product_from_text,
    )
