# CR7: Testing TS features

- From: Aleksey
- To: Guilherme

# Files In Review

- [Merge request 132](https://gitlab.com/engaging/scrapy/-/merge_requests/132/diffs)

# Group related test cases by feature

Imagine, that you work with a test suite like this:

```typescript
describe('someFunctionSQL', function () {
  it('Should #1 ...', function () {
    // ...
  })

  it('Should #2 ...', function () {
    // ...
  })

  it('Should #3 ...', function () {
    // ...
  })
})
```

You need to add a new feature to someFunctionSQL. In the perfect world you would find a way to isolate the feature into
a function and test it as a separate unit. However, it is tricky to extract a feature from a SQL query and test it in
independent environment. Thus you add your feature directly inside someFunctionSQL. And add your test cases like this:

```typescript
describe('someFunctionMSSQL', function () {
  it('Should #1 ...', function () {
    // ...
  })

  it('Should #2 ...', function () {
    // ...
  })

  it('Should #3 ...', function () {
    // ...
  })

  it('Should has working new feature #1 ...', function () {
    // ...
  })

  it('Should has working new feature #2 ...', function () {
    // ...
  })
})
```

You can make your tests more readable, if you group your features with `describe()`:

```typescript
describe('someFunctionMSSQL', function () {
  it('Should #1 ...', function () {
    // ...
  })

  it('Should #2 ...', function () {
    // ...
  })

  it('Should #3 ...', function () {
    // ...
  })

  describe('The new feature', function () {
    it('Should #1 ...', function () {
      // ...
    })

    it('Should #2 ...', function () {
      // ...
    })
  })
})
```

Usually close related tests share common variables and environment. You can define common stuff for the feature tests in
the `describe()` block:

```typescript
describe('someFunctionMSSQL', function () {
  it('Should #1 ...', function () {
    // ...
  })

  it('Should #2 ...', function () {
    // ...
  })

  it('Should #3 ...', function () {
    // ...
  })

  describe('The new feature', function () {
    const common = [1, 2, 3]

    it('Should #1 ...', function () {
      // ... do something with common 
    })

    it('Should #2 ...', function () {
      // ... do something with common 
    })
  })
})
```

# Do not forget to use int instead of spec

What's the difference between:

- someModule.spec.ts
- someModule.int.ts

?

They both define tests, however:

- All `spec` will run in parallel. This increases speed significantly.
- All `int` will run sequentially. This is important for integration testing, when we have only 1 external resource (for
  example db) and do not want our tests to be accidentally in a conflict.

# Remember that by default DateTypeSchema() uses local time

Totally not your mistake, but mine, I forgot it. And this is why some test cases failed on your side.

```typescript
const t1 = DateTypeSchema('2021-01-01') // local time
const t2 = DateTypeSchema('2021-01-01T00:00:00.000') // local time
const t3 = DateTypeSchema('2021-01-01T00:00:00.000Z') // UTC time
```

# Test features independently of each other

Imagine, that you want to test 2 independent features:

```typescript
describe('someFunctionSQL', function () {
  it('Should has feature 1 ...', function () {
    // ...
  })

  it('Should has feature 2 ...', function () {
    // ...
  })
})
```

In each case you have some expectations:

```typescript
describe('someFunctionSQL', function () {
  it('Should has feature 1 ...', function () {
    // ...
    expect(result).toStrictEqual(
      expect.objectContaining({
        fieldRelatedToFeature1: 'hello',
        fieldRelatedToFeature2: 'world',
      }),
    )
  })

  it('Should has feature 2 ...', function () {
    // ...
    expect(result).toStrictEqual(
      expect.objectContaining({
        fieldRelatedToFeature1: 'hello',
        fieldRelatedToFeature2: 'world',
      }),
    )
  })
})
```

As you can see, in each test case we specified fields, that related for both features. This means, that if any feature
will change you will need to update both tests. This could be easily avoided like this:

```typescript
describe('someFunctionSQL', function () {
  it('Should has feature 1 ...', function () {
    // ...
    expect(result).toStrictEqual(
      expect.objectContaining({
        fieldRelatedToFeature1: 'hello',
      }),
    )
  })

  it('Should has feature 2 ...', function () {
    // ...
    expect(result).toStrictEqual(
      expect.objectContaining({
        fieldRelatedToFeature2: 'world',
      }),
    )
  })
})
```

In this case our tests became less strict, but more resilient to change. Usually it is a good tradeoff. And also usually
you do not want to spend time on coding test for the same feature multiple times.

# Conclusion

Excellent work:

- The feature was added correctly
- It had correct tests

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=cr7-testing-ts-features.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
