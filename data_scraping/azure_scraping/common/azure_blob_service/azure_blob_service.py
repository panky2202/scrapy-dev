import mimetypes
import os
from types import SimpleNamespace

from azure.core.exceptions import ResourceNotFoundError
from azure.storage.blob import BlobServiceClient, BlobClient, ContentSettings
from furl import furl


def set_blob_url_storage_account(storage_account_name, url):
    """
    >>> set_blob_url_storage_account('test', '/documents/example/test_data.msg')
    'https://test.blob.core.windows.net/documents/example/test_data.msg'

    >>> set_blob_url_storage_account('test', 'https://gmdstoragestaging.blob.core.windows.net/GMALLI~1.pdf')
    'https://test.blob.core.windows.net/GMALLI~1.pdf'

    >>> set_blob_url_storage_account('test', None)

    >>> set_blob_url_storage_account(None, '/documents/example/test_data.msg')
    '/documents/example/test_data.msg'
    """
    if not url:
        return
    if not storage_account_name:
        return url
    f = furl(url)
    f.origin = f'https://{storage_account_name}.blob.core.windows.net'
    return f.url


def azure_blob_service(connect_str=os.environ.get('AZURE_STORAGE_ACCOUNT')):
    service = BlobServiceClient.from_connection_string(connect_str) if connect_str else None

    def blob_client_from_url(uri):
        return BlobClient.from_blob_url(
            set_blob_url_storage_account(os.environ.get("AZURE_STORAGE_ACCOUNT_NAME"), uri),
            credential=service.credential if service else None
        )

    def get_blob_data(url):
        try:
            if not url:
                return
            blob = blob_client_from_url(url)
            return blob.download_blob().readall()
        except ResourceNotFoundError:
            pass

    def upload_blob_data(url, data):
        if not url:
            return
        blob = blob_client_from_url(url)
        blob.upload_blob(
            data,
            content_settings=ContentSettings(content_type=mimetypes.guess_type(url)[0]),
            overwrite=True
        )

    return SimpleNamespace(
        get_blob_data=get_blob_data,
        upload_blob_data=upload_blob_data,
    )
