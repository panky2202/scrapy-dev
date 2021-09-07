import {
  AddMissingProductInputGQL,
  RequiredAppResolvers,
} from '../../../common/application/types'

import {Email} from '../../../common/domain/value-objects'
import {
  AddMissingProduct,
  AddMissingProductInput,
  AddMissingProductInputSchema,
} from '../domain/ports/AddMissingProduct'

export type AddMissingProductFeatureGQL = {
  Mutation: Pick<RequiredAppResolvers['Mutation'], 'addMissingProducts'>
  Query: {}
}

const mapMissingProduct = (
  email?: Email,
  input?: AddMissingProductInputGQL | null,
): AddMissingProductInput =>
  AddMissingProductInputSchema({
    upc: input?.upc ?? '',
    email: email ?? '',
    comment: input?.comment,
    photoFrontPromise: input?.photoFront ?? '',
    photoBackPromise: input?.photoBack ?? '',
    photoUPCPromise: input?.photoUPC ?? undefined,
  })

export function addMissingProductFeatureGQL({
  addMissingProduct,
}: {
  addMissingProduct: AddMissingProduct
}): AddMissingProductFeatureGQL {
  return {
    Query: {},
    Mutation: {
      addMissingProducts: async (_, {input}, {email}) => {
        await addMissingProduct(mapMissingProduct(email, input))
        return {
          message: 'OK',
          success: true,
        }
      },
    },
  }
}
