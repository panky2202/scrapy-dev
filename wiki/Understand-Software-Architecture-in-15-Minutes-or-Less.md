How to make systems that don't suck? It's hard to wrap your head around what is a good software architecture, or a good
software design. Fear not, it is super easy, I will guide you in 15 minutes or less.

## The Main Software Development Issue

Consider this scenario:

- You want to change a small portion of your system
- But in order to do it, you should change some OTHER small portion in your system
- And cuz you change some OTHER portion, you now need to change some OTHER portion
- This causes `cascade change` or `change propagation`
- And now they ask you to manually test all the edge cases, or we will get lots of `bugs in production`. But how the
  hell they expect me to manually test this billing system of 5 million lines of code???

The main software development issue is: **Each new feature added will make it harder to add all subsequent features**
because of growing `cascade change` and harder `testing`.

And there will be an endless amount of feature to add:

- Software is made for business. It automates some business process and brings value to people
- Software is never finished. Business always wants to add more features in software
- Each new feature added will make it harder to add all subsequent features
- This means, that the price of adding a new feature is always growing with the software size
- At some point, you just can't add more features, it is too expensive regard money/time

## The Main Software Architecture Goal: Make it cheap to change your system

The main software architecture goal is to make adding new features as cheap as possible. A good architecture allows
easy, fast, and cheap changes.

As you can see there are 2 parts of making changes cheap:

- Stop `change propagation`
- Make it easy to `test` system after change

Good software architecture welcomes change.

## Follow These Rules, And Your System Will Welcome Change

Don't worry if you don't understand them, we will explain each rule in detail further.

0. Design your system so it would be easy to test. Automated testing must have. Without it each change should be
   manually testes - this is exponentially expensive.
1. You need exponential amount of tests to test your system as a whole. You need a liner amount of tests to test your
   system as a bunch of separated units. Thus, you should focus on type testing, and unit testing.
2. It is easy to change implementation, but expensive to change a protocol. Think carefully of protocols and rush with
   implementations.
3. Circular dependencies will amplify change propagation thus should be avoided.
4. More frequently updated modules should depend on less frequently updated modules. This will isolate your change on
   boundaries of your system and made a stable domain core. Stable domain core will protect you from cascade change. SQL
   column names tend to change, the concept that product has a price is immortal. Avoid coupling your system to
   implementation details of persistence layer, try to couple with stable domain.
5. It is easy to test and compose pure functions without side effects, however we can't build a valuable product with
   only them. You need to isolate side effects on the boundaries of your system and inject them as dependency.
6. We want to build systems with loosely coupled modules, however we can't build a valuable product with only them. You
   have a choice where to put your coupling. Couple things by feature, business tend to evolve in features.

## 0. Automated testing makes changes in your system cheap

How many times you have encountered this scenario:

- You have added a new feature
- You manually tested this feature - it works as expected
- You have deployed your feature to production
- Your new feature actually broken some old feature. But you didn't know it, cuz didn't test all the old features before
  the deployment
- Now you all sweating fixing the bug and deploy to production in hurry, praying it will work this time
- You have broke something else...

Or this:

- You have added a new feature
- You passed the product to QA
- QA found a bug and passed it back to you
- You fixed the bug and passed it back to QA
- QA found one more bug and passed it back to you
- This is May, you started to work on this feature in January, back and forth is super slow, and everyone is stressed
  out due to the delay

Developers are scared to refactor code, cuz they know, that it is super expensive to guarantee, that nothing has
broken. "If it works don't touch it" - this is the sound a scared developer makes. Changes are not welcome in such
system.

Now imagine, that after typing a new line of code, all the features of your system would be automatically checked:

- Ups, I've broken this thing, better fix it
- ... running tests one more time ...
- Now all tests passed and green! Time to push commit to git

Instant feedback. You don't even need to load the program context in your brain twice, you are ready to fix the issue
right away. No more back and forth tickets. No more waiting for the bug ticket from a customer. Fix issues right away
the moment they appear. No stress, can you say it about your work?

Business doesn't need to pay to a group of QA people, better shuffle this money to more professional devs, that don't
allow bugs in production.

Changes with automated testing are cheap, they are welcomed.

Most software companies heavily rely on manual QA. Manual QA is mad expensive, slow, and inefficient, but it is not the
worst thing about it. By the nature of the reality manual QA can't test all the edge cases of your system, and you
guarantee to have expensive bugs in production. But why it tho?

## 1. You need exponential amount of tests to test your system as a whole. You need a liner amount of tests to test your system as a bunch of separated units.

