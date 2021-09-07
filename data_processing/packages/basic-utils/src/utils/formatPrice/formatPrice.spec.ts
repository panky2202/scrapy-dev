import {formatPrice} from './formatPrice'
import {describe, expect, it} from '@jest/globals'

describe('formatPrice', () => {
  it('Should be able to convert float to str', () => {
    expect(formatPrice(0.01)).toEqual('$0.01')
    expect(formatPrice(0.0)).toEqual('$0.00')
    expect(formatPrice(2)).toEqual('$2.00')
    expect(formatPrice(52)).toEqual('$52.00')
    expect(formatPrice(350.52)).toEqual('$350.52')
    expect(formatPrice(350.524)).toEqual('$350.52')
    expect(formatPrice(350.525)).toEqual('$350.53')
  })
})
