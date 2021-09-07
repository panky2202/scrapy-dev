from io import BytesIO

from data_scraping.azure_scraping.common import azure_blob_service


def pil_image_to_bytes(img):
    temp = BytesIO()
    img.save(temp, format="JPEG")
    return temp.getvalue()


def store_products_images_service(images):
    service = azure_blob_service()
    for url, image in images:
        if image and url:
            service.upload_blob_data(url, pil_image_to_bytes(image))
