**Making Scrapy Spiders is easy!**

We assume you:

- Know Python 3
- Read and follow [Scalable Software Development Guide](Scalable-Software-Development-Guide.md)
- Know [Python Generators](https://wiki.python.org/moin/Generators)
- Know git
- Have a modern Python IDE like [PyCharm CE](https://www.jetbrains.com/pycharm/download/)
- Read and understand [Scrapy Tutorial](https://docs.scrapy.org/en/latest/intro/tutorial.html)
- Know how to use terminal

# Preparing your environment (required)

- Download the Scrapy Spider repo
- Read [How To Setup Python Virtual Environment](How-To-Setup-Python-Virtual-Environment.md) guide
- Now you should have `.venv` folder in your repo root, and your IDE should be configured to automatically activate this
  environment in your terminal
- Don't forget to run `pip install -e .`, this will run `setup.py` script and prepare your environment for development.
  For example, it may install [git hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks) that will make your
  life easier

# How to make Scrapy Spiders

### 1. Find a vendor's website URL to scrape

There are many websites to scrape and many developers working on them in parallel. To manage this work we
use [Airtable](https://airtable.com/tblAFjwfpJ1XuGBvq/viwGpLoaqZMyGuuLm?blocks=hide). In
the [Airtable](https://airtable.com/tblAFjwfpJ1XuGBvq/viwGpLoaqZMyGuuLm?blocks=hide) in `Scrapy` table you can find
vendors waiting to be scrapped.

Vendors typically have:

- Name
- Id
- Website URL
- Priority
- A developer assigned to its spider

Grab a top priority vendor (1 is a higher priority than 99), that is not assigned to any developer. The vendor should
have `Todo` status, eg `Done` is done. Assign this vendor to yourself, and change its status to `In Progress`. Now you
have a URL to scrape, and a Spider to develop.

### 2. Create a new branch

- Read and follow [Branch Name Convention](Branch-Name-Convention.md)
- Read and follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- Create a new branch from `dev` branch. `dev` - is our default branch. We should aim to merge things into it

### 3. Start Merge Request to `dev`

All communication and work on Spiders happen in
a [merge request](https://docs.gitlab.com/ee/user/project/merge_requests/creating_merge_requests.html). The request
should use `Spider Merge Request` template. You can choose the template during the Merge Request creation. Then follow
the instructions in `Spider Merge Request`.

### 3. Code the Spider!

Here comes the fun part. Read [How to Develop Scrapy Spiders](How-to-Develop-Scrapy-Spiders.md) guide.

# What data do we need to collect

- ItemNumber - unique id of an item inside the vendor
- UPC - a number that will be incode into a barcode, so scanners could find the item. In theory unique if of the item
  Globally in the world, but often it is not the case. We can have 2 different items with the same UPC
- Image - The item's image
- Descriptions - The item's description

You will find, that sometimes we collect more data in different spiders/parsers, like, cost or category. We do not need
it at the current state, skip all additional fields.

Sometimes we can collect image, but can't collect UPC. Or we can collect UPC but could not find an image. We want to
grab the partial data in this case. It is ok to have a UPC without an image and vice versa.

# Spider Architecture

### 1. General structure

- Spiders are python modules located in `./data_scraping/gmd/spiders`
- Each spider responsible for scraping 1 e-commerce website
- Each spider has a parent class `scrapy.Spider`
- There are 2 mandatory fields `name`  and `start_urls`.
    - `name` is unique spider name, which will be referenced when we run a spider
    - `start_urls` - initial pages the spider will crawl
- `def parse(self, response, **kwargs):`  is a spider entry point, this function will be called for each `start_urls`
- Parse function is a generator. It can yield `scrapy.Requests` and an items
    - `scrapy.Request` has a `URL` and a `parse callback` that will receive the `URL` and act like the initial `parse()`
    - item is a `dict()`, it will be added to Zyte cloud, or to any other connected output

**The goal of all spiders is to consume `start_urls` and output Product items**

### 2. Data flow

The item's data comes from outside, from external websites, from an imperfect world. All external data should be parsed,
cleaned, and validated on borders of any system.

Let's assume you are parsing email from a website. Actually millions of emails from millions of pages. Some of these
emails will be clean and valid like `some@google.com`, but some of them will be unrefined and dirty
like `html tags />    some@google.com   <other html tags`. And ofc some of them will be just `None` or empty strings.

We want this unrefined data to be cleaned and validated before we put it into our database, into our core. This is where
schema and types come into play.

If we put our dirty external data through a schema, we will receive clean and valid data. As simple as it sounds.

For example a *string* `"html>  23 <html"` when put through our int schema will become an *integer number* 23

Scrapers collect unrefined string and push it to our Pasrsing API vie GraphQL protocol. The API is located
at `./data_processing/packages/gmd/src/features/scraping`. The API has the schema implemented, it refines and validates
all incoming data, thus don't worry pushing garbage to api.

On Python side we use [pydantic](https://pydantic-docs.helpmanual.io/) as a schema library. Please, read and understand
its tutorial. **Our data shape is defined in `common/Product.py`. Your goal is to fulfill this shape**

### 3. Shared code

Sometimes you see repeating patterns in the code. This is a good hint to refactor the code into a
separate `common module`, thus logic could be reused and code simplified.

You can find common modules in `./common` folders. Time-to-time check these folders and study the common modules. They
are useful building blocks you can use to speed up your spider development.

Beware tho:

- **Do not make a module common if it's not actually common, but you feel that it may be common in the future**
- **Do not make things common if they are the same text but related to different abstract logic**

## Automated testing

- [Introduction to Automated Testing](Introduction-to-Automated-Testing.md)
- [Automated Testing with Python](Automated-Testing-with-Python.md)

## How to add dependencies

- run `pip install <dependency>` from your virtual environment
- `pip freeze | grep <dependency>` and copy the `<dependency>==<version>` string
- append the the `<dependency>==<version>` string to requirements.txt

## XPath

During spider development you will encounter many magic lines likes this:

```
response.xpath('//div[@class ="details_product_sku"]/text()').get(),
```

This is [xpath](https://www.w3schools.com/xml/xpath_intro.asp), please, read and understand it. Basically, xpath is
regexp for scraping data from xml.

### How to obtain a correct xpath?

You have 3 options:

- Open the website you scrape in chrome. Open dev tools. Open console. type `$x('//your xpath here')` and check the
  output. This way you can fast and interactively build a correct xpath.
- Run `scrapy shell <url>`, this will open a python [scrapy shell](https://docs.scrapy.org/en/latest/topics/shell.html),
  where you have access to the `response` object like in your `parse()` function. Here you can dynamically test
  different xpath and build the correct one.
- Run scrapy contracts and check console output. This one is kinda slow.

## scrapy.Request vs response.follow

- `scrapy.Request` uses absolute website path, eg `https://hello.com/123`
- `response.follow` will use relative path to response, eg `/123`

## Console scripts

From time to time you would like to write a handy utility python script that you want to run from GitLab CI/CD or from
the terminal. I'm talking about "scripts in package.json" npm analog.

- Open `setup.py`
- Add a new script to `console_scripts`. `<script name> = <script import path>:<function in the script>`
- Run `pip install -e .`
- Now you can run `<script name>` in your terminal. It will call corresponding function in corresponding module
- Read more [Explain Python entry points](https://stackoverflow.com/questions/774824/explain-python-entry-points)

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=How-to-Develop-Scrapy-Spiders.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
