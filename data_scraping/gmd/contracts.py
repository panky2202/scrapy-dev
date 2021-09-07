# source: https://github.com/satyrius/mtgforge

import json

from jsondiff import diff
from scrapy.contracts import Contract
from scrapy.exceptions import ContractFail
from scrapy.http import Request

from data_scraping.common import parse_product, check_flex_contract


class ItemFlexContract(Contract):
    """ Contract to check scraped items data to be equal to expected values
        @item \
            @foo 17 \
            @bar JML Home Fashion \
            @desc home-gifts-burgundy-flower.html
    """

    name = 'item'

    def __init__(self, *args, **kwargs):
        super(ItemFlexContract, self).__init__(*args, **kwargs)
        self.meta = {}
        k = None
        for x in self.args:
            if x.startswith('@'):
                k = x[1:]
                self.meta.setdefault(k, [])
            elif k:
                self.meta.get(k).append(x)
        self.meta = {k: u' '.join(v) for k, v in self.meta.items()}

    def post_process(self, output):
        contract = self.meta
        items_to_test = (x for x in output if isinstance(x, dict))
        check_flex_contract(contract, items_to_test)


class ItemContract(Contract):
    """ Contract to check scraped items data to be equal to expected json
        @item_json {\
            "foo": "value",\
            "bar": 1,\
            "desc": "multi\\nline\\nstring"\
        }
    """

    name = 'item_json'

    def __init__(self, *args, **kwargs):
        super(ItemContract, self).__init__(*args, **kwargs)
        # Glue splited contract args back to parse it as json instead
        arg = u' '.join(args[1:])
        try:
            self.expected_json = json.loads(arg)
        except Exception as e:
            raise ContractFail(f'Contract Failed! Malformed Json.\n'
                               f'Please check if the @partial contract has a proper json structure.\n'
                               f'Error message: {str(e)}\n'
                               f'Parsed Json: {arg}')

    def post_process(self, output):
        for x in output:
            if isinstance(x, dict):
                try:
                    self.testcase_post.maxDiff = None
                    self.testcase_post.assertEqual(dict(x), self.expected_json)
                except AssertionError as e:
                    raise ContractFail(e)


def json_diff_score(a, b):
    """Calculates diff size between jsons

    >>> json_diff_score({'a': 1, 'b': 2}, {'a': 1}) > json_diff_score({'a': 1, 'b': 2}, {'a': 1, 'b': 3})
    True

    >>> json_diff_score({'a': 1, 'b': 2}, {'a': 1}) < json_diff_score({'b': 2}, {'e': 2})
    True
    """
    return len(str(diff(a, b)))


class PartialContract(ItemContract):
    """Contracts to check one of the result items data has expected json.
        @partial {\
            "foo": "value",\
        }
    """
    name = 'partial'

    def post_process(self, output):
        data = []
        for x in output:
            if isinstance(x, dict):
                try:
                    self.testcase_post.maxDiff = None
                    expected = set(self.expected_json.items())
                    item = set(parse_product(**x).items())
                    self.testcase_post.assertTrue(expected <= item)
                    return
                except AssertionError:
                    data.append((x, json_diff_score(x, self.expected_json)))

        if not data:
            raise ContractFail('No items found')
        self.testcase_post.maxDiff = None
        simular = min(data, key=lambda x: x[1])[0]
        self.testcase_post.assertEqual(dict(simular), self.expected_json)


class RequestContract(Contract):
    """Contract to check returned request url and meta. To assert meta
    pass key-value pairs right after url. Keys should starts with @.
    @request http://example.com @foo 1 @bar Lorem ipsum
    """
    name = 'request'

    def __init__(self, *args, **kwargs):
        super(RequestContract, self).__init__(*args, **kwargs)
        self.url = self.args[0]
        self.meta = {}
        k = None
        for x in self.args[1:]:
            if x.startswith('@'):
                k = x[1:]
            elif k:
                self.meta.setdefault(k, []).append(x)
        self.meta = {k: u' '.join(v) for k, v in self.meta.items()}

    def post_process(self, output):
        for x in output:
            if isinstance(x, Request):
                if x.url.lower() == self.url.lower():
                    for k, v in self.meta.items():
                        got = x.cb_kwargs.get(k)
                        if got != v:
                            raise ContractFail(
                                'Request with url {} has the following value '
                                'for cb_kwargs argument "{}": "{}". '
                                'Expected "{}"'.format(x.url, k, got, v))
                    return
        raise ContractFail('Request with url {} expected'.format(self.url))
