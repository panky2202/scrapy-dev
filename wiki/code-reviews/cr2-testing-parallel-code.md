# CR2: Testing Parallel Code

- From: Aleksey
- To: Charaf

## Inquiry

Previously we made a frontend for that allows to upload 1 image of a product. Now we want to add 2 more images. The same
logic, just scale up a bit.

## Review

### Parallel promises and local helpers

[addMissingProduct.ts](https://gitlab.com/engaging/scrapy/-/blob/e06f81cb70dadc38be227f6f04368f395acbda2f/data_processing/packages/gmd/src/features/missing-products/application/addMissingProduct/addMissingProduct.ts)

The idea here: we have 3 images, let's push them into a blob storage with an async function `storeBuffer()`:

```typescript
async function storePhotos(
  storeBuffer: BlobStorageContainer['storeBuffer'],
  product: AddMissingProductInput,
): Promise<MissingProductPhotoUrls> {
  const imagesBuffers = await Promise.all([
    product.photoUPCPromise,
    product.photoBackPromise,
    product.photoFrontPromise,
  ])
  const [photoUpc, photoBack, photoFront] = imagesBuffers
  const photoUpcResult = await storeBuffer(
    missingProductBlobName(product.upc, 'upc'),
    photoUpc,
  )
  const photoBackResult = await storeBuffer(
    missingProductBlobName(product.upc, 'back'),
    photoBack,
  )
  const photoFrontResult = await storeBuffer(
    missingProductBlobName(product.upc, 'front'),
    photoFront,
  )
  return {
    photoFront: photoFrontResult.url,
    photoBack: photoBackResult.url,
    photoUpc: photoUpcResult.url,
  }
}
```

This code works, however, we will parse and upload images 1 by 1. We also repeat the same complex construction several
times. Let's update the code to a parallel load:

```typescript
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
      storeImage(product.photoUPCPromise, 'upc'),
      storeImage(product.photoBackPromise, 'back'),
      storeImage(product.photoFrontPromise, 'front'),
    ],
  )

  return {
    photoFront: photoFrontResult.url,
    photoBack: photoBackResult.url,
    photoUpc: photoUpcResult.url,
  }
}

```

Here we used a handy technique: we created a local helper function. It stores inside the complex logic and allows a
parallel run of all images.

---

### Testing parallel async code

[addMissingProduct.spec.ts](https://gitlab.com/engaging/scrapy/-/blob/e06f81cb70dadc38be227f6f04368f395acbda2f/data_processing/packages/gmd/src/features/missing-products/application/addMissingProduct/addMissingProduct.spec.ts)

This construction will not work anymore, because we switched to parallel execution and could not guarantee the way
promises will resolve:

```typescript
const storeMissingProduct = jest.fn()
const storeBuffer = jest
  .fn()
  .mockResolvedValueOnce(upcUploadResults)
  .mockResolvedValueOnce(backUploadResults)
  .mockResolvedValueOnce(frontUploadResults)
```

Generally speaking you should avoid writing test that test implementation details. Even in the old sequential
implementation the test relied on photos resolved in a concrete order. If I refactor storePhotos() even 100% correct,
but flip photo order, it will break the test. And the error will be opaque an annoying to catch.

When writing tests test protocol, not implementation.

Instead, try mock this dependency like this:

```typescript
const storeBuffer = jest.fn().mockImplementation((name: string) => {
  return { url: 'https://example.com/' + name }
})
```

And expect results like this:

```typescript
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
  photoUpc: expect.stringContaining(
    'https://example.com/missing/123123_upc',
  ),
}
```

## Conclusion

Good working code, merge approved. Lessons here:

- Take attention on small local repetitive parts. They will most likely not repeat in a grand scale of things, but often
  things repeat inside functions and tests. These parts could be reworked that way they will not repeat.

  If you isolate repetitive parts into separated non-repeated components, you will start see before hidden patters. Code
  will become easier to work with and refactor.

- When writing tests test protocol, not implementation. You can test against implementation on integration tests. Buf
  for unit tests it's damaging system.

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=cr2-testing-parallel-code.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
