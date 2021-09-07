import {IntegerNumberSchema, IntegerPositiveNumberSchema} from './Numbers'

describe('Numbers', function() {
  it('Should support integer schema', function() {
    expect(Number.isInteger(IntegerNumberSchema(12))).toBeTruthy()
    expect(Number.isInteger(IntegerNumberSchema(12.23))).toBeTruthy()
    expect(Number.isInteger(IntegerNumberSchema(-0.00023))).toBeTruthy()

    expect(IntegerNumberSchema(123.123)).toStrictEqual(123)
    expect(IntegerNumberSchema(123.523)).toStrictEqual(124)
    expect(IntegerNumberSchema(12)).toStrictEqual(12)

    expect(Number.isInteger(IntegerPositiveNumberSchema(12))).toBeTruthy()
    expect(Number.isInteger(IntegerPositiveNumberSchema(12.123))).toBeTruthy()
    expect(IntegerPositiveNumberSchema(12.123)).toStrictEqual(12)
    expect(() => IntegerPositiveNumberSchema(-12)).toThrow()

    // @ts-expect-error
    expect(() => IntegerPositiveNumberSchema(undefined)).toThrow()
    // @ts-expect-error
    expect(() => IntegerPositiveNumberSchema(null)).toThrow()
  })
})
