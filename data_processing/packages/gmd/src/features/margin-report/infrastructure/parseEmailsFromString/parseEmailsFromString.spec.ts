import {parseEmailsFromString} from './parseEmailsFromString'

describe('parseEmailsFromString', function () {
  it('Should work', function () {
    expect(parseEmailsFromString('')).toStrictEqual([])
    expect(parseEmailsFromString('test@gmail.com, ')).toStrictEqual([
      'test@gmail.com',
    ])
    expect(
      parseEmailsFromString(
        'some garbage, test@gmail.com, not an email; test2@gmail.com',
      ),
    ).toStrictEqual(['test@gmail.com', 'test2@gmail.com'])
  })
})
