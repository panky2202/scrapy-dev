import {describe} from '@jest/globals'
import {blobStorageProviderAzure} from './blobStorageProviderAzure'
import {GlobalConfig} from '../../application/globalConfig'
import {ValidImageBuffer} from '../../domain/value-objects/ImageBuffer'
import {
  BlobDeleteResults,
  BlobFetchResults,
  BlobStorageProvider,
  BlobStoreResults,
} from '../ports/BlobStorageProvider'

describe('blobStorageProviderAzure', function () {
  function testBlobStorage(blobStorage: BlobStorageProvider) {
    it('Should store/fetch/delete images', async function () {
      const name = 'test/___test_image'
      const nameWithExtension = name + '.png'

      const storeResults: BlobStoreResults = {
        url: expect.stringMatching(/^https:/),
      }
      const fetchResults: BlobFetchResults = {
        data: ValidImageBuffer,
      }
      const deleteResults: BlobDeleteResults = {
        success: true,
      }

      const c = blobStorage.container('images')

      await c.deleteBlob(nameWithExtension)
      await expect(c.fetchBuffer(nameWithExtension)).rejects.toBeTruthy()

      await expect(
        c.storeBuffer(name, ValidImageBuffer),
      ).resolves.toStrictEqual(storeResults)

      await expect(c.fetchBuffer(nameWithExtension)).resolves.toStrictEqual(
        fetchResults,
      )
      await expect(c.deleteBlob(nameWithExtension)).resolves.toStrictEqual(
        deleteResults,
      )
      await expect(c.fetchBuffer(nameWithExtension)).rejects.toBeTruthy()
    })
  }

  testBlobStorage(
    blobStorageProviderAzure({
      connectionString: GlobalConfig.AZURE_STORAGE.connectionString,
    }),
  )
})
