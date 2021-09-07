import {VendorInput, VendorInputSchema} from "../domain/ports/FindVendor";
import {Vendor, VendorId,} from "../../../common/domain/entities";
import {NonEmptyString, NonEmptyStringSchema} from "../../../common/domain/value-objects";
import {
  ProductImageBuffer,
  ProductImageBufferSchema
} from "../../missing-products/domain/value-objects/ProductImageBuffer/ProductImageBufferSchema";
import {VendorImageInput} from "../domain/ports/StoreVendorImage";
import {InferSchemaType, objectSchema} from "../../../common/domain/schema";


export async function storeImages(
  storeImageFunction: (imageInput: VendorImageInput, imageBuffer: ProductImageBuffer) => Promise<NonEmptyString>,
  imageInput: VendorImageInput) {
  const image_name = `${imageInput.vendorId}_${imageInput.itemNumber}`
  return await storeImageFunction(image_name, imageInput.productImage);
}

export async function findVendorId(
  findVendorFunction: (input: VendorInput) => Promise<Vendor[]>,
  vendorInput: VendorInput): Promise<VendorId | undefined> {
  const vendors = await findVendorFunction(vendorInput)
  const vendor = vendors.pop()
  if (vendor === undefined) {
    return undefined
  }
  return vendor.id
}

export const FeatureInputSchema = objectSchema({
  imageSource: NonEmptyStringSchema,
  extension: NonEmptyStringSchema,
  vendorDisplayName: NonEmptyStringSchema,
  itemNumber: NonEmptyStringSchema,
  productImage: ProductImageBufferSchema,
})

type FeatureInput = InferSchemaType<typeof FeatureInputSchema>

export function vendorImagePipeline(
  findVendorFunction:
    (input: VendorInput) => Promise<Vendor[]>,
  storeImageFunction:
    (imageInput: VendorImageInput, imageBuffer: ProductImageBuffer) => Promise<NonEmptyString>,
  log: (...args: Array<any>) => void
) {
  return async function (
    {
      imageSource,
      extension,
      vendorDisplayName,
      itemNumber,
      productImage,
    }: FeatureInput) {

    log(">>> Starting pipeline for image: ", imageSource)

    if (!(["png", "jpg", "jpeg"].includes(extension))) {
      log(">>> Pipeline exit because image has unsupported extension")
      return
    }
    const vendorInput = VendorInputSchema({displayName: vendorDisplayName});
    const vendorId = await findVendorId(findVendorFunction, vendorInput)

    if (!vendorId) {
      log(">>> Error Vendor", vendorInput.displayName, "not found.")
      return
    }

    log(">>> Vendor", vendorId, "found")

    const vendorImageInput = {
      vendorId: vendorId,
      itemNumber: itemNumber,
      productImage: productImage
    }

    const newURL = await storeImages(storeImageFunction, vendorImageInput);

    log(">>> Image copied to: ", newURL)
  }
}
