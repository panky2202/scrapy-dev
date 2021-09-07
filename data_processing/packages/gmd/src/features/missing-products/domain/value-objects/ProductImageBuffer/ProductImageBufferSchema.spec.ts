import {
  ImageBufferSchema,
  ValidImageBuffer,
} from '../../../../../common/domain/value-objects/ImageBuffer'
import {
  imageBuffer1440_900,
  imageBuffer17Mb,
  imageBuffer21x25,
  imageBuffer39Mb,
  imageBuffer768_1536,
  imageBufferLargerThan1Mb4000_2250,
} from './testInput'
import sharp, {Sharp} from 'sharp'
import {
  isLessThanResolution,
  mbToBytes,
  ProductImageBufferSchema,
  scaleImageResolution,
} from './ProductImageBufferSchema'
import {expect} from '@jest/globals'

const JEST_TIMEOUT = 120000

beforeAll(() => jest.setTimeout(JEST_TIMEOUT))

describe('mbToBytes', function () {
  it('Should work', function () {
    expect(mbToBytes(1)).toStrictEqual(1000000)
    expect(mbToBytes(0.4)).toStrictEqual(400000)
    expect(mbToBytes(20)).toStrictEqual(20000000)
    expect(() => mbToBytes(-1)).toThrow()
  })
})

describe('scaleResolution', function () {
  async function test(image: Sharp, expected: boolean) {
    const metadata = await sharp(await image.toBuffer()).metadata()
    expect(isLessThanResolution(metadata, 1024, 1024)).toStrictEqual(expected)
  }

  it('Should work', async function () {
    await expect(
      scaleImageResolution(1024, 1024)(ImageBufferSchema(ValidImageBuffer)),
    ).toStrictEqual(ImageBufferSchema(ValidImageBuffer))
    let image = await scaleImageResolution(
      1024,
      1024,
    )(ImageBufferSchema(imageBuffer768_1536))
    await test(image, true)
    image = await scaleImageResolution(
      1024,
      1024,
    )(ImageBufferSchema(imageBuffer1440_900))
    await test(image, true)
    image = await scaleImageResolution(
      1024,
      1024,
    )(ImageBufferSchema(imageBufferLargerThan1Mb4000_2250))
    await test(image, true)
  })
  it("Shouldn't scale up", async function () {
    let image = await scaleImageResolution(
      1024,
      1024,
    )(ImageBufferSchema(imageBuffer21x25))
    const result = sharp(imageBuffer21x25)
    await expect(JSON.stringify(image)).toStrictEqual(JSON.stringify(result))
  })
})

describe('ProductImageBufferSchema', function () {
  it('Should work', async function () {
    await expect(
      ProductImageBufferSchema(ValidImageBuffer),
    ).resolves.toBeTruthy()
    await expect(
      ProductImageBufferSchema(imageBuffer768_1536),
    ).resolves.toBeTruthy()
    await expect(
      ProductImageBufferSchema(imageBuffer1440_900),
    ).resolves.toBeTruthy()
    await expect(
      ProductImageBufferSchema(imageBufferLargerThan1Mb4000_2250),
    ).resolves.toBeTruthy()
    await expect(
      ProductImageBufferSchema(imageBuffer17Mb),
    ).resolves.toBeTruthy()
    await expect(ProductImageBufferSchema(imageBuffer39Mb)).rejects.toBeTruthy()
  })
})
