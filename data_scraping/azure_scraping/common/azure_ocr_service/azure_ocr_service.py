import io
import os
import time

from PIL import Image
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import ComputerVisionOcrErrorException
from msrest.authentication import CognitiveServicesCredentials


def perform_ocr_(
        stream,
        endpoint=os.environ.get('AZURE_OCR_ENDPOINT'),
        subscription_key=os.environ.get('AZURE_OCR_KEY'),
):
    credentials = CognitiveServicesCredentials(subscription_key)
    client = ComputerVisionClient(endpoint, credentials)

    read_response = client.read_in_stream(stream, language='en', raw=True)
    if not read_response:
        raise Exception('Could not send OCR request to Azure')

    operation_id = read_response.headers["Operation-Location"].split("/")[-1]

    while True:
        results = client.get_read_result(operation_id)
        if results.status not in ['notStarted', 'running']:
            break
        time.sleep(1)

    def precision(value):
        return round(value, 3)

    for text_result in results.analyze_result.read_results:
        page = list()
        width = text_result.width
        height = text_result.height
        for line in text_result.lines:
            for word in line.words:
                page.append((
                    word.text,
                    precision(word.bounding_box[0] / width),
                    precision(word.bounding_box[1] / height),
                    precision((word.bounding_box[4] - word.bounding_box[0]) / width),
                    precision((word.bounding_box[5] - word.bounding_box[1]) / height)
                ))
        yield page


def image_to_byte_stream(image):
    with io.BytesIO() as stream:
        image.save(stream, format='PNG')
        return io.BytesIO(stream.getvalue())


def perform_ocr(data):
    """Feed it PDF, JPG, PNG and you will get OCR data
    Args:
        data: can be a filepath, PIL.Image, bytes, or a binary datastream
    Returns:
        [[(text, top, left, width, height), ...], [...] ... ] - you will get list of pages, each page contains list of words with boxes.

    """
    try:
        stream = None

        if isinstance(data, str):
            stream = open(data, 'rb')
        elif isinstance(data, bytes):
            stream = io.BytesIO(data)
        elif isinstance(data, Image.Image):
            stream = image_to_byte_stream(data)
        elif hasattr(data, 'read'):
            stream = data

        if not stream:
            raise Exception(f'Could not open f{data}')

        return list(perform_ocr_(stream))
    except ComputerVisionOcrErrorException:
        return [[]]
