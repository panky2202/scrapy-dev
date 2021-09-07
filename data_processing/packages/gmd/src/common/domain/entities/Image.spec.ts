import {imageFromURLArraySchema} from './Image'

describe('imageFromURLArraySchema', function () {
  it('Should work for an empty case', function () {
    expect(() => imageFromURLArraySchema([])).toThrow()
    expect(() => imageFromURLArraySchema(['not a url'])).toThrow()
  })

  it('Should work for one item', function () {
    expect(
      imageFromURLArraySchema(['https://hello.com/test.jpg']),
    ).toStrictEqual({
      url: 'https://hello.com/test.jpg',
    })

    expect(
      imageFromURLArraySchema(['https://hello.com/test.jpg', 'not a url']),
    ).toStrictEqual({
      url: 'https://hello.com/test.jpg',
    })
  })

  it('Should work for two items', function () {
    expect(
      imageFromURLArraySchema([
        'https://hello.com/test.jpg',
        'https://hello.com/test2.jpg',
      ]),
    ).toStrictEqual({
      url: 'https://hello.com/test.jpg',
      fallbackUrl: 'https://hello.com/test2.jpg',
    })

    expect(
      imageFromURLArraySchema([
        'https://hello.com/test.jpg',
        'https://hello.com/test2.jpg',
        'not a url',
      ]),
    ).toStrictEqual({
      url: 'https://hello.com/test.jpg',
      fallbackUrl: 'https://hello.com/test2.jpg',
    })
  })

  it('Should work for many items', function () {
    expect(
      imageFromURLArraySchema([
        'https://hello.com/test.jpg',
        'not a url',
        'https://hello.com/test2.jpg',
        'https://hello.com/test3.jpg',
        'https://hello.com/test4.jpg',
        'not a url',
      ]),
    ).toStrictEqual({
      url: 'https://hello.com/test.jpg',
      fallbackUrl: 'https://hello.com/test2.jpg',
    })
  })
})
