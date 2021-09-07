from PIL.Image import Image
from pyzbar import pyzbar
from pyzbar.wrapper import ZBarSymbol


def extract_data_from_barcode(barcode_image: Image):
    """
    Receives OCR barcode image, decode it, and extract information.
    >>> from PIL import Image
    >>> extract_data_from_barcode(Image.open("data_scraping/azure_scraping/common/barcode_example.jpg"))
    {'UPC': '0650781026418'}
    """
    barcode_data = pyzbar.decode(barcode_image, symbols=[ZBarSymbol.EAN13])
    return {
        "UPC": barcode_data[0][0].decode('utf-8') if barcode_data and barcode_data[0] else None,
    }
