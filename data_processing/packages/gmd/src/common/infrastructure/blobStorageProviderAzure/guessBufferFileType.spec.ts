import {bufferSchema} from '../../domain/value-objects/Buffer'
import {FileTypeResult, guessBufferFileType} from './guessBufferFileType'

describe('guessBufferFileType', function () {
  it('Should guess jpg type', async function () {
    const input = bufferSchema(
      'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
    )

    const result: FileTypeResult = {
      extension: 'png',
      mime: 'image/png',
    }

    await expect(guessBufferFileType(input)).resolves.toStrictEqual(result)
  })

  it('Should guess unknown type', async function () {
    const input = bufferSchema('random string')

    const result: FileTypeResult = {
      mime: 'application/octet-stream',
    }

    await expect(guessBufferFileType(input)).resolves.toStrictEqual(result)
  })
})
