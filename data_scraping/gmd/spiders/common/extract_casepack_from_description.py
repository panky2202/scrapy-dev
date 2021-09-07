import re


def extract_casepack_from_description(description):
    """
    >>> extract_casepack_from_description('All In One Nail Polisher (BUF77) Princessa 48 piece display')
    '48'

    >>> extract_casepack_from_description('Lovely Lashes 1 Pair False Lashes/ 1 Tweezer/ 1 Mascara Dimensions: 4Lx0.7Wx5.1H (ME31)')

    >>> extract_casepack_from_description('<h1 data-mce-fragment=\\"1\\"><strong data-mce-fragment=\\"1\\">Prices are per dozen.</strong></h1>\\n<h1><strong data-mce-fragment=\\"1\\">Box Quantity: 36 DZ - S (8), M (10), L (10), XL (8)</strong></h1>')
    '36'

    >>> extract_casepack_from_description(None)

    >>> extract_casepack_from_description('')
    """
    if not description:
        return
    res = re.search(r"(\d+) *(?:pc|dz|count|ct|piece|roll|pks|unit|in a case)",
                    description, flags=re.IGNORECASE | re.MULTILINE)
    if res and res.group(1):
        return res.group(1)
