import {UPCSchema} from './UPC'

describe('UPC', function() {
  it('Should work', function() {
    expect(UPCSchema('123123')).toStrictEqual('123123')
    expect(UPCSchema(' <a>  123- 123  </a> ')).toStrictEqual('123123')
    expect(() => UPCSchema('13')).toThrow()
    expect(() => UPCSchema('')).toThrow()
    expect(() => UPCSchema('123123123321231221312321332')).toThrow()
  })
})
