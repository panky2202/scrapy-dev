import {DateTypeSchema} from './DateType'

describe('DateType', function () {
  it('Should work', function () {
    expect(DateTypeSchema('2011-10-10T14:48:00')).toBeTruthy()
    expect(DateTypeSchema('2019-08-26T10:08:15.593Z')).toBeTruthy()
    expect(
      DateTypeSchema(DateTypeSchema('2019-08-26T10:08:15.593Z')),
    ).toBeTruthy()
    expect(() => DateTypeSchema('random string')).toThrow()
  })

  it('Should work in UTC', function () {
    expect(
      DateTypeSchema('2022-03-19 19:49:19.0466667Z').getUTCHours(),
    ).toStrictEqual(19)
  })
})
