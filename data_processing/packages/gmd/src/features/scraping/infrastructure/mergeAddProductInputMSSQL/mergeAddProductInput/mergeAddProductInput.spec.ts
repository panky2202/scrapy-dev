import {mergeAddProductInput} from './mergeAddProductInput'
import {
  AddProductInput,
  AddProductInputSchema,
} from '../../../domain/ports/AddProducts'
import {arraySchema} from '../../../../../common/domain/schema'

const s = arraySchema(AddProductInputSchema)

describe('mergeAddProductInput', function() {
  const test = (before: AddProductInput[], after: AddProductInput[]) => {
    expect(mergeAddProductInput(before)).toStrictEqual(after)
  }

  it('Should work with empty', function() {
    test([], [])
    test(
      s([
        {
          vendorId: 1,
          itemNo: 'hello',
        },
      ]),
      s([
        {
          vendorId: 1,
          itemNo: 'hello',
        },
      ]),
    )
  })

  it('Should merge same items', function() {
    test(
      s([
        {
          vendorId: 1,
          itemNo: 'test',
        },
        {
          vendorId: 1,
          itemNo: 'test',
          upc: '12345',
        },
      ]),
      s([
        {
          vendorId: 1,
          itemNo: 'test',
          upc: '12345',
        },
      ]),
    )
  })

  it('Should not merge different items', function() {
    test(
      s([
        {
          vendorId: 1,
          itemNo: 'test',
        },
        {
          vendorId: 1,
          itemNo: 'test 2',
          upc: '12345',
        },
      ]),
      s([
        {
          vendorId: 1,
          itemNo: 'test',
        },
        {
          vendorId: 1,
          itemNo: 'test 2',
          upc: '12345',
        },
      ]),
    )
  })
})
