import json
import uuid

import pytest

from .azure_blob_service import azure_blob_service


@pytest.mark.integtest
def test_azure_blob_service():
    test_service = azure_blob_service()

    assert test_service.get_blob_data('documents/example/test_data.pdf')[:4] == b'%PDF'

    assert test_service.get_blob_data(None) is None

    target_uri = 'documents/example/test_data.json'
    token = str(uuid.uuid4())
    test_service.upload_blob_data(target_uri, json.dumps({'hello': token}))
    assert json.loads(test_service.get_blob_data(target_uri)) == {'hello': token}
