import re

from data_scraping.azure_scraping.common.extract_text import extract_text_from_region


def check_valid_upc(upc):
    """
    Check if a UPC-A is valid
    >>> check_valid_upc('602846701693')
    True

    >>> check_valid_upc('602846701692')
    False

    >>> check_valid_upc('12345670')
    True

    >>> check_valid_upc('12345671')
    False

    >>> check_valid_upc('7591295301116')
    True

    >>> check_valid_upc('7591296004067')
    False

    >>> check_valid_upc('75912960040672')
    True
    """
    upc_str = upc[:-1]
    digit = upc[-1]

    odd_sum = 0
    even_sum = 0
    for i, char in enumerate(upc_str):
        j = i + 1
        if j % 2 == 0:
            even_sum += int(char)
        else:
            odd_sum += int(char)

    if len(upc) == 13 or len(upc) == 17:
        total_sum = odd_sum + (even_sum * 3)
    else:
        total_sum = (odd_sum * 3) + even_sum
    mod = total_sum % 10
    check_digit = 10 - mod
    if check_digit == 10:
        check_digit = 0
    if str(check_digit) == digit:
        return True
    else:
        return False


def item_no_from_url(url):
    """
    >>> item_no_from_url('https://gmdstoragestaging.blob.core.windows.net/documents/CBB/CBB%20PICS/0816.jpg')
    '0816'

    >>> item_no_from_url('/documents/CBB/CBB%20PICS/hello.jpg')
    'hello'

    >>> item_no_from_url('')

    >>> item_no_from_url('https://gmdstoragestaging.blob.core.windows.net/documents/CBB/CBB%20PICS')
    """
    if not url:
        return

    file = url.split('/')[-1]
    if '.' not in file:
        return

    return file.split('.')[0]


def upc_from_product_text(product_text):
    """
    >>> upc_from_product_text('72527\\n 7  2527-273-041  6 some-thing 32 \\ndfas')
    '725272730416'

    >>> upc_from_product_text('72527\\n 7  2527-273-041  2 some-thing 32 \\ndfas')

    >>> upc_from_product_text('72527\\n 1 7  2527-273-041  6 8 some-thing 32 \\ndfas')

    >>> upc_from_product_text('')

    >>> upc_from_product_text('725272730416')
    '725272730416'

    >>> upc_from_product_text('725212730704. 72527\\n 7  2527-273-041  6 some-thing 32 \\ndfas')
    '725212730704'
    """
    if not product_text:
        return

    clean_text = product_text.replace(' ', '').replace('-', '')

    for upc in re.findall('[0-9]{4,20}', clean_text, flags=re.MULTILINE):
        if check_valid_upc(upc):
            return upc


def upc_parser(pages, url, vendor_id, vendor):
    for page_image, ocr in pages:
        product_text = extract_text_from_region(ocr)
        product = {
            'VENDORID': vendor_id,
            'VENDOR': vendor,
            'ITEMNO': item_no_from_url(url),
            'UPC': upc_from_product_text(product_text),
        }

        yield page_image, product
