import os

import pytest

from .azure_ocr_service import perform_ocr


@pytest.mark.integtest
def test_azure_ocr_service():
    page = perform_ocr(f'{os.path.dirname(__file__)}/example.pdf')[1]
    _, left, top, width, height = next(box for box in page if box[0] == 'POTATOE')

    assert 0.408 < left < 0.490
    assert 0.73 < top < 0.75
    assert 0.070 < width < 0.106
    assert 0.0065 < height < 0.0095


@pytest.mark.integtest
def test_azure_ocr_service_empty_image():
    pages = perform_ocr(f'{os.path.dirname(__file__)}/empty.jpeg')
    assert pages == [[]]
