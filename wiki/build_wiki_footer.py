import os

FOOTER_MARKER = """
---
---
"""


def get_wiki_articles(path='./'):
    """
    >>> articles = get_wiki_articles()
    >>> len(articles) > 5
    True
    >>> all(x.endswith('.md') for x in articles)
    True
    >>> any('code-reviews' in x for x in articles)
    True
    """

    results = []
    for dirpath, dirs, files in os.walk(path):
        for filename in files:
            fname = os.path.join(dirpath, filename)
            if fname.endswith('.md'):
                results.append(fname)
    return results


def change_article_footer(path):
    data = open(path, 'r').read()
    marker = data.rfind(FOOTER_MARKER)
    if marker < 0:
        return
    name = path.split('/')[-1]

    new_data = data[:marker + len(FOOTER_MARKER)] + f"""
### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712={name})

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
"""

    open(path, 'w').write(new_data)


def do_all_articles():
    """
    >>> do_all_articles()
    """
    for article in get_wiki_articles():
        change_article_footer(article)
