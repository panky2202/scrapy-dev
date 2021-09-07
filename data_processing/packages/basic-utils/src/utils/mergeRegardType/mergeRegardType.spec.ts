import {mergeRegardType} from './mergeRegardType'

type DataType = {
  data: string
}

type TestType = {
  value: number
  data: DataType
  subType: {
    array: string[]
  }
}

describe('mergeRegardType', function () {
  it('Should merge', function () {
    const testObject: TestType = {
      value: 10,
      subType: {
        array: ['random', 'string'],
      },
      data: {
        data: 'random string',
      },
    }

    const result: TestType = {
      value: 11,
      subType: {
        array: ['test', 'string'],
      },
      data: {
        data: 'random string',
      },
    }

    expect(
      mergeRegardType(testObject, {
        value: 11,
        subType: {array: ['test']},
      }),
    ).toStrictEqual(result)
  })

  it('Should be a deep merge without side effects', function () {
    const testObject: TestType = {
      value: 10,
      subType: {
        array: ['random', 'string'],
      },
      data: {
        data: 'random string',
      },
    }

    const result1: TestType = {
      value: 19,
      subType: {
        array: ['random', 'string'],
      },
      data: {
        data: 'random string',
      },
    }

    const result2: TestType = {
      value: 20,
      subType: {
        array: ['random', 'string'],
      },
      data: {
        data: 'random string',
      },
    }

    const obj1 = mergeRegardType(testObject, {value: 19})
    const obj2 = mergeRegardType(testObject, {value: 20})

    expect(obj1).toStrictEqual(result1)
    expect(obj2).toStrictEqual(result2)
  })
})
