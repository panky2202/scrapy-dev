Let's pump your refactoring game! We will start with a contract class, and try to refactor it to its superior version.


## Initial code

```python
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
        for x in output:
            if isinstance(x, dict):
                for k, v in self.meta.items():
                    got = x.get(k)
                    got = str(got)
                    v = str(v)
                    if '*' in v:
                        m = re.compile(v.replace("*", ".*"))
                        if not m.search(got):
                            raise ContractFail(
                                    f"\n{k}: '{v}' not in '{got}'")
                    elif got != v:
                        raise ContractFail(
                            f"\nExpected => '{k}' = '{v}'\n"
                            f"Found ====> '{k}' = '{got}'")
                return
        raise ContractFail('No items parsed!')
```

We instantly see the one big issue:
- complex logic with no tests

This logic has tons of edge cases, however, we don't run any tests against them. Possibility of bugs very high. We could not reliably use this class. Let's refactor it!

## It's hard to do integration testing
To be able to test a contract as a whole, we need to:
- setup s Spider and define parse() function. You can't make a Contract instance without a Spider
- this parse() function should have our contract
- this parse() function should request a real website with real data
- this real data should be parsed
- only then our test contract should be called

This is way too much hassle to set up in a doctest. Plus, our edge cases will also include the logic of spider, request, and parse. Our test will cover more code under it. More code - exponentially more edge cases.

Thus, we should **isolate** our complex and interesting logic and **test it in isolation**. This is very easy to do:

```python
def check_flex_contract(contract, items):
    for x in items:
        for k, v in contract.items():
            got = x.get(k)
            got = str(got)
            v = str(v)
            if '*' in v:
                m = re.compile(v.replace("*", ".*"))
                if not m.search(got):
                    raise ContractFail(
                        f"\n{k}: '{v}' not in '{got}'")
            elif got != v:
                raise ContractFail(
                    f"\nExpected => '{k}' = '{v}'\n"
                    f"Found ====> '{k}' = '{got}'")
        return
    raise ContractFail('No items parsed!')


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
        items = (x for x in output if isinstance(x, dict))
        check_flex_contract(contract, items)
```
Now we are getting somewhere! check_flex_contract() contains all the interesting logic in question, but yet it is isolated and easy to tests. We can test it without creating spiders or running real requests. 


## Run TDD cycles

### 1. Add test that fails
```python
def check_flex_contract(contract, items):
    """
    >>> check_flex_contract(
    ... {'a': 'hello', 'b': 12},
    ... [{'a': 'not the thing', 'b': 2}, {'a': 'hello', 'b': 12, 'c': 'excessive data'}]
    ... )
    """
    for x in items:
        for k, v in contract.items():
            got = x.get(k)
            got = str(got)
            v = str(v)
            if '*' in v:
                m = re.compile(v.replace("*", ".*"))
                if not m.search(got):
                    raise ContractFail(
                        f"\n{k}: '{v}' not in '{got}'")
            elif got != v:
                raise ContractFail(
                    f"\nExpected => '{k}' = '{v}'\n"
                    f"Found ====> '{k}' = '{got}'")
        return
    raise ContractFail('No items parsed!')
```
This test miserable fails! :smile:
Our contract expected, that items will be an array of 1 item. Which is possible, but very restrictive and confusing to use. Scrapy allows multiple return items. Let's add multiple items support.

### 2. Make it pass
```python
def check_flex_contract(contract, items_to_test):
    """
    >>> check_flex_contract(
    ... {'a': 'hello', 'b': 12},
    ... [{'a': 'not the thing', 'b': 2}, {'a': 'hello', 'b': 12, 'c': 'excessive data'}]
    ... )
    """
    for x in items_to_test:
        for k, v in contract.items():
            got = x.get(k)
            got = str(got)
            v = str(v)
            if '*' in v:
                m = re.compile(v.replace("*", ".*"))
                if not m.search(got):
                    raise ContractFail(
                        f"\n{k}: '{v}' not in '{got}'")
        return
    raise ContractFail('No items parsed!')
```
We lost some logic, but now our test is green. Don't worry, we will return the logic later.

### 1. Add test that fails
```python
def check_flex_contract(contract, items_to_test):
    """
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
    scrapy.exceptions.ContractFail: The most similar item: {
        'a': 'hello' - Error! Dose not contain 'helo'
        Error! Item dose not contain 'e': 'excessive data'
        'b': '12'
        'f': 'test'
    }
    """
```
We added the second test. As you can see, when we search for hundreds of items, it would be useful to show the most similar item. Without it, the error report user would have to check the spider's output, which would slow him down.

### 2. Make it pass

```python

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
    scrapy.exceptions.ContractFail: The most similar item: {
        'a': 'hello' - Error! Dose not contain 'helo'
        Error! Item dose not contain 'e': 'excessive data'
        'b': '12'
        'f': 'test'
    }
    """

    scores = [(item, get_flex_difference(contract, item)) for item in items_to_test]
    similar_item, min_difference = min(scores, key=lambda x: x[1])

    if min_difference:
        raise ContractFail('The most similar item: {' + difference_report(contract, similar_item) + '\n}')

```
As you can see I've extracted several new functions and run TDD cycle for them. TDD is recursive. I found some very rare edge cases like:
```
>>> get_flex_difference({'a': 'None',}, dict())

...

# this line returns None
got = x.get(k)

# this converts it to 'None' :smile:
got = str(got)
```

## Conclusion
As you can see, TDD produces much more code. However, the code is of superior quality:
- Readable. The code split into functions, functions have documentation
- Edge cases tested. Not all tho
- Code can continue to evolve. Now when it covered with tests, we can change parts of the code and do not afraid to break something. No more "if it works don't touch it"

P.S.
check_flex_contract() missing empty items edge-case tests, you should always test on empty. This function will fail on empty items.

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=Refactoring-Guide.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
