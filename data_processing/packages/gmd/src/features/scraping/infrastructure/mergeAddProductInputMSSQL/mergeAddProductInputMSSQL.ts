import {SQLRequestSource} from '../../../../common/infrastructure/ports/MSSQLProvider'
import {fieldName} from '../../../../common/domain/schema'
import {
  AddProductInput,
  AddProductInputSchema,
} from '../../domain/ports/AddProducts'
import {mergeAddProductInput} from './mergeAddProductInput/mergeAddProductInput'

export async function mergeAddProductInputMSSQL(
  source: SQLRequestSource,
  products: AddProductInput[],
) {
  const mergedProducts = mergeAddProductInput(products)
  if (mergedProducts.length === 0) {
    return
  }

  const n = fieldName(AddProductInputSchema)
  await source.request().bulkInsert(
    '#Bulk_Ultimate',
    [
      {name: n('vendorId'), nullable: false, type: 'integer'},
      {name: n('itemNo'), nullable: false, type: 'text'},
      {name: n('description'), nullable: true, type: 'text'},
      {name: n('upc'), nullable: true, type: 'text'},
      {name: n('imageUrl'), nullable: true, type: 'text'},
    ],
    mergedProducts.map(product => [
      product.vendorId,
      product.itemNo,
      product.description,
      product.upc,
      product.imageUrl,
    ]),
  )
  await source.request().query(`
      MERGE Ultimate AS Target
      USING #Bulk_Ultimate AS Source
      ON 
        Target.VendorId = Source.[${n('vendorId')}] 
        AND Target.ItemNumber = Source.[${n('itemNo')}]
      WHEN MATCHED THEN UPDATE 
        SET 
          Target.Description = 
            COALESCE(Target.Description, Source.[${n('description')}]),
          Target.UpcNumber = 
            COALESCE(Target.UpcNumber, Source.[${n('upc')}]),
          Target.ImageUrl =
            COALESCE(Target.ImageUrl, Source.[${n('imageUrl')}]);
      drop table #Bulk_Ultimate;
    `)
}
