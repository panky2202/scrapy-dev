import {pipe} from "lodash/fp";
import {InferSchemaType, objectSchema} from "../../../../common/domain/schema";
import {VendorIdSchema} from "../../../../common/domain/entities";
import {ItemNumberSchema} from "../../../../common/domain/value-objects";
import {ProductImageBufferSchema} from "../../../missing-products/domain/value-objects/ProductImageBuffer/ProductImageBufferSchema";

export const VendorImageInputSchema = pipe(
  objectSchema({
    vendorId: VendorIdSchema,
    itemNumber: ItemNumberSchema,
    productImage: ProductImageBufferSchema,
  })
)

export type VendorImageInput = InferSchemaType<typeof VendorImageInputSchema>
