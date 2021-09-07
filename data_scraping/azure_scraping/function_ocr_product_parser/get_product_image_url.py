from furl import furl


def get_product_image_url(url, product):
    """
    >>> url = 'https://productparsersa.blob.core.windows.net/documents/example/test_data.pdf'
    >>> product = {'VENDORID': '  123', 'ITEMNO': 'ABC   '}
    >>> get_product_image_url(url, product)
    'https://productparsersa.blob.core.windows.net/images/123_ABC.jpg'

    >>> url = 'documents/example/email.msg/test_data.pdf'
    >>> get_product_image_url(url, product)
    'images/123_ABC.jpg'
    >>> get_product_image_url(url, dict())
    """

    if 'VENDORID' not in product or 'ITEMNO' not in product:
        return

    host = furl(url).host
    vid = str(product["VENDORID"]).strip()
    inu = str(product["ITEMNO"]).strip()

    where = f'https://{host}/' if host else ''

    return f'{where}images/{vid}_{inu}.jpg'
