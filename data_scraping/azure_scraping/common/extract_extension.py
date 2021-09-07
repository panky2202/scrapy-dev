def extract_extension(name):
    """
    >>> extract_extension('test.data.pdf')
    'pdf'

    >>> extract_extension('none')

    >>> extract_extension('')
    """
    return None if '.' not in name else name.split('.')[-1]
