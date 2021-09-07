import {RetailSellingUnitMSSQLSchema} from './RetailSellingUnitMSSQL'
import {CleanNonEmptyStringSchema} from '../../../common/domain/value-objects'

describe('RetailSellingUnit', function() {
  const tests = [
    {
      value: '1 Unit',
      result: true,
    },
    {
      value: '4 FO 1',
      result: false,
    },
    {
      value: undefined,
      result: false,
    },
    {
      value: '',
      result: false,
    },
    {
      value: null,
      result: false,
    },
    {
      value: '3 FOR 1',
      result: true,
    },
    {
      value: '   4 FOR 1 ',
      result: true,
    },
    {
      value: '4 FOR 1',
      result: true,
    },
  ]

  tests.map(({value, result}) => {
    it(`Should ${result ? 'parse' : 'throw'} on '${value}'`, function() {
      if (result) {
        expect(RetailSellingUnitMSSQLSchema(value as any)).toStrictEqual(
          CleanNonEmptyStringSchema(value as any),
        )
      } else {
        expect(() => RetailSellingUnitMSSQLSchema(value as any)).toThrow()
      }
    })
  })
})
