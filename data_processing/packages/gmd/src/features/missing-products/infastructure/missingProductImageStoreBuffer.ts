import {
  BlobStorageContainer,
  BlobStorageProvider,
} from '../../../common/infrastructure/ports/BlobStorageProvider'

export function missingProductImageStoreBuffer({
  blobStorage,
}: {
  blobStorage: BlobStorageProvider
}): BlobStorageContainer['storeBuffer'] {
  return blobStorage.container('images').storeBuffer
}
