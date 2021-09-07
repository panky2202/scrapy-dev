## 1. Doctests

The simplest and the most powerful `unit testing` option in Python. Please, read and
understand [python doctest](https://docs.python.org/3/library/doctest.html).

Check out this workflow:

- For example, you need to extract CASEPACK `48` from `All In One Nail Polisher (BUF77) Princessa 48 piece display`
- This function is hard to write from the top of your head
- So you create a function declaration:

```
def extract_casepack(description):
   pass
```

- Then you form your expectations:

```
def extract_casepack(description):
    """
    >>> extract_casepack('All In One Nail Polisher (BUF77) Princessa 48 piece display')
    '48'

    >>> extract_casepack('Lovely Lashes 1 Pair False Lashes/ 1 Tweezer/ 1 Mascara Dimensions: 4Lx0.7Wx5.1H (ME31)')
    """
    pass
```

[Doc tests](https://docs.python.org/3/library/doctest.html) can be actually executed in your IDE by pressing shift+enter
or another hotkey. Plus they will be executed by GitLab during the test process. Or you can
run `pytest --doctest-modules` in the terminal.

Currently, the function has no body, so the tests will fail.

- And only then you write the function body, so the tests will pass

```
def extract_casepack(description):
    """
    >>> extract_casepack('All In One Nail Polisher (BUF77) Princessa 48 piece display')
    '48'
    
    >>> extract_casepack('Lovely Lashes 1 Pair False Lashes/ 1 Tweezer/ 1 Mascara Dimensions: 4Lx0.7Wx5.1H (ME31)')
    """
    res = re.search(r"(\d+) *(?:pc|dz|count|ct|piece|roll|pks)", description, flags=re.IGNORECASE)
    if res and res.group(1):
        return res.group(1)
```

- And now you have 100% working and documented function.

**Doctests allow test functions in isolation. They provide a convenient way to test rare edge cases.**

## 2. Spider Contracts

Spider Contracts are an `integration testing` option for Scrapy Spiders. Look similar to doctests, but have a custom runner and syntax. Please, read and understand [Spider Contracts](https://docs.scrapy.org/en/latest/topics/contracts.html?highlight=contracts).

Their main goal is to check, that `parse()` function produces correct `scrapy.Requests` and Product from a URL. They will actually make a live request to an actual website and validate, that `parse()` grabs correct data. This is useful in 3 ways:

1. We will instantly know when a website will change its layout
2. This is a super convenient way to develop spiders. First, you define a contract, then you write your parse code. Meanwhile, you run the contract to check, that your code is correct
3. On code review you have proof that your code produces correct Products

To run Spider Contracts, please, run `scrapy check <spider_name>`

### Example contracts

`parse` expects to receive 10..20 requests from the parsing page https://www.updinc.net/. 2 of these requests should contain
url https://www.updinc.net/catalog/?catid=9&pageNum=1 and https://www.updinc.net/catalog/?catid=3&pageNum=1

```
def parse(self, response, **kwargs):
    """ Example contract

    @url https://www.updinc.net/
    @returns requests 10 20
    @request https://www.updinc.net/catalog/?catid=9&pageNum=1
    @request https://www.updinc.net/catalog/?catid=3&pageNum=1
    """ 
    pass
```

---

`parse` expects to receive 4..inf items from parsing page https://www.updinc.net/. 1 of these items should contain
fields {'a': 1, 'b': '2'}

```
def parse_details(self, response):
        """ Example contract

        @url https://www.updinc.net/
        @returns items 4
        @partial {\
            "a": 1,\
            "b": "2"\
        }
        """
        pass
```

### Common errors
There are several confusion errors you can get when working with spider contracts. Sometimes contracts need JSON data. And this JSON data should be a valid JSON. It is very easy to mess up the JSON.
- You should use `\\"` instead of `\"` in JSON string because it is a string inside a comment
- You should double-check that the last item in JSON has no comma at the end
- You should use double quotes `"` and not single quotes `'` for strings

### Testing Chain Requests
Sometimes you need to pass additional data from one request to the other with `cb_kwargs`:
```python
yield scrapy.Request(pricing_url, callback=self.parse_price, cb_kwargs=parsed_product)
```
The issue arrives when you need to test `parse_price` in isolation. It needs `cb_kwargs` to function properly. You can define `cb_kwargs` in a contract:
```python
 def parse_price(self, response, **kwargs):
        """ Parse a product's price from external api.

        @cb_kwargs {\
            "VENDORID": 32, \
            "VENDOR": "SUNSHINE CORP", \
            "ITEMNO": "l413c-s", \
            "PAGE_URL": "https://sunshine5866.com/collections/ladies-panties/products/l413c-s" \
            }
        @url https://volumediscount.hulkapps.com/shop/get_offer_table?pid=5751417700511&store_id=sunshine-int-l-corporation.myshopify.com
        @returns items 1
        @partial {\
            "VENDORID": 32,\
            "VENDOR": "SUNSHINE CORP",\
            "ITEMNO": "l413c-s",\
            "COST": 11.50,\
            "PAGE_URL": "https://sunshine5866.com/collections/ladies-panties/products/l413c-s"\
        }
        """
```

## 3. PyLint

- run `pylint ./gmd -E`

This will check our code on common errors.

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=Automated-Testing-with-Python.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
