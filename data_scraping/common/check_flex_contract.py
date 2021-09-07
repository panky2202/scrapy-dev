def get_flex_difference(contract, item):
    """
    >>> get_flex_difference({'a': 'hello', 'b': 12}, {'a': 'hello', 'b': 12})
    0
    >>> get_flex_difference({'a': 'helo', 'b': 12}, {'a': 'hello', 'b': 12})
    1
    >>> get_flex_difference({'a': 'helo', 'b': 12}, {'a': 'hello', 'b': 13})
    2
    >>> get_flex_difference(dict(), dict())
    0
    >>> get_flex_difference({'a': 'hello', 'b': 12}, {'a': 'hello', 'b': 12, 'c': 'excessive data'})
    0
    >>> get_flex_difference({'a': 'hello', 'b': 12, 'c': 'excessive data'}, {'a': 'hello', 'b': 12})
    1
    >>> get_flex_difference({'a': 'None',}, dict())
    1
    """
    return len(contract) - sum(True for k, v in contract.items() if str(v) in str(item.get(k, '')))


def difference_report_field(k, v, item):
    v_str = str(v)
    item_v_str = str(item.get(k, ''))

    if k not in item:
        return f"Error! Item dose not contain '{k}': '{v_str}'"

    if v_str in item_v_str:
        return f"'{k}': '{item_v_str}'"

    return f"'{k}': '{item_v_str}' - Error! Dose not contain '{v_str}'"


def difference_report(contract, item):
    reports = [''] + sorted([difference_report_field(k, v, item) for k, v in contract.items()],
                            key=lambda x: 'Error!' not in x)
    return '\n    '.join(reports)


def check_flex_contract(contract, items_to_test):
    """
    >>> check_flex_contract({'a': 'hello', 'b': 12}, [])
    Traceback (most recent call last):
    ...
    Exception: Can't test contract, items are empty!

    >>> check_flex_contract(
    ... {'a': 'hello', 'b': 12},
    ... [{'a': 'not the thing', 'b': 2}, {'a': 'hello', 'b': 12, 'c': 'excessive data'}]
    ... )

    >>> check_flex_contract(
    ... {'a': 'helo', 'b': 12, 'e': 'excessive data', 'f': 'test'},
    ... [{'a': 'not the thing', 'b': 2}, {'a': 'hello', 'b': 12,  'f': 'test', 'c': 'excessive data'}]
    ... )
    Traceback (most recent call last):
    ...
    Exception: The most similar item: {
        'a': 'hello' - Error! Dose not contain 'helo'
        Error! Item dose not contain 'e': 'excessive data'
        'b': '12'
        'f': 'test'
    }
    """

    if not items_to_test:
        raise Exception('Can\'t test contract, items are empty!')

    scores = [(item, get_flex_difference(contract, item)) for item in items_to_test if item]
    similar_item, min_difference = min(scores, key=lambda x: x[1])

    if min_difference:
        raise Exception('The most similar item: {' + difference_report(contract, similar_item) + '\n}')
