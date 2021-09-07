import {isValidURL, URLSchema} from './URL'

describe('isValidURL', function () {
  it('Should work', function () {
    expect(isValidURL('https://hello.com/test.jpg')).toBeTruthy()
    expect(isValidURL('https://hello.com:404/test.jpg')).toBeTruthy()
    expect(isValidURL('hts://hello.com/test.jpg')).toBeFalsy()
    expect(isValidURL('')).toBeFalsy()
    expect(isValidURL('random string')).toBeFalsy()
  })
})

describe('URLSchema', function () {
  it('Should handle URL encode', function () {
    console.log(
      'https://hello.com/hello%20world%2520(lol%20internet)/%D1%8E%D0%BD%D0%B8%D0%BA%D0%BE%D0%B4',
    )
    expect(
      URLSchema('https://hello.com/hello world%20(lol internet)/юникод'),
    ).toStrictEqual(
      'https://hello.com/hello%20world%2520(lol%20internet)/%D1%8E%D0%BD%D0%B8%D0%BA%D0%BE%D0%B4',
    )
  })
})
