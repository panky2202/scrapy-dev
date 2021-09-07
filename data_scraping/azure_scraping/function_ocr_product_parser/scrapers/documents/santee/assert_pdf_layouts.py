import json

from PIL import Image


def assert_products_layout(parser, ocr_file_name, image_file_name, product_to_assert):
    with open(ocr_file_name, ) as json_file:
        ocr = json.load(json_file)
    image = Image.open(image_file_name)
    products = list(parser(ocr, image))
    products_data = [prod[1] for prod in products]
    assert product_to_assert in products_data

