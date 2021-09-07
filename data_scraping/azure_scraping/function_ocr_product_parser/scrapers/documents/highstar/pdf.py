from data_scraping.azure_scraping.common import extract_ocr_pattern, marker_parser
from data_scraping.azure_scraping.common.assert_item_in_parser_output import assert_item_in_parser_output


def find_markers(ocr):
    """For each product on an image this function returns unique (x, y), eg, a marker point
    >>> find_markers([
    ... ("1", 0.07, 0.5, 1, 1),
    ... ("Item:", 0.05, 0.5, 13, 1),
    ... ("27", 0.06, 0.5, 13, 1),
    ... ("690203100746", 0.3, 14, 1, 1),
    ... ])
    [(0.05, 0.5)]
    """

    return [
        (left, top)
        for text, left, top, width, height in ocr
        if text == 'Item:'
    ]


def extract_product_from_text(text):
    """Recives OCR text, extracts product. Text could contain garbage or wrong reads.
    >>> extract_product_from_text('''Item: 425A
    ... 32" BOXING SET (MEXICO FLAGS)
    ... Color:
    ... Size:
    ... Packing: 6 Pc/Case
    ... Case Weight: 54.20 lb
    ... Case Volume: 10.665029 ft
    ... Unit: PC Price:''')
    {'VENDORID': 1087, 'VENDOR': 'HIGH STAR TOYS', 'ITEMNO': '425A', 'DESCRIPTION': '32" BOXING SET (MEXICO FLAGS)'}
    """

    def extract(pattern, occurrence):
        return extract_ocr_pattern(pattern, text, occurrence)

    itemno = extract(r'Item:\s\S+', 0)
    description = extract(r'Item:.+Color:', 0)

    if itemno:
        description = description.replace(itemno, '').replace('Color', '').strip()
        itemno = itemno.replace('Item:', '').replace('Color', '').strip()

    return {
        "VENDORID": 1087,
        "VENDOR": "HIGH STAR TOYS",
        "ITEMNO": itemno,
        "DESCRIPTION": description,
    }


def main(pages, url):
    """[(page_image, page_ocr), ...] -> [(product_image, product), ...]

    >>> assert_item_in_parser_output(
    ... parser=main,
    ... url="https://gmdstoragestaging.blob.core.windows.net/documents/HIGHSTAR/PDF/32'%20boxing%20set.pdf",
    ... VENDORID=1087,
    ... VENDOR="HIGH STAR TOYS",
    ... ITEMNO="425A",
    ... DESCRIPTION='32" BOXING SET (MEXICO FLAGS)'
    ... )
    """

    return marker_parser(
        pages,
        find_markers=find_markers,
        image_region=(-0.23, 0, 0.21, 0.16),
        text_region=(-0.01, 0, 0.23, 0.2),
        extract_product_from_text=extract_product_from_text,
    )
