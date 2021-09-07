from unittest.mock import Mock

from .function_ocr import run_ocr, get_ocr_data_url


def test_calls_ocr_when_has_no_stored_ocr_data():
    url = 'https://productparsersa.blob.core.windows.net/documents/example/test_data.pdf'
    ocr_url = get_ocr_data_url(url)
    mock_get_data = Mock(return_value='blob_data')
    mock_blob_service = Mock(**{'get_blob_data.return_value': None})
    mock_ocr_service = Mock(return_value='ocr_data')

    run_ocr(url, mock_get_data, mock_blob_service, mock_ocr_service)

    mock_get_data.assert_called_once()
    mock_ocr_service.assert_called_with('blob_data')
    mock_blob_service.get_blob_data.assert_called_with(ocr_url)
    mock_blob_service.upload_blob_data.assert_called_with(ocr_url, data='ocr_data')


def test_doesnt_call_ocr_when_has_stored_ocr_data():
    url = 'https://productparsersa.blob.core.windows.net/documents/example/test_data.pdf'
    ocr_url = get_ocr_data_url(url)
    mock_get_data = Mock(return_value='blob_data')
    mock_blob_service = Mock(**{'get_blob_data.return_value': 'old_ocr_data'})
    mock_ocr_service = Mock(return_value='ocr_data')

    run_ocr(url, mock_get_data, mock_blob_service, mock_ocr_service)

    mock_get_data.assert_not_called()
    mock_ocr_service.assert_not_called()
    mock_blob_service.get_blob_data.assert_called_with(ocr_url)
    mock_blob_service.upload_blob_data.assert_not_called()
