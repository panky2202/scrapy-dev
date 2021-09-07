import {Base64StringSchema, isBase64String} from './Base64String'

describe('Base64String', function () {
  it('Should support base64 schema', function () {
    const valid =
      'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='
    const inValid =
      'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg='

    expect(isBase64String('')).toBeTruthy()
    expect(isBase64String('test')).toBeTruthy()
    expect(isBase64String(valid)).toBeTruthy()

    expect(isBase64String(' ')).toBeFalsy()
    expect(isBase64String('==')).toBeFalsy()
    expect(isBase64String('=')).toBeFalsy()
    expect(isBase64String(inValid)).toBeFalsy()
  })

  it('Should not think that DataURL is base64', function () {
    const data =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQBAMAAADt3eJSAAAAJFBMVEUSL1gRL1cPLVYSLVcQLFUUMloZNl0iPmQOK1M2Undyi7ErSXDlachgAAAAgUlEQVQI1w3LsRHCMAwF0C8nuqOUwh11LDyAc/ICSTxAXHgEDkpaNmEWpiPdax7WJLO1cUPaIqVUK6ZoZLUYlEKxWBeoDLnsSU8U91EECvf7oBNU3YPQDo1JAFoRhQQ2L8j5MFh0OPhgbjOuwv1yC/lc3D9vBDTi1+97BADKz0enP6tBEa30noYvAAAAAElFTkSuQmCC'
    expect(() => Base64StringSchema(data)).toThrow()
  })
})
