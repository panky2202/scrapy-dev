import {addMissingProduct} from './addMissingProduct'
import {ValidImageBuffer} from '../../../../common/domain/value-objects/ImageBuffer'
import {AddMissingProductInputSchema} from '../../domain/ports/AddMissingProduct'
import {ProductImageBufferSchema} from '../../domain/value-objects/ProductImageBuffer/ProductImageBufferSchema'
import {
  imageBuffer21x25,
  imageBuffer768_1536,
} from '../../domain/value-objects/ProductImageBuffer/testInput'

describe('addMissingProduct', function () {
  async function test(withOptional = false) {
    const input = AddMissingProductInputSchema({
      upc: '123123',
      comment: 'random comment',
      email: 'random@email.com',
      photoFrontPromise: ValidImageBuffer,
      photoBackPromise: imageBuffer768_1536,
      photoUPCPromise: withOptional ? undefined : imageBuffer21x25,
    })
    const inputResolved = {
      upc: '123123',
      comment: 'random comment',
      email: 'random@email.com',
      photoFront: expect.stringContaining(
        'https://example.com/missing/123123_front',
      ),
      photoBack: expect.stringContaining(
        'https://example.com/missing/123123_back',
      ),
      photoUpc: withOptional
        ? undefined
        : expect.stringContaining('https://example.com/missing/123123_upc'),
    }
    const expectFunctionCalledTimes = withOptional ? 2 : 3

    const upcImageBuffer = await ProductImageBufferSchema(imageBuffer21x25)
    const frontImageBuffer = await ProductImageBufferSchema(ValidImageBuffer)
    const backImageBuffer = await ProductImageBufferSchema(imageBuffer768_1536)

    const storeMissingProduct = jest.fn()
    const storeBuffer = jest.fn().mockImplementation((name: string) => {
      return {url: 'https://example.com/' + name}
    })

    const f = addMissingProduct({storeMissingProduct, storeBuffer})
    await expect(f(input)).resolves.toBeFalsy()

    expect(storeBuffer).toBeCalledTimes(expectFunctionCalledTimes)
    !withOptional &&
      expect(storeBuffer).toBeCalledWith(
        expect.stringMatching(/^missing\/123123/),
        upcImageBuffer,
      )
    expect(storeBuffer).toBeCalledWith(
      expect.stringMatching(/^missing\/123123/),
      backImageBuffer,
    )
    expect(storeBuffer).toBeCalledWith(
      expect.stringMatching(/^missing\/123123/),
      frontImageBuffer,
    )

    expect(storeMissingProduct).toBeCalledTimes(1)
    expect(storeMissingProduct).toBeCalledWith(
      expect.objectContaining(inputResolved),
    )
  }
  it('Should work with all photos', async function () {
    await test()
  })
  it('Should work without optional photos', async function () {
    await test(true)
  })
})
