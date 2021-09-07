import {SQLRequestSource} from '../../../../common/infrastructure/ports/MSSQLProvider'
import {FindProducts} from '../../domain/ports/FindProducts'
import {ProductMSSQL, ProductMSSQLSchema} from '../ProductMSSQL'
import {_sellingUnitToNumber} from '../RetailSellingUnitMSSQL'
import {
  imageFromURLArraySchema,
  ProductSchema,
} from '../../../../common/domain/entities'
import {fieldName, optional} from '../../../../common/domain/schema'
import {USD, USDSchema} from '../../../../common/domain/value-objects'
import {GlobalConfig} from '../../../../common/application/globalConfig'

const priceConsiderUnit = (
  unit?: string,
  price?: number,
): number | undefined => {
  if (unit !== undefined && price !== undefined) {
    return
  }

  if (unit !== undefined) {
    return _sellingUnitToNumber(unit)
  }

  return price
}

export const moneyFromMSSQLProduct = (
  product: ProductMSSQL,
): USD | undefined => {
  const amount =
    priceConsiderUnit(
      product.individualRetailSellingUnit,
      product.individualMstrRetailPrice,
    ) ||
    priceConsiderUnit(
      product.ultimageRetailSellingUnit,
      product.ultimateMstrRetailPrice,
    )

  if (amount === undefined) {
    return
  }

  return USDSchema(amount)
}

const imageUrlFromProduct = (product: ProductMSSQL) =>
  [
    GlobalConfig.AZURE_STORAGE.imagesBlob,
    product.vendorId,
    '_',
    product.itemNo,
    '.jpg',
  ].join('')

const imageFromMSSQLProduct = (product: ProductMSSQL) =>
  optional(imageFromURLArraySchema)([
    imageUrlFromProduct(product),
    product.imageUrl,
  ])

export function findProductsMSSQL(dependencies: {
  sql: SQLRequestSource
}): FindProducts {
  const {sql} = dependencies
  const fn = fieldName(ProductMSSQLSchema)

  return async function (input) {
    const results = await sql
      .request()
      .input('upc', input.upc)
      .input('email', input.email).query(`
      SELECT
        u.VendorId as [${fn('vendorId')}],
        u.ItemNumber as [${fn('itemNo')}],
        u.UpcNumber as [${fn('upc')}],
        u.Description as [${fn('description')}], 
        u.ImageUrl as [${fn('imageUrl')}],
        u.RetailSellingUnit as [${fn('ultimageRetailSellingUnit')}], 
        u.MstrRetailPrice as [${fn('ultimateMstrRetailPrice')}],
        irs.RetailSellingUnit as [${fn('individualRetailSellingUnit')}],
        irs.MstrRetailPrice as [${fn('individualMstrRetailPrice')}]
      FROM Ultimate as u
      LEFT JOIN individualRetailStores as irs ON irs.UltimateID = u.id AND irs.StoreID = (
        SELECT Store.ID AS StoreId FROM UserStore
        INNER JOIN Store ON UserStore.StoreId = Store.StoreName
        WHERE UserStore.Email = @email 
        )
      WHERE EXISTS (
        SELECT * FROM 
        (
          (SELECT VendorId, ItemNumber FROM Ultimate WHERE UpcNumber = @upc)
          UNION
          (SELECT vendorId AS VendorId, itemNo AS ItemNumber FROM UPC WHERE upc = @upc)
        ) a 
        WHERE a.VendorId = u.VendorId AND a.ItemNumber = u.ItemNumber
      )
    `)

    return results.records.map(ProductMSSQLSchema).map((x) =>
      ProductSchema({
        itemNo: x.itemNo,
        vendor: {id: x.vendorId},
        category: undefined,
        description: x.description,
        upc: x.upc ? [x.upc] : [],
        image: imageFromMSSQLProduct(x),
        price: moneyFromMSSQLProduct(x),
      }),
    )
  }
}
