import {InferSchemaType, objectSchema,} from "../../../../common/domain/schema";
import {Vendor} from "../../../../common/domain/entities";
import {CleanNonEmptyStringSchema} from "../../../../common/domain/value-objects";

export type VendorInput = InferSchemaType<typeof VendorInputSchema>
export const VendorInputSchema = objectSchema({
    displayName: CleanNonEmptyStringSchema,
  }
)

export type FindVendor = (input: VendorInput) => Promise<Vendor[]>
