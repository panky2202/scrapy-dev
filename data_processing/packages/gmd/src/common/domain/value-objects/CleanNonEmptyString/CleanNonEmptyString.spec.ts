import {objectSchema, optional} from '../../schema'
import {CleanNonEmptyStringSchemaOfLength} from './CleanNonEmptyString'

describe('CleanNonEmptyString', function () {
  it('Should work', function () {
    const s = objectSchema({
      str: optional(CleanNonEmptyStringSchemaOfLength(3)),
    })

    expect(s({str: '1234'})).toStrictEqual({str: '123'})
    expect(s({str: undefined})).toStrictEqual({})
    expect(s({str: ''})).toStrictEqual({})
  })
})
