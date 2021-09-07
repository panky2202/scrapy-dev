Code style is not currently being enforced by CI/CD, however, please, try to follow it:
- No unused code
- Code is auto-formatted by your IDE. There is a hotkey to press, and your code will be formatted. Please, press this key before commit
- No excessive comments. Comments should be used as a last resort, when you need to explain **why** something is written. 

# Use subfunctions/variables instead of comments
If you rely on comments, you have the potential to improve your developer's skill drastically.

You make comments when feel, that function became complex and big, and you need to annotate what it does, so other devs could understand it. Instead of adding a comment, you should introduce a subfunction:
- Subfunction will make the function smaller and easier to read. This is a game-changer, code becomes drastically more readable. We can put in the head only small chunks of code, so making it physically smaller will boost your coding speed
- A subfunction has a name, that will describe the block without a text comment. A Text comment could not be checked by a compiler, function name can. Thus when refactoring happened and the code change, complete will check, that name still accurately describes the code. But comments can become stale.
- Subfunction can be doc tested, thus less time on debugging and easier refactoring. This will boost your speed

```python
# Loop Categories
for link in category_links:
  pass
```
This comment gives 0 value. Everyone knows that this is a loop with category links.

Instead of comments try to use clean function and variable names. Split your code on more functions and variables with names, then you will have more names in the code and will not need comments.

Instead of:

```python
# This regex extracts casepack from product description
res = re.search(r"(\d+) *(?:pc|dz|count|ct|piece|roll|pks|unit|in a case)",
                    description, flags=re.IGNORECASE | re.MULTILINE)
# ... continue to use res as a casepack ...
```
Make a function:
```python
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
```
With a function and doctests you will have:
- a clean name
- tested code
- clean examples of behavior
- potentially reusable code

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=Code-Style.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
