import {UPC, URLSchema} from '../../../../common/domain/value-objects'
import {BlobStorageContainer} from '../../../../common/infrastructure/ports/BlobStorageProvider'
import {randomBytes} from 'crypto'
import {AddMissingProductResolvedImages} from './ports/AddMissingProductResolvedImages'
import {
  AddMissingProduct,
  AddMissingProductInput,
} from '../../domain/ports/AddMissingProduct'
import {
  InferSchemaType,
  objectSchema,
  optional,
} from '../../../../common/domain/schema'
import {ProductImageBuffer} from '../../domain/value-objects/ProductImageBuffer/ProductImageBufferSchema'

function missingProductBlobName(upc: UPC, suffix = '') {
  const uniqueString = randomBytes(8).toString('hex')
  return `missing/${upc}${suffix ? `_${suffix}` : ''}_${uniqueString}`
}

type MissingProductPhotoUrls = InferSchemaType<
  typeof MissingProductPhotoUrlsSchema
>
const MissingProductPhotoUrlsSchema = objectSchema({
  photoUpc: optional(URLSchema),
  photoBack: URLSchema,
  photoFront: URLSchema,
})

async function storePhotos(
  storeBuffer: BlobStorageContainer['storeBuffer'],
  product: AddMissingProductInput,
): Promise<MissingProductPhotoUrls> {
  const storeImage = async (image: ProductImageBuffer, postfix: string) => {
    return await storeBuffer(
      missingProductBlobName(product.upc, postfix),
      await image,
    )
  }

  const [photoUpcResult, photoBackResult, photoFrontResult] = await Promise.all(
    [
      product.photoUPCPromise && storeImage(product.photoUPCPromise, 'upc'),
      storeImage(product.photoBackPromise, 'back'),
      storeImage(product.photoFrontPromise, 'front'),
    ],
  )

  return {
    photoUpc: photoUpcResult?.url,
    photoBack: photoBackResult.url,
    photoFront: photoFrontResult.url,
  }
}

export function addMissingProduct({
  storeBuffer,
  storeMissingProduct,
}: {
  storeBuffer: BlobStorageContainer['storeBuffer']
  storeMissingProduct: AddMissingProductResolvedImages
}): AddMissingProduct {
  return async (product) => {
    const photoUrls = await storePhotos(storeBuffer, product)
    await storeMissingProduct({
      ...product,
      ...photoUrls,
    })
  }
}
