import json
import logging

import azure.functions as func

from data_scraping.azure_scraping.common import azure_blob_service, perform_ocr, url_supports_ocr, get_ocr_data_url


def run_ocr(blob_url, get_data, blob_service, ocr_service):
    if not url_supports_ocr(blob_url):
        logging.info(f'>>> Skipping, not supported {blob_url}')
        return

    ocr_blob_url = get_ocr_data_url(blob_url)
    ocr = blob_service.get_blob_data(ocr_blob_url)
    if ocr:
        logging.info(f'>>> Skipping, already has ocr data at {ocr_blob_url}')
        return

    data = get_data()

    logging.info(f'>>> Performing OCR for {blob_url}')
    ocr = ocr_service(data)

    logging.info(f'>>> Saving OCR results to {ocr_blob_url}')
    blob_service.upload_blob_data(ocr_blob_url, data=ocr)


def main(blob: func.InputStream):
    logging.info('>>> Python Blob trigger function processed %s', blob.name)
    service = azure_blob_service()

    run_ocr(
        blob_url=blob.uri,
        get_data=lambda: blob.read(),
        blob_service=service,
        ocr_service=lambda data: json.dumps(perform_ocr(data))
    )
