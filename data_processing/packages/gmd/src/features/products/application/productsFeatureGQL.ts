import {
  ProductGQL,
  ProductsInputGQL,
  RequiredAppResolvers,
} from '../../../common/application/types'
import {FindProducts, ProductsInputSchema} from '../domain/ports/FindProducts'
import {Email} from '../../../common/domain/value-objects'
import {Product} from '../../../common/domain/entities'

export type ProductsFeatureGQL = {
  Mutation: {}
  Query: Pick<RequiredAppResolvers['Query'], 'products'>
}

const mapInput = (email?: Email, input?: ProductsInputGQL | null) =>
  ProductsInputSchema({
    upc: input?.upc ?? '',
    email: email ?? '',
  })

const mapOutput = (results: Product[]): ProductGQL[] =>
  results.map(x => ({
    id: x.itemNo,
    upc: x.upc.length > 0 ? x.upc[0] : '',
    price: x.price && {currency: 'USD', amount: x.price},
    description: x.description,
    image: x.image,
    vendor: x.vendor
  }))

export function productsFeatureGQL({
  findProducts,
}: {
  findProducts: FindProducts
}): ProductsFeatureGQL {
  return {
    Mutation: {},
    Query: {
      products: async (_, {input}, {email}) =>
        mapOutput(await findProducts(mapInput(email, input))),
    },
  }
}
