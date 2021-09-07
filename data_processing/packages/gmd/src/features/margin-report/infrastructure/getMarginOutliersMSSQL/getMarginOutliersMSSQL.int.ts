import {
  createTableOfStructureMSSQL,
  testSQL,
} from '../../../../common/infrastructure/sql'
import {random} from 'lodash'
import {getMarginOutliersMSSQL} from './getMarginOutliersMSSQL'
import {addFlavorToSQLRequestSource} from '../../../../common/infrastructure/sql/addFlavorToSQLRequestSource'
import {
  DateTypeSchema,
  IntegerPositiveNumberSchema,
} from '../../../../common/domain/value-objects'
import {replaceWords} from '../../../../common/utils/replaceWords'

describe('getMarginOutliersMSSQL', function () {
  it('Should work on an empty case', async function () {
    // Id, VendorId, ItemNumber, RetailSellingUnit, MstrRetailPrice, Description, Bucket, ModifiedOn
    const ultimate: any = []

    // Id, VendorId, ItemNumber, RetailSellingUnit, MstrRetailPrice, Description, Bucket, ModifiedOn, InsertUpdateDelete
    const ultimateLogging: any = []

    // UltimateID, RetailSellingUnit, MstrRetailPrice, StoreID, ModifiedOn
    const individualRetailStores: any = []

    // ID, InvoiceNumber, InvoiceDate, StoreID
    const invoice: any = []

    // InvoiceID, InvoiceNumber, VendorId, ItemNumber, Cost
    const item: any = []

    // ItemId, CreatedOn, CreatedBy
    const dismissedItems: any = []

    // Params
    const since = `1999-01-01T00:00:00.000Z`
    const count = `10000`

    // Expected Results
    const results: any = []

    await test(
      since,
      count,
      ultimate,
      ultimateLogging,
      individualRetailStores,
      invoice,
      item,
      dismissedItems,
      results,
    )
  }, 180000)

  it('Should support "since" filter to limit search depth using InvoiceDate', async function () {
    // Id, VendorId, ItemNumber, RetailSellingUnit, MstrRetailPrice, Description, Bucket, ModifiedOn
    const ultimate: any = [
      `1, 1, 'item1', NULL, 0.6, 'Desc1', 'Bucket1', '2022-10-01', 1`,
    ]

    // Id, VendorId, ItemNumber, RetailSellingUnit, MstrRetailPrice, Description, Bucket, ModifiedOn, InsertUpdateDelete
    const ultimateLogging: any = [
      `1, 1, 'item1', NULL, 0.8, 'Desc1', 'Bucket1', '2021-05-01', 1, 1`,
    ]

    // UltimateID, RetailSellingUnit, MstrRetailPrice, StoreID, ModifiedOn
    const individualRetailStores: any = []

    // ID, InvoiceNumber, InvoiceDate, StoreID
    const invoice: any = [
      `4, 'invoice2', '2022-10-10', 9`,
      `3, 'invoice1', '2022-05-10', 9`,
    ]

    // InvoiceID, InvoiceNumber, VendorId, ItemNumber, Cost
    const item: any = [
      `4, 'invoice2', 1, 'item1', 2.0`,
      `3, 'invoice1', 1, 'item1', 1.0`,
    ]

    // ItemId, CreatedOn, CreatedBy
    const dismissedItems: any = []

    /*
    Time; Invoice Price; Retail Price; Margin
    2022-05-10; 1.0; 0.8; -0.2
    2022-10-10; 2.0; 0.6; -1.4
    */

    await test(
      `'2022-10-10'`,
      `10000`,
      ultimate,
      ultimateLogging,
      individualRetailStores,
      invoice,
      item,
      dismissedItems,
      expect.arrayContaining([
        expect.objectContaining({
          InvoiceDate: new Date('2022-10-10T00:00:00.000Z'),
          MarginStatus: 'Compression',
        }),
      ]),
    )

    await test(
      `'2022-10-11'`,
      `10000`,
      ultimate,
      ultimateLogging,
      individualRetailStores,
      invoice,
      item,
      dismissedItems,
      [],
    )
  }, 180000)

  it('Should support "since" filter to limit search depth using Ultimate.ModifiedOn', async function () {
    // Id, VendorId, ItemNumber, RetailSellingUnit, MstrRetailPrice, Description, Bucket, ModifiedOn
    const ultimate: any = [
      `1, 1, 'item1', NULL, 0.6, 'Desc1', 'Bucket1', '2022-12-01', 1`,
    ]

    // Id, VendorId, ItemNumber, RetailSellingUnit, MstrRetailPrice, Description, Bucket, ModifiedOn, InsertUpdateDelete
    const ultimateLogging: any = [
      `1, 1, 'item1', NULL, 0.6, 'Desc1', 'Bucket1', '2022-10-01', 1, 1`,
      `1, 1, 'item1', NULL, 0.8, 'Desc1', 'Bucket1', '2021-05-01', 1, 1`,
    ]

    // UltimateID, RetailSellingUnit, MstrRetailPrice, StoreID, ModifiedOn
    const individualRetailStores: any = []

    // ID, InvoiceNumber, InvoiceDate, StoreID
    const invoice: any = [
      `4, 'invoice2', '2022-10-10', 9`,
      `3, 'invoice1', '2022-05-10', 9`,
    ]

    // InvoiceID, InvoiceNumber, VendorId, ItemNumber, Cost
    const item: any = [
      `4, 'invoice2', 1, 'item1', 2.0`,
      `3, 'invoice1', 1, 'item1', 1.0`,
    ]

    // ItemId, CreatedOn, CreatedBy
    const dismissedItems: any = []

    /*
    Time; Invoice Price; Retail Price; Margin
    2022-05-10; 1.0; 0.8; -0.2
    2022-10-10; 2.0; 0.6; -1.4
    */

    await test(
      `'2022-11-20'`,
      `10000`,
      ultimate,
      ultimateLogging,
      individualRetailStores,
      invoice,
      item,
      dismissedItems,
      expect.arrayContaining([
        expect.objectContaining({
          InvoiceDate: new Date('2022-10-10T00:00:00.000Z'),
          MarginStatus: 'Compression',
        }),
      ]),
    )

    await test(
      `'2023-01-01'`,
      `10000`,
      ultimate,
      ultimateLogging,
      individualRetailStores,
      invoice,
      item,
      dismissedItems,
      [],
    )
  }, 180000)

  it('Should consider that each store buys items independently, eg, each invoice is linked to a specific store', async function () {
    // Id, VendorId, ItemNumber, RetailSellingUnit, MstrRetailPrice, Description, Bucket, ModifiedOn
    const ultimate: any = [
      `1, 1, 'item1', NULL, 0.6, 'Desc1', 'Bucket1', '2022-12-01', 1`,
    ]

    // Id, VendorId, ItemNumber, RetailSellingUnit, MstrRetailPrice, Description, Bucket, ModifiedOn, InsertUpdateDelete
    const ultimateLogging: any = [
      `1, 1, 'item1', NULL, 0.6, 'Desc1', 'Bucket1', '2022-10-01', 1, 1`,
      `1, 1, 'item1', NULL, 0.8, 'Desc1', 'Bucket1', '2021-05-01', 1, 1`,
    ]

    // UltimateID, RetailSellingUnit, MstrRetailPrice, StoreID, ModifiedOn
    const individualRetailStores: any = [`1, NULL, 4.0, 8, '2022-10-01'`]

    // ID, InvoiceNumber, InvoiceDate, StoreID
    const invoice: any = [
      // for store 9
      `4, 'invoice2', '2022-10-10', 9`,
      `3, 'invoice1', '2022-05-10', 9`,

      // for store 8
      `4, 'invoice4', '2022-10-10', 8`,
      `3, 'invoice3', '2022-05-10', 8`,
    ]

    // InvoiceID, InvoiceNumber, VendorId, ItemNumber, Cost
    const item: any = [
      // for store 9
      `4, 'invoice2', 1, 'item1', 2.0`,
      `3, 'invoice1', 1, 'item1', 1.0`,

      // for store 8
      `4, 'invoice4', 1, 'item1', 3.0`,
      `3, 'invoice3', 1, 'item1', 2.0`,
    ]

    // ItemId, CreatedOn, CreatedBy
    const dismissedItems: any = []

    /*
    Time; Invoice Price; Retail Price; Margin

    // Store 9
    2022-05-10; 1.0; 0.8; -0.2
    2022-10-10; 2.0; 0.6; -1.4

    // Store 8
    2022-05-10; 2.0; 0.8; -1.2
    2022-10-10; 3.0; 4.0;  1.0
    */

    await test(
      `'1999-01-01'`,
      `10000`,
      ultimate,
      ultimateLogging,
      individualRetailStores,
      invoice,
      item,
      dismissedItems,
      [
        expect.objectContaining({
          InvoiceDate: new Date('2022-10-10T00:00:00.000Z'),
          RetailPriceDate: new Date('2022-10-01T00:00:00.000Z'),
          VendorName: 'CHOY',
          ItemNumber: 'item1',
          StoreName: 'SB',
          MarginStatus: 'Expansion',
          MasterRetailPrice: 0.6,
          CustomRetailPrice: 4.0,
        }),

        expect.objectContaining({
          InvoiceDate: new Date('2022-10-10T00:00:00.000Z'),
          VendorName: 'CHOY',
          ItemNumber: 'item1',
          StoreName: 'BARATO',
          MarginStatus: 'Compression',
          MasterRetailPrice: 0.6,
        }),
      ],
    )

    // Check that "count" works
    await test(
      `'1999-01-01'`,
      `1`,
      ultimate,
      ultimateLogging,
      individualRetailStores,
      invoice,
      item,
      dismissedItems,
      [
        expect.objectContaining({
          InvoiceDate: new Date('2022-10-10T00:00:00.000Z'),
          VendorName: 'CHOY',
          ItemNumber: 'item1',
          StoreName: 'SB',
          MarginStatus: 'Expansion',
          MasterRetailPrice: 0.6,
          CustomRetailPrice: 4.0,
        }),
      ],
    )
  }, 180000)

  it('Should correctly find RetailPriceDate when the last CustomRetailPrice is deleted', async function () {
    // Id, VendorId, ItemNumber, RetailSellingUnit, MstrRetailPrice, Description, Bucket, ModifiedOn
    const ultimate: any = [
      `1, 1, 'item1', NULL, 0.6, 'Desc1', 'Bucket1', '2022-01-01', 1`,
    ]

    // Id, VendorId, ItemNumber, RetailSellingUnit, MstrRetailPrice, Description, Bucket, ModifiedOn, InsertUpdateDelete
    const ultimateLogging: any = []

    // UltimateID, RetailSellingUnit, MstrRetailPrice, StoreID, ModifiedOn
    const individualRetailStores: any = [
      `1, NULL, 4.0,  8, '2022-08-01'`,
      `1, NULL, NULL, 8, '2022-09-01'`,
    ]

    // ID, InvoiceNumber, InvoiceDate, StoreID
    const invoice: any = [
      // for store 8
      `4, 'invoice4', '2022-10-10', 8`,
      `3, 'invoice3', '2022-05-10', 8`,
      `2, 'invoice2', '2022-04-10', 8`,
    ]

    // InvoiceID, InvoiceNumber, VendorId, ItemNumber, Cost
    const item: any = [
      // for store 8
      `4, 'invoice4', 1, 'item1', 3.0`,
      `3, 'invoice3', 1, 'item1', 2.0`,
      `2, 'invoice2', 1, 'item1', 0.1`,
    ]

    // ItemId, CreatedOn, CreatedBy
    const dismissedItems: any = []

    /*
    Time; Invoice Price; Retail Price; Margin

    // Store 8
    2022-04-10; 0.1; 0.6;  0.5
    2022-05-10; 2.0; 0.6; -1.4
    2022-10-10; 3.0; 0.6;  2.4
    */

    await test(
      `'1999-01-01'`,
      `10000`,
      ultimate,
      ultimateLogging,
      individualRetailStores,
      invoice,
      item,
      dismissedItems,
      [
        expect.objectContaining({
          InvoiceDate: new Date('2022-10-10T00:00:00.000Z'),
          RetailPriceDate: new Date('2022-01-01T00:00:00.000Z'),
        }),
      ],
    )
  }, 180000)

  it('Should work', async function () {
    // Id, VendorId, ItemNumber, RetailSellingUnit, MstrRetailPrice, Description, Bucket, ModifiedOn, Discont
    const ultimate: any = [
      // 1+item2 price point AFTER last invoice
      `2, 1, 'item2', NULL, 10.0, 'Desc2', 'Bucket2', '2022-10-30', 1`,

      // there is an error in db and we have a duplicated record
      `1, 1, 'item1', NULL, 0.6, 'Desc1', 'Bucket1', '2022-10-14 00:00:00', 1`,
      `3, 1, 'item1', NULL, 0.6, 'Desc1', 'Bucket1', '2022-10-14 00:00:00', 1`,

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

    // Id, VendorId, ItemNumber, RetailSellingUnit, MstrRetailPrice, Description, Bucket, ModifiedOn, Discont, InsertUpdateDelete
    const ultimateLogging: any = [
      `1, 1, 'item1', '2 FOR 1', NULL, 'Desc1', 'Bucket1', '2022-10-09', 1, 1`,

      // 1+item2 had price changed several time a day, but in the end it is 6
      `2, 1, 'item2', NULL, 4, 'Desc2', 'Bucket2', '2022-10-09 01:00:00', 1, 1`,
      `2, 1, 'item2', NULL, 3, 'Desc2', 'Bucket2', '2022-10-09 03:00:00', 1, 1`,
      `2, 1, 'item2', NULL, 6, 'Desc2', 'Bucket2', '2022-10-09 04:00:00', 1, 1`,
      `2, 1, 'item2', NULL, 3, 'Desc2', 'Bucket2', '2022-10-09 02:00:00', 1, 1`,

      // we didn't sell 1+item2 for invoice on 2022-10-15
      `2, 1, 'item2', NULL, 4, 'Desc2', 'Bucket2', '2022-10-14', 1, 2`,
      // but start sell again for invoice on 2022-10-20
      `2, 1, 'item2', NULL, 7, 'Desc2', 'Bucket2', '2022-10-19', 1, 0`,
      // there is an error in db and we have a duplicated record
      `2, 1, 'item2', NULL, 7, 'Desc2', 'Bucket2', '2022-10-19', 1, 0`,

      // prices in the past, but before year 2000
      `2, 1, 'item2', NULL, 4, 'Desc2', 'Bucket2', '1999-01-01', 1, 1`,

      // doesn't exist in ultimate
      `4, 1, 'item3', NULL, 3, NULL, NULL, '2022-01-01', 1, 1`,
    ]

    // UltimateID, RetailSellingUnit, MstrRetailPrice, StoreID, ModifiedOn
    const individualRetailStores: any = []

    // ID, InvoiceNumber, InvoiceDate, StoreID
    const invoice: any = [
      `3, 'invoice1', '2022-10-10', 9`,
      `4, 'invoice2', '2022-10-15', 9`,
      `5, 'invoice3', '2022-10-20', 9`,
      `6, 'invoice4', '2022-10-25', 9`,
      `8, 'invoice6', '2022-10-25', 9`,
      `7, 'invoice5', '2022-10-25', 9`,
      `1, 'invoiceInPast1', '2000-01-01', 9`,
      `2, 'invoiceInPast2', '2001-01-01', 9`,
    ]

    // InvoiceID, InvoiceNumber, VendorId, ItemNumber, Cost
    const item: any = [
      // 1+item1 was cheap, but then price skyrocket, this is margin compression
      `4, 'invoice2', 1, 'item1', 100.0`,
      `3, 'invoice1', 1, 'item1', 0.66`,

      // 1+item5 price almost didn't change for this item - no compression/expansion
      `4, 'invoice2', 1, 'item5', 0.66`,
      `3, 'invoice1', 1, 'item5', 0.66`,

      // This invoice has a broken price
      `5, 'invoice3', 1, 'item1', NULL`,

      // 1+item3 doesn't currently exist in Ultimate
      `4, 'invoice2', 1, 'item3', 100.0`,
      `3, 'invoice1', 1, 'item3', 0.66`,

      // 1+item2 became more expensive with time
      `3, 'invoice1', 1, 'item2', 1.0`,
      `4, 'invoice2', 1, 'item2', 2.0`,
      `5, 'invoice3', 1, 'item2', 1.0`,
      `6, 'invoice4', 1, 'item2', 3.0`,
      `8, 'invoice6', 1, 'item2', 4.0`,
      `7, 'invoice5', 1, 'item2', 5.0`,

      // These items are faaar in the past
      `1, 'invoiceInPast1', 1, 'item1', 1.0`,
      `2, 'invoiceInPast2', 1, 'item1', 2.0`,

      // The special OFIVE case, when we switch vendorId of an item
      `4, 'invoice2', 1145, 'item6', 100.0`,
      `3, 'invoice1', 1145, 'item6', 0.66`,
      // These invoices should be ignored, as they were not sold by OFIVE
      `3, 'invoice1', 1, 'item6', 9999.0`,
      `4, 'invoice2', 1, 'item6', 9999.0`,
    ]

    // ItemId, CreatedOn, CreatedBy
    const dismissedItems: any = []

    /*
    1+item1 history
    invoice time / invoice price / retail price
    2000-01-01, 1.00,   0.5,
    2001-01-01, 2.00,   0.5,
    2022-10-10, 0.66,   0.5,
    2022-10-15, 100.00, 0.6,

    1+item1 history for BARATO
    invoice time / invoice price / retail price
    2000-01-01, 1.00,   0.5,
    2001-01-01, 2.00,   0.5,
    2022-10-10, 0.66,   100.0,
    2022-10-15, 100.00, 1000.0,


    1+item2 history
    invoice time / invoice price / retail price
    2022-10-10, 1.0, 6
    2022-10-15, 2.0, -
    2022-10-20, 1.0, 7
    2022-10-25, 3.0, 7
    2022-10-25, 4.0, 7
    2022-10-25, 5.0, 7
                     10.0
    */

    // Params
    const since = `1999-01-01T00:00:00.000Z`
    const count = `10000`

    // Expected Results
    const results: any = expect.arrayContaining([
      // The special OFIVE case
      expect.objectContaining({
        InvoiceDate: new Date('2022-10-15T00:00:00.000Z'),
        RetailPriceDate: new Date('2022-10-09T00:00:00.000Z'),
        Bucket: 'Bucket6',
        InvoiceNumber: 'invoice2',
        VendorName: 'OFIVE',
        ItemNumber: 'item6',
        Description: 'Desc6',
        InvoiceCost: 100.0,
        RetailPrice: 0.5,
        Margin: -99.5,
        MarginQ1: -74.67,
        MarginQ2: -49.83,
        MarginQ3: -25.0,
        MarginStatus: 'Compression',
      }),

      // This has ultimate history
      expect.objectContaining({
        InvoiceDate: new Date('2022-10-25T00:00:00.000Z'),
        RetailPriceDate: new Date('2022-10-19T00:00:00.000Z'),
        Bucket: 'Bucket2',
        InvoiceNumber: 'invoice6',
        VendorName: 'CHOY',
        ItemNumber: 'item2',
        StoreName: 'BARATO',
        Description: 'Desc2',
        InvoiceCost: 4.0,
        RetailPrice: 7.0,
        Margin: 3.0,
        MarginQ1: 3.0,
        MarginQ2: 4.0,
        MarginQ3: 5.0,
        MarginStatus: 'Compression',
      }),

      // Regular Item
      expect.objectContaining({
        InvoiceDate: new Date('2022-10-15T00:00:00.000Z'),
        RetailPriceDate: new Date('2022-10-14T00:00:00.000Z'),
        Bucket: 'Bucket1',
        InvoiceNumber: 'invoice2',
        VendorName: 'CHOY',
        ItemNumber: 'item1',
        StoreName: 'BARATO',
        Description: 'Desc1',
        InvoiceCost: 100.0,
        RetailPrice: 0.6,
        Margin: -99.4,
        MarginQ1: -25.98,
        MarginQ2: -1.0,
        MarginQ3: -0.42,
        MarginStatus: 'Compression',
      }),
    ])

    // NOT Expected Results
    const notExpectedResults: any[] = [
      // There should not be an item without Ultimate record
      expect.arrayContaining([
        expect.objectContaining({
          ItemNumber: 'item3',
        }),
      ]),

      // This item has stable margin, should not be in the report
      expect.arrayContaining([
        expect.objectContaining({
          ItemNumber: 'item5',
        }),
      ]),
    ]

    await test(
      since,
      count,
      ultimate,
      ultimateLogging,
      individualRetailStores,
      invoice,
      item,
      dismissedItems,
      results,
      notExpectedResults,
    )
  }, 180000)

  describe('Dismissed feature', function () {
    // Id, VendorId, ItemNumber, RetailSellingUnit, MstrRetailPrice, Description, Bucket, ModifiedOn, Discont
    const ultimate: any = [
      // 1+item2 price point AFTER last invoice
      `2, 1, 'item2', NULL, 10.0, 'Desc2', 'Bucket2', '2022-10-30', 1`,
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

    // Id, VendorId, ItemNumber, RetailSellingUnit, MstrRetailPrice, Description, Bucket, ModifiedOn, Discont, InsertUpdateDelete
    const ultimateLogging: any = [
      `1, 1, 'item1', '2 FOR 1', NULL, 'Desc1', 'Bucket1', '2022-10-09', 1, 1`,

      // 1+item2 had price changed several time a day, but in the end it is 6
      `2, 1, 'item2', NULL, 4, 'Desc2', 'Bucket2', '2022-10-09 01:00:00', 1, 1`,
      `2, 1, 'item2', NULL, 3, 'Desc2', 'Bucket2', '2022-10-09 03:00:00', 1, 1`,
      `2, 1, 'item2', NULL, 6, 'Desc2', 'Bucket2', '2022-10-09 04:00:00', 1, 1`,
      `2, 1, 'item2', NULL, 3, 'Desc2', 'Bucket2', '2022-10-09 02:00:00', 1, 1`,

      // we didn't sell 1+item2 for invoice on 2022-10-15
      `2, 1, 'item2', NULL, 4, 'Desc2', 'Bucket2', '2022-10-14', 1, 2`,
      // but start sell again for invoice on 2022-10-20
      `2, 1, 'item2', NULL, 7, 'Desc2', 'Bucket2', '2022-10-19', 1, 0`,
      // there is an error in db and we have a duplicated record
      `2, 1, 'item2', NULL, 7, 'Desc2', 'Bucket2', '2022-10-19', 1, 0`,

      // prices in the past, but before year 2000
      `2, 1, 'item2', NULL, 4, 'Desc2', 'Bucket2', '1999-01-01', 1, 1`,

      // doesn't exist in ultimate
      `4, 1, 'item3', NULL, 3, NULL, NULL, '2022-01-01', 1, 1`,
    ]

    // UltimateID, RetailSellingUnit, MstrRetailPrice, StoreID, ModifiedOn
    const individualRetailStores: any = []

    // ID, InvoiceNumber, InvoiceDate, StoreID
    const invoice: any = [
      `3, 'invoice1', '2022-10-10', 9`,
      `4, 'invoice2', '2022-10-15', 9`,
      `5, 'invoice3', '2022-10-20', 9`,
      `6, 'invoice4', '2022-10-25', 9`,
      `8, 'invoice6', '2022-10-25', 9`,
      `7, 'invoice5', '2022-10-25', 9`,
      `1, 'invoiceInPast1', '2000-01-01', 9`,
      `2, 'invoiceInPast2', '2001-01-01', 9`,
    ]

    // InvoiceID, InvoiceNumber, VendorId, ItemNumber, Cost
    const item: any = [
      // 1+item1 was cheap, but then price skyrocket, this is margin compression
      `4, 'invoice2', 1, 'item1', 100.0`,
      `3, 'invoice1', 1, 'item1', 0.66`,

      // 1+item5 price almost didn't change for this item - no compression/expansion
      `4, 'invoice2', 1, 'item5', 0.66`,
      `3, 'invoice1', 1, 'item5', 0.66`,

      // This invoice has a broken price
      `5, 'invoice3', 1, 'item1', NULL`,

      // 1+item3 doesn't currently exist in Ultimate
      `4, 'invoice2', 1, 'item3', 100.0`,
      `3, 'invoice1', 1, 'item3', 0.66`,

      // 1+item2 became more expensive with time
      `3, 'invoice1', 1, 'item2', 1.0`,
      `4, 'invoice2', 1, 'item2', 2.0`,
      `5, 'invoice3', 1, 'item2', 1.0`,
      `6, 'invoice4', 1, 'item2', 3.0`,
      `8, 'invoice6', 1, 'item2', 4.0`,
      `7, 'invoice5', 1, 'item2', 5.0`,

      // These items are faaar in the past
      `1, 'invoiceInPast1', 1, 'item1', 1.0`,
      `2, 'invoiceInPast2', 1, 'item1', 2.0`,

      // The special OFIVE case, when we switch vendorId of an item
      `4, 'invoice2', 1145, 'item6', 100.0`,
      `3, 'invoice1', 1145, 'item6', 0.66`,
      // These invoices should be ignored, as they were not sold by OFIVE
      `3, 'invoice1', 1, 'item6', 9999.0`,
      `4, 'invoice2', 1, 'item6', 9999.0`,
    ]

    // Params
    const since = `1999-01-01T00:00:00.000Z`
    const count = `10000`

    it('Should show all items since the dismissed items table is empty', async function () {
      // ItemId, CreatedOn, CreatedBy
      const dismissedItems: any = []

      // Expected Results
      const results: any = expect.arrayContaining([
        // The special OFIVE case
        expect.objectContaining({
          ItemNumber: 'item6',
        }),

        // This has ultimate history
        expect.objectContaining({
          ItemNumber: 'item2',
        }),

        // Regular Item
        expect.objectContaining({
          ItemNumber: 'item1',
        }),
      ])

      await test(
        since,
        count,
        ultimate,
        ultimateLogging,
        individualRetailStores,
        invoice,
        item,
        dismissedItems,
        results,
        [],
      )
    }, 180000)

    it('Should consider the dismissed items and remove them from the margin report', async function () {
      // ItemId, CreatedOn, CreatedBy
      const dismissedItems: any = [`-1, '2021-07-28 15:06:48.3166667', 1`]

      // Expected Results
      const results: any = expect.arrayContaining([
        // The special OFIVE case
        expect.objectContaining({
          ItemNumber: 'item6',
        }),

        // This has ultimate history
        expect.objectContaining({
          ItemNumber: 'item2',
        }),
      ])

      // NOT Expected Results
      const notExpectedResults: any[] = [
        // There should not be an item that was dismissed
        expect.arrayContaining([
          expect.objectContaining({
            ItemNumber: 'item1',
          }),
        ]),
      ]

      await test(
        since,
        count,
        ultimate,
        ultimateLogging,
        individualRetailStores,
        invoice,
        item,
        dismissedItems,
        results,
        notExpectedResults,
      )
    }, 180000)
  })

  async function test(
    paramSince: string,
    paramCount: string,
    ultimate: string[],
    ultimateLogging: string[],
    individualRetailStores: string[],
    invoice: string[],
    item: string[],
    dismissedItems: string[],
    expectedResults: any,
    notExpectedResults?: any,
  ) {
    const createTablesQuery = `
    ${createTableOfStructureMSSQL('#Ultimate', 'Ultimate', {
      columns: `Id, VendorId, ItemNumber, RetailSellingUnit, MstrRetailPrice, Description, Bucket, ModifiedOn, Discont, CreatedOn, CreatedBy, ModifiedBy`,
      values: ultimate.map((x: any) => x + `, '2021-07-09', 0, 0`),
      identityInsert: true,
    })}
    
    ${createTableOfStructureMSSQL('#UltimateLogging', 'UltimateLogging', {
      columns: `Id, VendorId, ItemNumber, RetailSellingUnit, MstrRetailPrice, Description, Bucket, ModifiedOn, Discont, InsertUpdateDelete, CreatedOn, AlteredOn, CreatedBy, ModifiedBy`,
      values: ultimateLogging.map(
        (x: any) => x + `, '2021-07-09', '2021-07-09', 0, 0`,
      ),
    })}
    
    ${createTableOfStructureMSSQL(
      '#individualRetailStores',
      'individualRetailStores',
      {
        columns: `UltimateID, RetailSellingUnit, MstrRetailPrice, StoreID, ModifiedOn, ModifiedBy, Id`,
        values: individualRetailStores.map(
          (x: any) => x + `, 0, ${-1 * random(1, 10000)}`,
        ),
        identityInsert: true,
      },
    )}
    
    ${createTableOfStructureMSSQL('#Invoice', 'Invoice', {
      columns: `ID, InvoiceNumber, InvoiceDate,  StoreID, CreatedOn, StatusId, VendorId, ProcessedAt, Store, Total, FileName, ReceivedAt`,
      values: invoice.map(
        (x: any) =>
          x + `, '2021-07-09', 0, 0, '2021-07-09', 0, 0, '', '2021-07-09'`,
      ),
      identityInsert: true,
    })} 
   
    ${createTableOfStructureMSSQL('#item', 'Item', {
      columns: `InvoiceID, InvoiceNumber, VendorId, ItemNumber, Cost, ID, ExtendedAmount`,
      values: item.map((x: any, index) => x + `, ${-1 * (index + 1)}, 0`),
      identityInsert: true,
    })} 
    
    ${createTableOfStructureMSSQL('#DismissedItems', 'DismissedItems', {
      columns: `ItemId, CreatedOn, CreatedBy`,
      values: dismissedItems.map((x: any) => x),
    })} 
    `

    await testSQL(async (sql) => {
      const setupTestEnvironment = (query: string) =>
        createTablesQuery +
        ' ' +
        replaceWords(
          {
            Ultimate: '#Ultimate',
            UltimateLogging: '#UltimateLogging',
            individualRetailStores: '#individualRetailStores',
            Invoice: '#Invoice',
            Item: '#Item',
            DismissedItems: '#DismissedItems',
          },
          query,
        )

      const f = getMarginOutliersMSSQL({
        sql: addFlavorToSQLRequestSource(setupTestEnvironment)(sql),
      })

      const results = await f({
        since: DateTypeSchema(paramSince),
        count: IntegerPositiveNumberSchema(paramCount),
      })

      expect(results).toStrictEqual(expectedResults)
      for (const badResult of notExpectedResults || []) {
        expect(results).not.toStrictEqual(badResult)
      }
    })
  }
})
