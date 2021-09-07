import {
  createTableOfStructureMSSQL,
  TableNameSchema,
  testSQL,
} from '../../../../common/infrastructure/sql'
import {addFlavorToSQLRequestSource} from '../../../../common/infrastructure/sql/addFlavorToSQLRequestSource'
import {replaceWords} from '../../../../common/utils/replaceWords'
import {getCostChangeEventsMSSQL} from './getCostChangeEventsMSSQL'

describe('getCostChangeEventsMSSQL', function () {
  it('Should work on an empty case', async function () {
    // ID, InvoiceNumber, InvoiceDate, StoreID
    const invoice: any = []

    // InvoiceID, InvoiceNumber, VendorId, ItemNumber, Cost
    const item: any = []

    // Expected Results
    const results: any = []

    const ultimate: any = []

    await test(invoice, item, ultimate, results)
  }, 180000)

  it('Should work', async function () {
    // ID, InvoiceNumber, InvoiceDate, StoreID
    const invoice: any = [
      `3, 'invoice1', '2022-10-10', 9`,
      `4, 'invoice2', '2022-10-15', 9`,
      `5, 'invoice3', '2022-10-20', 9`,
      `6, 'invoice4', '2022-10-25', 9`,

      // invoice 5 and 6 are in conflict for 1 date
      // to resolve the conflict we use ID
      `7, 'invoice5', '2022-10-25', 9`,
      `8, 'invoice6', '2022-10-25', 9`,

      `1, 'invoiceInPast1', '2000-01-01', 9`,
      `2, 'invoiceInPast2', '2001-01-01', 9`,
    ]

    // InvoiceID, InvoiceNumber, VendorId, ItemNumber, Cost, Bucket, Description
    const item: any = [
      `3, 'invoice1', 1, 'item1', 0.66, NULL, NULL`,
      `4, 'invoice2', 1, 'item1', 0.66, NULL, NULL`,

      // This invoice has a broken price
      `5, 'invoice3', 1, 'item1', NULL, NULL, NULL`,

      `3, 'invoice1', 1, 'item2', 1.0, NULL, NULL`,
      `4, 'invoice2', 1, 'item2', 1.0, NULL, NULL`,
      `5, 'invoice3', 1, 'item2', 1.1, 'Not that bucket', 'Desc2'`,
      `6, 'invoice4', 1, 'item2', 1.1, NULL, NULL`,
      `8, 'invoice6', 1, 'item2', 0.9, NULL, NULL`,
      `7, 'invoice5', 1, 'item2', 0.9, NULL, NULL`,

      // These items are faaar in the past
      `1, 'invoiceInPast1', 1, 'item1', 1.0, NULL, NULL`,
      `2, 'invoiceInPast2', 1, 'item1', 1.0, NULL, NULL`,

      // The special OFIVE case, when we switch vendorId of an item
      `4, 'invoice2', 1145, 'item6', 100.0, NULL, NULL`,
      `3, 'invoice1', 1145, 'item6', 0.66, NULL, NULL`,
      // These invoices should be ignored, as they were not sold by OFIVE
      `3, 'invoice1', 1, 'item6', 9999.0, NULL, NULL`,
      `4, 'invoice2', 1, 'item6', 9999.0, NULL, NULL`,
    ]

    // Id, VendorId, ItemNumber, RetailSellingUnit, MstrRetailPrice, Description, Bucket, ModifiedOn, Discont
    const ultimate: any = [
      // 1+item2 price point AFTER last invoice
      `2, 1, 'item2', NULL, 10.0, 'Not that description', 'Bucket2', '2022-10-30', 1`,
      `1, 1, 'item1', NULL, 0.6, 'Desc1', 'Bucket1', '2022-10-14 00:00:00', 1`,
      // a stable item with no price fluctuation
      `5, 1, 'item5', NULL, 10.0, NULL, NULL, '2022-10-09', 1`,
      /*
      This is a special Discont = 3 case item.
      When in the Ultimate table an item has Discount = 3 then we should treat VendorId of this item like 1145
      1145 - OFIVE

      This is for the case, when we buy items from OFIVE.
      These items have original VendorIds, but we want to treat them as we have bought from OFIVE.
       */
      `6, 1, 'item6', '2 FOR 1', NULL, 'Desc6', 'Bucket6', '2022-10-09', 3`,
    ]

    /*
    1+item1 history
    invoice time / invoice price
    2000-01-01, 1.00,
    2001-01-01, 1.00,
    2022-10-10, 0.66,
    2022-10-15, 0.66,

    1+item2 history
    invoice time / invoice price
    2022-10-10, 1.0,
    2022-10-15, 1.0,
    2022-10-20, 1.1,
    2022-10-25, 1.1,
    2022-10-25, 0.9,
    2022-10-25, 0.9,
    */

    await test(
      invoice,
      item,
      ultimate,
      expect.arrayContaining([
        expect.objectContaining({
          InvoiceDate: new Date('2022-10-20T00:00:00.000Z'),
          Bucket: 'Bucket2',
          Description: 'Desc2',
          InvoiceNumber: 'invoice3',
          VendorName: 'CHOY',
          StoreName: 'BARATO',
          PreviousInvoiceCost: 1.0,
          InvoiceCost: 1.1,
          ItemNumber: 'item2',
        }),

        expect.objectContaining({
          InvoiceDate: new Date('2022-10-25T00:00:00.000Z'),
          VendorName: 'CHOY',
          ItemNumber: 'item2',
          InvoiceNumber: 'invoice5',
          PreviousInvoiceCost: 1.1,
          InvoiceCost: 0.9,
        }),
      ]),
      [
        expect.arrayContaining([
          expect.objectContaining({
            InvoiceNumber: 'invoice6',
          }),
        ]),

        expect.arrayContaining([
          expect.objectContaining({
            InvoiceNumber: 'invoice1',
            ItemNumber: 'item2',
          }),
        ]),

        expect.arrayContaining([
          expect.objectContaining({
            InvoiceNumber: 'invoiceInPast1',
          }),
        ]),

        expect.arrayContaining([
          expect.objectContaining({
            InvoiceNumber: 'invoiceInPast2',
          }),
        ]),
      ],
    )
  }, 180000)

  async function test(
    invoice: string[],
    item: string[],
    ultimate: string[],
    expectedResults: any,
    notExpectedResults?: any,
  ) {
    const createTablesQuery = `
    ${createTableOfStructureMSSQL('#Invoice', 'Invoice', {
      columns: `ID, InvoiceNumber, InvoiceDate,  StoreID, CreatedOn, StatusId, VendorId, ProcessedAt, Store, Total, FileName, ReceivedAt`,
      values: invoice.map(
        (x: any) =>
          x + `, '2021-07-09', 0, 0, '2021-07-09', 0, 0, '', '2021-07-09'`,
      ),
      identityInsert: true,
    })} 
   
    ${createTableOfStructureMSSQL('#item', 'Item', {
      columns: `InvoiceID, InvoiceNumber, VendorId, ItemNumber, Cost, Bucket, Description, ID, ExtendedAmount`,
      values: item.map((x: any, index) => x + `, ${-1 * (index + 1)}, 0`),
      identityInsert: true,
    })} 
    
    ${createTableOfStructureMSSQL('#Ultimate', 'Ultimate', {
      columns: `Id, VendorId, ItemNumber, RetailSellingUnit, MstrRetailPrice, Description, Bucket, ModifiedOn, Discont, CreatedOn, CreatedBy, ModifiedBy`,
      values: ultimate.map((x: any) => x + `, '2021-07-09', 0, 0`),
      identityInsert: true,
    })}
    `

    await testSQL(async (sql) => {
      const setupTestEnvironment = (query: string) =>
        createTablesQuery +
        ' ' +
        replaceWords(
          {
            Ultimate: '#Ultimate',
            Invoice: '#Invoice',
            Item: '#Item',
          },
          query,
        )

      const f = getCostChangeEventsMSSQL({
        sql: addFlavorToSQLRequestSource(setupTestEnvironment)(sql),
        resultTable: TableNameSchema('SomeResultTable'),
      })

      const results = await f()

      expect(results).toStrictEqual(expectedResults)
      for (const badResult of notExpectedResults || []) {
        expect(results).not.toStrictEqual(badResult)
      }
    })
  }
})