[Integrated tests are a scam](https://blog.thecodewhisperer.com/permalink/integrated-tests-are-a-scam).

## 2. It is easy to change implementation, but expensive to change a protocol.

To stop change propagation and make easy tests, we need to understand, what are `protocols` and `implementations`.

All software consists of hundreds and hundreds of connected and moving parts. Think of software as of Lego blocks model.
Blocks have different bodies: there are long blocks, square blocks, big blocks, and small blocks, etc. But all the
blocks have something in common: they all have the same pins and same sockets.

You can take any Lego block and connect it to any other block because the pins always match the sockets. Pins and
sockets are the Lego `protocol`, and the block's body is `implementation`.

All software consists of hundreds of `protocols` and `implementations` connected together in a giant machine.

Consider this code:

```python
def square(x: int):
    """Calculates square

    >>> square(4)
    16

    >>> square(-3)
    9

    >>> square(0)
    0
    """
    pass
```

This code defines the `protocol` of the square function. It defines *expectations* of the `square` function, defines
its *shape*.

Knowing square function protocol you can start to construct other functions of it:

```python
def power_of_4(x: int):
    """ Calculates power of 4

    >>> power_of_4(5)
    625
    """
    return square(x) * square(x)

def foo(x: int):
    """Calculates foo

    >>> foo(5)
    53
    """
    return 3 + square(x) * 2
```

An important inside: **you do not need to know or consider an implementation to work with a protocol**. Our
implementation could look like this:

```python
def square(x):
    return x * x
```

Or this:

```python
def square(x):
    return sum(abs(x) for _ in range(abs(x)))
```

As you can see there are endless amounts of `protocol` implementations. When we are working with a protocol, we
are `decoupled` of a particular implementation. In fact, we don't care, how `square()` will calculate the square.

Here comes a Huge inside:

### What is easy to change: `protocol` or `implementation`?

Implementation is made easy to change: you just update a body of the square() function, if tests are green - you follow
the protocol, and everything is perfect.

However, if you change square protocol, for example:

```python
def square(x: int):
    """ Calculates square

    >>> square(4)
    {'status': 'OK', 'result': 16}

    >>> square(-3)
    {'status': 'OK', 'result': 9}

    >>> square(0)
    {'status': 'OK', 'result': 0}
    """
    pass
```

You will cause a `cascade change` across your codebase: you need to update each square() call. Depend on the size of
your codebase, popularity of the square() function, and the existence of automated testing, you may or maybe not be
super sad and spend days of coding and testing.

### It is cheap to change implementation, it is expensive to change protocol

There are two types of protocol changes:

- Changing old stuff - super expensive
- Extending protocol, adding new stuff - cheap

Consider this change:

```python
def square(x: int, source: str = 'none'):
    """Calculates square
    Args:
        x (int): Value to square.
        source (str): Who called the function.
    Returns:
        int: Square of x

    >>> square(4)
    16

    >>> square(-3)
    9

    >>> square(0)
    0
    """
    pass
```

This is called `protocol extension`, eg, all calls of square() function across codebase are still valid. There is
no `cascade change` during extension. However, the reverse operation: deleting the `source` field, is expansive. You
will need to update each square() call.

**Protocol extension is cheap. However, you should try to avoid it, because protocol shrinking is expensive.**

### Protocols examples

```python
def square(x: int, source: str = 'none'):
    pass
```

```
Lego's pins and sockets
```

```python
class Product(BaseModel):
    VENDORID: PositiveInt
    VENDOR: NonEmptyString
    PAGE_URL: HttpUrl
    ITEMNO: NonEmptyString
```

```python
# Even a python module is a protocol: it exports functions of defined shape
from pydantic import BaseModel, HttpUrl
```

As you can see protocols and implementations have many forms, but they share the same rule:

- It is easy to change implementation, and hard to change a protocol

## 6. We want to build systems with loosely coupled modules.
Check this [inMemoryRateLimitProvider.ts](https://gitlab.com/engaging/scrapy/-/blob/f24da7136afebdcc39e082009d4684bdfe656885/data_processing/packages/gmd/src/common/infrastructure/rateLimitProvider/inMemoryRateLimitProvider.ts). It's a cool module, that allows to rate limit request on our backend:
- if push() called too many times per minute, it will throw an exception and block the request.

However, it throws "ApolloError" exception. This means, that we assume, that we will use thing handy module only with Apollo. This makes code less reusable. It also make assumptions of program context outside of [RateLimitProvider](https://gitlab.com/engaging/scrapy/-/blob/f24da7136afebdcc39e082009d4684bdfe656885/data_processing/packages/gmd/src/common/infrastructure/ports/RateLimitProvider.ts) protocol. Which is dangerous, because we assume, that knowing protocol should be enough to use the implementation, which is not the case with this module.

The correct way would be just remove ApolloError, it will cause no harm and fix the architecture. 

## What's next

- [Design things that way, that they will be easy to use](Design-things-that-way-that-they-will-be-easy-to-use.md)
- [Introduction Into TypeScript Vertical Slice Architecture](Introduction-Into-TS-Vertical-Slice-Architecture.md)

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=Understand-Software-Architecture-in-15-Minutes-or-Less.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
