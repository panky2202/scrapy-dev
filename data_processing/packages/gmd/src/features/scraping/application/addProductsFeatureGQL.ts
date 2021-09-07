import {
  AddProductsInputGQL,
  RequiredAppResolvers,
} from '../../../common/application/types'
import {AddProducts, AddProductsInputSchema} from '../domain/ports/AddProducts'
import assert from 'assert'

export type AddProductsFeatureGQL = {
  Mutation: Pick<RequiredAppResolvers['Mutation'], 'addProducts'>
  Query: {}
}

const mapAddProductsInput = (input?: AddProductsInputGQL | null) =>
  AddProductsInputSchema({
    products: input?.products || [],
  })

export function addProductsFeatureGQL({
  addProducts,
}: {
  addProducts: AddProducts
}): AddProductsFeatureGQL {
  return {
    Mutation: {
      addProducts: async (_, {input}, {permissions}) => {
        assert(permissions.has('System'), 'Access denied')
        await addProducts(mapAddProductsInput(input))
        return {message: 'ok', success: true}
      },
    },
    Query: {},
  }
}
