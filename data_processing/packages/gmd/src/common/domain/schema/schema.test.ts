import {pipe} from 'lodash/fp'
import {
  arraySchema,
  booleanSchema,
  fieldName,
  hasBrand,
  InferSchemaType,
  literalSchema,
  numberSchema,
  objectSchema,
  optional,
  refine,
  refineAsync,
  refineMax,
  refineMin,
  setDefault,
  stringSchema,
  unionSchema,
} from './schema'
import {sleep} from '@engaging-enterprises/basic-utils'

describe('Schema', function () {
  it('Should support number schema', function () {
    expect(numberSchema(123)).toStrictEqual(123)
    expect(numberSchema(' 42 ')).toStrictEqual(42)
    expect(numberSchema(' -42.1212 ')).toStrictEqual(-42.1212)

    expect(() => numberSchema('not a number')).toThrow()

    // @ts-expect-error
    expect(() => numberSchema({x: 1})).toThrow()

    // @ts-expect-error
    expect(() => numberSchema(false)).toThrow()

    // @ts-expect-error
    expect(() => numberSchema(true)).toThrow()

    // @ts-expect-error
    expect(() => numberSchema(null)).toThrow()

    // @ts-expect-error
    expect(() => numberSchema(undefined)).toThrow()

    // @ts-expect-error
    expect(() => numberSchema([42])).toThrow()
  })

  it('Should support boolean schema', function () {
    expect(booleanSchema(false)).toStrictEqual(false)
    expect(booleanSchema('  faLse ')).toStrictEqual(false)
    expect(booleanSchema('  ')).toStrictEqual(false)
    expect(booleanSchema('  0 ')).toStrictEqual(false)
    expect(booleanSchema(0)).toStrictEqual(false)
    expect(booleanSchema([])).toStrictEqual(false)
    expect(booleanSchema({})).toStrictEqual(false)

    expect(booleanSchema(true)).toStrictEqual(true)
    expect(booleanSchema('  random string ')).toStrictEqual(true)
    expect(booleanSchema(' true  ')).toStrictEqual(true)
    expect(booleanSchema(' True  ')).toStrictEqual(true)
    expect(booleanSchema(1)).toStrictEqual(true)
    expect(booleanSchema(100)).toStrictEqual(true)
    expect(booleanSchema({hello: 'world'})).toStrictEqual(true)
    expect(booleanSchema(['1'])).toStrictEqual(true)

    // @ts-expect-error
    expect(() => booleanSchema(null)).toThrow()

    // @ts-expect-error
    expect(() => booleanSchema(undefined)).toThrow()
  })

  it('Should support optional schema', function () {
    const s = optional(numberSchema)
    expect(s('not a number')).toStrictEqual(undefined)
    expect(s(undefined)).toStrictEqual(undefined)
    expect(s(null)).toStrictEqual(undefined)
    expect(s({})).toStrictEqual(undefined)
    expect(s(123)).toStrictEqual(123)
    expect(s(' 42 ')).toStrictEqual(42)

    const validF = (x: number | undefined) => x
    validF(s(123))

    const badF = (x: number) => x
    // @ts-expect-error
    badF(s(123))
  })

  it('Should support string schema', function () {
    expect(stringSchema(' some string ')).toStrictEqual(' some string ')
    expect(stringSchema(123.123)).toStrictEqual('123.123')
    expect(stringSchema(false)).toStrictEqual('false')
    expect(stringSchema({hello: 'world'})).toStrictEqual('{"hello":"world"}')

    // @ts-expect-error
    expect(() => stringSchema(undefined)).toThrow()

    // @ts-expect-error
    expect(() => stringSchema(null)).toThrow()
  })

  it('Should support array schema', function () {
    const s = arraySchema(numberSchema)
    expect(s([])).toStrictEqual([])
    expect(s([1, 2])).toStrictEqual([1, 2])
    expect(s([' 1 ', '  3'])).toStrictEqual([1, 3])

    // @ts-expect-error
    expect(() => s(undefined)).toThrow()

    // @ts-expect-error
    expect(() => s(false)).toThrow()

    // @ts-expect-error
    expect(() => s({x: 1})).toThrow()

    expect(() => s(['NaN'])).toThrow()
    expect(() => s([1, 'NaN'])).toThrow()

    const validF = (data: number[]) => data
    validF(s([1, 2, 3]))

    const badF = (data: string[]) => data
    // @ts-expect-error
    badF(s([1, 2, 3]))

    const s2 = arraySchema(numberSchema, 2)
    expect(s2([1, 2])).toStrictEqual([1, 2])
    expect(s2([1, 2, 3])).toStrictEqual([1, 2])

    const s3 = arraySchema(numberSchema, undefined, 2)
    expect(s3([1, 2])).toStrictEqual([1, 2])
    expect(() => s3([1])).toThrow()
  })

  it('Should support skipping invalid elements for an array', function () {
    const s = arraySchema(numberSchema, undefined, undefined, false)
    expect(s([1, 'lol', 2, 'internet', 3])).toStrictEqual([1, 2, 3])
  })

  it('Should support union schema', function () {
    const s = unionSchema([numberSchema, arraySchema(numberSchema)])

    expect(s(123)).toStrictEqual(123)
    expect(s([42])).toStrictEqual([42])

    expect(() => s('bad schema')).toThrow()

    // @ts-expect-error
    expect(() => s(undefined)).toThrow()

    // @ts-expect-error
    expect(() => s(false)).toThrow()

    // @ts-expect-error
    expect(() => s(null)).toThrow()

    const validF = (x: number | number[]) => x
    validF(s(123))

    const badF = (x: number) => x
    // @ts-expect-error
    badF(s(123))
  })

  it('Should support 0 as union member', function () {
    const s = arraySchema(
      objectSchema({
        field: unionSchema([literalSchema(0), literalSchema(1)]),
      }),
    )

    expect(s([{field: 1}])).toStrictEqual([{field: 1}])
    expect(s([{field: 0}])).toStrictEqual([{field: 0}])
  })

  it('Should support objectSchema even if has no toString', function () {
    const s = objectSchema({
      products: arraySchema(numberSchema),
    })
    const s2 = pipe(
      refine(() => true),
      arraySchema(objectSchema({})),
    )

    const obj = Object.create(null)
    obj.products = [0, 2, 3]

    expect(s(obj)).toStrictEqual({
      products: [0, 2, 3],
    })

    expect(s2([obj])).toStrictEqual([{}])
  })

  it('Should support literal schema', function () {
    expect(literalSchema(23)(23)).toStrictEqual(23)

    const s = literalSchema('hello')
    expect(s('hello')).toStrictEqual('hello')

    // @ts-expect-error
    expect(() => s('hello ')).toThrow()

    // @ts-expect-error
    expect(() => s(32)).toThrow()

    // @ts-expect-error
    expect(() => s(undefined)).toThrow()

    // @ts-expect-error
    expect(() => s({hello: 'hello'})).toThrow()

    // @ts-expect-error
    expect(() => s(false)).toThrow()

    // @ts-expect-error
    expect(() => s(null)).toThrow()

    const validF = (x: 'hello') => x
    validF(s('hello'))

    const badF = (x: 'hello ') => x
    // @ts-expect-error
    badF(s('hello'))
  })

  it('Should support object schema', function () {
    const s = objectSchema({
      field1: numberSchema,
      field2: stringSchema,
      field3: objectSchema({
        array: arraySchema(unionSchema([numberSchema, stringSchema])),
      }),
    })

    let data = {
      field1: 1,
      field2: 'hello',
      field3: {
        array: [42, 'internet'],
      },
    }
    expect(s(data)).toStrictEqual(data)

    // @ts-expect-error
    expect(() => s({bad: 'data'})).toThrow()

    // @ts-expect-error
    expect(() => s(undefined)).toThrow()

    // @ts-expect-error
    expect(() => s(null)).toThrow()

    const validF = (x: typeof data) => x
    validF(s(data))

    const badF = (x: {bad: string}) => x
    // @ts-expect-error
    badF(s(data))

    // @ts-expect-error
    data.field3.array[0] = null
    expect(() => s(data)).toThrow(
      "field3 -> array -> Could not parse 'null': 'null' is not a number, and 'null' is not a string",
    )

    const s2 = objectSchema({
      offset: numberSchema,
    })
    expect(s2({offset: 0})).toStrictEqual({offset: 0})
  })

  it('Should build object from JSON string', function () {
    const s = objectSchema({
      hello: literalSchema('world'),
      something: optional(numberSchema),
    })
    expect(s('{"hello": "world"}')).toStrictEqual({hello: 'world'})
    expect(() => s('{"hello": "world2"}')).toThrow()
    expect(() => s('')).toThrow()
  })

  it('Should support setDefault', function () {
    const s = objectSchema({
      hello: setDefault(stringSchema, 'world'),
      something: optional(setDefault(numberSchema, 42)),
    })

    expect(s({})).toStrictEqual({hello: 'world', something: 42})
    expect(s({hello: undefined})).toStrictEqual({hello: 'world', something: 42})
    expect(s({hello: null})).toStrictEqual({hello: 'world', something: 42})
    expect(s({hello: 'hello', something: undefined})).toStrictEqual({
      hello: 'hello',
      something: 42,
    })
  })

  it('Should build array from JSON string', function () {
    const s = arraySchema(literalSchema('world'))

    const data = ['world', 'world']
    expect(s(JSON.stringify(data))).toStrictEqual(data)

    const badData = ['world', 'world2']
    expect(() => s(JSON.stringify(badData))).toThrow()
  })

  it('Should support optional fields on object schema', function () {
    const s = objectSchema({
      field1: numberSchema,
      field2: optional(stringSchema),
    })

    // @ts-expect-error
    expect(s({field1: 123, field2: 'hello', doesnt: 'exist'})).toStrictEqual({
      field1: 123,
      field2: 'hello',
    })

    expect(s({field1: 123})).toStrictEqual({field1: 123})

    // @ts-expect-error
    expect(() => s({field2: 'hello'})).toThrow()
  })

  it('Should return fields for objectSchema', function () {
    const s = objectSchema({
      field1: numberSchema,
      field2: stringSchema,
    })

    const fn = fieldName(s)

    // @ts-expect-error
    fn('field3')

    expect(fn('field1')).toStrictEqual('field1')
    expect(fn('field2')).toStrictEqual('field2')
  })

  it('Should support refine', function () {
    const NonEmptyStringSchema = pipe(
      stringSchema,
      refine((x) => x.length > 0),
      hasBrand('NonEmptyString'),
    )
    type NonEmptyString = InferSchemaType<typeof NonEmptyStringSchema>

    expect(NonEmptyStringSchema('hello')).toStrictEqual('hello')
    expect(() => NonEmptyStringSchema('')).toThrow()

    // @ts-expect-error
    expect(() => NonEmptyStringSchema(undefined)).toThrow()

    // @ts-expect-error
    expect(() => NonEmptyStringSchema(null)).toThrow()

    const testF = (x: NonEmptyString) => x
    // @ts-expect-error
    testF('hello')
    testF(NonEmptyStringSchema('hello'))

    const CleanNonEmptyStringSchema = pipe(
      stringSchema,
      (x) => x.trim(),
      NonEmptyStringSchema,
      hasBrand('CleanString'),
    )
    type CleanNonEmptyString = InferSchemaType<typeof CleanNonEmptyStringSchema>

    expect(CleanNonEmptyStringSchema(' test  ')).toStrictEqual('test')
    expect(() => CleanNonEmptyStringSchema('   ')).toThrow()

    const testFNonEmpty = (x: NonEmptyString) => x
    const testFClean = (x: CleanNonEmptyString) => x

    const c = CleanNonEmptyStringSchema('hello')
    testFNonEmpty(c)
    testFClean(c)
  })

  it('Should support refineAsync', async function () {
    const NonEmptyStringSchema = pipe(
      stringSchema,
      refineAsync(async (x) => {
        await sleep(50)
        return x.length > 0
      }, 'the string is empty'),
      hasBrand('NonEmptyString'),
    )

    await expect(NonEmptyStringSchema('hello')).resolves.toStrictEqual('hello')
    await expect(NonEmptyStringSchema('')).rejects.toBeTruthy()
  })

  it('Should support refineMax/Min', function () {
    const s = pipe(numberSchema, refineMin(10), refineMax(100))
    expect(s(10)).toBeTruthy()
    expect(s(11)).toBeTruthy()
    expect(s(100)).toBeTruthy()
    expect(s(99)).toBeTruthy()
    expect(() => s(9)).toThrow()
    expect(() => s(101)).toThrow()

    const s2 = pipe(stringSchema, refineMax(4), refineMin(2))
    expect(s2('1234')).toBeTruthy()
    expect(s2('12')).toBeTruthy()
    expect(() => s2('1')).toThrow()
    expect(() => s2('12345')).toThrow()

    const s3 = pipe(arraySchema(numberSchema), refineMax(4), refineMin(2))
    expect(s3([1, 2, 3, 4])).toBeTruthy()
    expect(s3([1, 2])).toBeTruthy()
    expect(() => s3([1])).toThrow()
    expect(() => s3([1, 2, 3, 4, 5])).toThrow()
  })
})

const brandSchema = pipe(numberSchema, hasBrand('testBrand'))
type BrandSchemaType = InferSchemaType<typeof brandSchema>

const testBrandFunction1 = (x: BrandSchemaType): BrandSchemaType => x
testBrandFunction1(brandSchema(123))

const testBrandFunction2 = (x: BrandSchemaType): BrandSchemaType => x
// @ts-expect-error
testBrandFunction2(123)
