import {TableNameSchema} from './TableName'

describe('TableName', function () {
  it('Should work', function () {
    expect(TableNameSchema('hello_world')).toStrictEqual('hello_world')
    expect(() => TableNameSchema('hello world')).toThrow()
    expect(() => TableNameSchema(';DROP TABLE')).toThrow()
  })
})
