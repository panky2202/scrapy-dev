import {isValidImageBuffer, ValidImageBuffer} from './ImageBuffer'

describe('isValidImageBuffer', function () {
  it('Should parse image from a buffer', async function () {
    const invalidImageBuffer = Buffer.from('some-data', 'base64')

    await expect(isValidImageBuffer(ValidImageBuffer)).resolves.toBeTruthy()
    await expect(isValidImageBuffer(invalidImageBuffer)).rejects.toBeTruthy()
  })
})
