import json
import logging
import re
import unicodedata
import warnings
from typing import Optional

import bs4
from pydantic import BaseModel, HttpUrl, PositiveInt, ConstrainedStr, PositiveFloat, parse_obj_as, \
    ValidationError, validator

warnings.filterwarnings("ignore", category=UserWarning, module='bs4')


def strip_html(html):
    """
    >>> strip_html('<h1 data-mce-fragment=\"1\"><strong data-mce-fragment=\"1\">Prices are per dozen.</strong> </h1><h1><strong data-mce-fragment=\"1\">Box Quantity: 36 DZ - S (8), M (10), L (10), XL (8)</strong></h1>')
    'Prices are per dozen. Box Quantity: 36 DZ - S (8), M (10), L (10), XL (8)'

    >>> strip_html(None)

    >>> strip_html('')
    ''

    >>> strip_html('hello world')
    'hello world'
    """
    if html is not None:
        return bs4.BeautifulSoup(html, features="lxml").get_text()


class NonEmptyString(ConstrainedStr):
    min_length = 1
    strip_whitespace = True


class UPC(ConstrainedStr):
    """Guarantees that a UPC is valid.

    >>> parse_obj_as(UPC, '039800040015')
    '039800040015'

    >>> parse_obj_as(UPC, '   039800040015 ')
    '039800040015'

    >>> parse_obj_as(UPC, '8-56023-01301-1')
    '856023013011'

    >>> parse_obj_as(UPC, '   \\'"039800040015\\' ')
    '039800040015'

    >>> parse_obj_as(UPC, '039')
    '039'

    >>> parse_obj_as(UPC, 'LOL_INTERNET')
    """

    @classmethod
    def validate(cls, string):
        upc = re.sub('[^0-9]', '', string)
        if len(upc) < 3 or len(upc) > 28:
            logging.error(f'{string} is not a UPC. Length must be between 3 - 28.')
            return None
        return upc


def clean_string(v):
    """Guarantees that a string is clean from html, newlines and whitespaces.

    >>> clean_string('  test  ')
    'test'

    >>> clean_string('  <a>test</a>    <a>test2</a>')
    'test test2'

    >>> clean_string('  ')

    >>> clean_string('text\\nanother')
    'text another'

    >> clean_string('\xa0 😄 \xc2 \xa0')
    '😄 Â'
    """
    res = unicodedata.normalize('NFKD', strip_html(v))
    res_with_single_space = ' '.join(res.split())
    return res_with_single_space if res_with_single_space else None


class Product(BaseModel):
    VENDORID: PositiveInt
    VENDOR: NonEmptyString
    PAGE_URL: HttpUrl
    ITEMNO: Optional[NonEmptyString]

    IMAGE_URL: Optional[HttpUrl]
    COST: Optional[PositiveFloat]
    UPC: Optional[UPC]

    CATEGORY: Optional[NonEmptyString]
    DESCRIPTION: Optional[NonEmptyString]
    CASEPACK: Optional[NonEmptyString]
    PK_SIZE: Optional[NonEmptyString]
    DESCRIPTION2: Optional[NonEmptyString]
    PAGE_TITLE: Optional[NonEmptyString]

    @validator('*', pre=True)
    def clean_data(cls, v):  # pylint: disable=no-self-argument
        if isinstance(v, str):
            return clean_string(v)
        return v

    class Config:
        allow_mutation = False


def parse_product(**kwargs):
    """Parses and validates product.
    All incoming data will be automatically stripped from whitespaces, html, new lines etc.
    All the data will be transformed to a correct type, eg '12' will be 12.0 if field type is Float.

    Args:
        kwargs: Product's fields, please, check Product's model structure
    Returns:
        A valid Product in dict form

    >>> parse_product(VENDORID='12', VENDOR='tst', PAGE_URL='https://test.com', ITEMNO='123', CASEPACK=' <a></a>  ')
    {'VENDORID': 12, 'VENDOR': 'tst', 'PAGE_URL': 'https://test.com', 'ITEMNO': '123'}

    >>> parse_product(VENDORID=1, VENDOR='tst', PAGE_URL='https://test.com', ITEMNO='123', CASEPACK=' <a>CP</a>  ')
    {'VENDORID': 1, 'VENDOR': 'tst', 'PAGE_URL': 'https://test.com', 'ITEMNO': '123', 'CASEPACK': 'CP'}

    >>> parse_product(VENDORID=1, VENDOR='tst', PAGE_URL='https://test.com', ITEMNO='   ')
    {'VENDORID': 1, 'VENDOR': 'tst', 'PAGE_URL': 'https://test.com'}
    """
    try:
        return json.loads(Product(**kwargs).json(exclude_unset=True, exclude_none=True))
    except ValidationError as e:
        ejson = json.loads(e.json())
        logging.log(logging.ERROR,
                    f"Field: {ejson[0]['loc'][0]} | "
                    f"Msg:{ejson[0]['msg']} | "
                    f"URL:{kwargs.get('PAGE_URL')} | "
                    f"Value:{kwargs.get(ejson[0]['loc'][0])}")
