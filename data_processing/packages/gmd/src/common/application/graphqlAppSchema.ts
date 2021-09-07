import {gql} from 'apollo-server-azure-functions'

const common = gql`
  type Query {
    user: User!
    products(input: ProductsInput): [Product!]!
  }

  type Mutation {
    """
    You can push scraped/parsed products to the system with this mutation.
    You can repeat the same request multiple times, it is safe.
    """
    addProducts(input: AddProductsInput): AddProductMutationResponse

    """
    If a worker hasn't found an item by UPC, they can add its photos and barcode for a review process.
    During the review process, a manager will add the product to a database, and price it.
    """
    addMissingProducts(
      input: AddMissingProductInput
    ): AddProductMutationResponse
  }

  input AddProductsInput {
    products: [AddProductInput!]!
  }

  input AddProductInput {
    vendorId: String!
    itemNo: String!
    category: String
    upc: String
    description: String
    description2: String
    imageUrl: String
    sourceUrl: String
    pkSize: String
    price: String
  }

  type AddProductMutationResponse {
    success: Boolean!
    message: String!
  }

  input ProductsInput {
    upc: String!
  }

  type Image {
    url: String!
    fallbackUrl: String
  }

  type Money {
    currency: String!
    amount: Float!
  }

  type User {
    email: String!
  }

  type Product {
    id: ID!
    upc: String!
    vendor: Vendor
    description: String
    image: Image
    price: Money
  }

  type Vendor {
    id: Int
  }

  input AddMissingProductInput {
    upc: String!
    photoFront: String!
    photoBack: String!
    comment: String

    "!!! DEPRECATED in version 1.3.0"
    photoUPC: String
  }
`

export const graphqlAppSchema = common
