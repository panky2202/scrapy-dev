from furl import furl
from scrapy.exceptions import CloseSpider


def get_next_url(url, page='page', limit_depth=40):
    """Get's next pagination url

    >>> get_next_url('https://www.handscraft.com/products.json?page=1&id=1')
    'https://www.handscraft.com/products.json?page=2&id=1'

    >>> get_next_url('https://www.handscraft.com/products.json')
    'https://www.handscraft.com/products.json?page=2'

    >>> get_next_url('https://www.handscraft.com/products.json?page=3', limit_depth=3)
    Traceback (most recent call last):
    ...
    scrapy.exceptions.CloseSpider
    """
    f = furl(url)
    nxt = int(f.args.get(page, 1)) + 1
    if nxt > limit_depth:
        raise CloseSpider(f'Too deep pagination for {url}')
    f.args[page] = str(nxt)
    return f.url
