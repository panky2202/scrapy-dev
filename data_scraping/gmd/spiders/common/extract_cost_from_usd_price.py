import re


def extract_cost_from_usd_price(price):
    """
    >>> extract_cost_from_usd_price('$1.99')
    '1.99'
    >>> extract_cost_from_usd_price('$69')
    '69'
    """
    if not price:
      return
    return re.search(r"\$(\d*.*\d*)", price).group(1)
