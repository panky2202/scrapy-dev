from data_scraping.azure_scraping.common.barcode_extractor import extract_data_from_barcode
from data_scraping.azure_scraping.common.extract_text import extract_text_from_region


def add_marker_to_region(region, marker):
    left, top, w, h = region
    return left + marker[0], top + marker[1], w, h


def extract_image(image, region, marker):
    left, top, w, h = add_marker_to_region(region, marker)
    iw = image.width
    ih = image.height
    return image.crop((left * iw, top * ih, (left + w) * iw, (top + h) * ih))


def extract_text(ocr, region, marker):
    return extract_text_from_region(ocr, add_marker_to_region(region, marker))


def marker_parser(pages, find_markers, image_region, text_region, extract_product_from_text,
                  barcode_region=None):
    for page_image, ocr in pages:
        for i, marker in enumerate(find_markers(ocr)):
            product_image = extract_image(page_image, image_region, marker) if image_region else None
            product_text = extract_text(ocr, text_region, marker)
            product = extract_product_from_text(product_text)
            if barcode_region:
                barcode_image = extract_image(page_image, barcode_region, marker)
                barcode_product_data = extract_data_from_barcode(barcode_image)
                product.update(barcode_product_data)
            if product:
                yield product_image, product
