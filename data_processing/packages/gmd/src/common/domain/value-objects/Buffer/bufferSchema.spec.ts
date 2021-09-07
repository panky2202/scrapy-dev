import {Base64StringSchema} from '../Base64String'
import {bufferSchema} from './bufferSchema'
import {DataURLSchema} from '../DataURL'

describe('Buffer', function () {
  it('Should support buffer schema', function () {
    const base64Str = 'dGVzdA=='
    const normalString = 'test'

    expect(bufferSchema(base64Str)).toStrictEqual(
      Buffer.from(base64Str, 'base64'),
    )
    expect(bufferSchema(Base64StringSchema(base64Str))).toStrictEqual(
      Buffer.from(base64Str, 'base64'),
    )
    expect(bufferSchema(Buffer.from(normalString))).toStrictEqual(
      Buffer.from(normalString),
    )
    const dataUri = DataURLSchema('data:image/svg+xml;charset=UTF-8,some-data')
    expect(bufferSchema(dataUri)).toStrictEqual(
      Buffer.from(dataUri.data, 'base64'),
    )

    // @ts-expect-error
    expect(() => bufferSchema(null)).toThrow()
    // @ts-expect-error
    expect(() => bufferSchema(undefined)).toThrow()
    // @ts-expect-error
    expect(() => bufferSchema({})).toThrow()
  })

  it('Should support DataURL', function () {
    const base64data =
      'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAJFBMVEUSL1gRL1cPLVYSLVcQLFUUMloZNl0iPmQOK1M2Undyi7ErSXDlachgAAAAgUlEQVQI1w3LsRHCMAwF0C8nuqOUwh11LDyAc/ICSTxAXHgEDkpaNmEWpiPdax7WJLO1cUPaIqVUK6ZoZLUYlEKxWBeoDLnsSU8U91EECvf7oBNU3YPQDo1JAFoRhQQ2L8j5MFh0OPhgbjOuwv1yC/lc3D9vBDTi1+97BADKz0enP6tBEa30noYvAAAAAElFTkSuQmCC'
    const dataUri = 'data:image/png;base64,' + base64data
    expect(bufferSchema(dataUri)).toStrictEqual(bufferSchema(base64data))
  })
})
