import {SQLRequestSource} from '../../../../common/infrastructure/ports/MSSQLProvider'
import {UPCMSSQL, UPCMSSQLSchema} from './UPCMSSQL'
import {fieldName} from '../../../../common/domain/schema'
import {AddProductInput} from '../../domain/ports/AddProducts'
import {uniqBy} from 'lodash'

export async function storeProductUPCMSSQL(
  source: SQLRequestSource,
  products: AddProductInput[],
) {
  const withUPCs: UPCMSSQL[] = uniqBy(products, JSON.stringify)
    .filter(x => x.upc)
    .map(x => UPCMSSQLSchema(x as any))

  if (withUPCs.length === 0) {
    return
  }

  const n = fieldName(UPCMSSQLSchema)
  await source.request().bulkInsert(
    '#Bulk_UPC',
    [
      {name: n('vendorId'), nullable: false, type: 'integer'},
      {name: n('itemNo'), nullable: false, type: 'text'},
      {name: n('upc'), nullable: false, type: 'text'},
    ],
    withUPCs.map(product => [product.vendorId, product.itemNo, product.upc]),
  )
  await source.request().query(`
      MERGE UPC AS Target
      USING (
        SELECT * FROM #Bulk_UPC as S 
        WHERE EXISTS (
          SELECT TOP 1 * FROM Ultimate as U
          WHERE U.VendorId = S.[${n('vendorId')}] 
          AND U.ItemNumber = S.[${n('itemNo')}]   
          )
      ) AS Source
      ON 
        Target.vendorId = Source.[${n('vendorId')}] 
        AND Target.itemNo = Source.[${n('itemNo')}]
        AND Target.upc = Source.[${n('upc')}]
      WHEN NOT MATCHED THEN
        INSERT ( 
          vendorId, 
          itemNo,
          upc
        )
        VALUES (
          Source.vendorId, 
          Source.itemNo,
          Source.upc
        );
      drop table #Bulk_UPC;
    `)
}
