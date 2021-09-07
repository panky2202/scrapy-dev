import {MSSQLProvider} from '../../../../common/infrastructure/ports/MSSQLProvider'
import {mssqlProviderConnectedToAzure} from '../../../../common/infrastructure/sql/mssqlProviderConnectedToAzure'
import {expect} from '@jest/globals'
import {UPCMSSQLSchema} from './UPCMSSQL'
import {arraySchema} from '../../../../common/domain/schema'
import {storeProductUPCMSSQL} from './storeProductUPCMSSQL'
import {AddProductInputSchema} from '../../domain/ports/AddProducts'

const TEST_VENDOR_ID = 1
const TEST_ITEM_NO = 'test item no'

describe('storeProductUPCMSSQL', function() {
  let sql: MSSQLProvider

  beforeAll(async function() {
    sql = await mssqlProviderConnectedToAzure()
  }, 180000)

  afterAll(async function() {
    if (sql) await sql.close()
  })

  it('Should work', async function() {
    const input = arraySchema(AddProductInputSchema)([
      {
        vendorId: TEST_VENDOR_ID,
        itemNo: `${TEST_ITEM_NO} 1`,
        upc: '123123',
      },
      {
        vendorId: TEST_VENDOR_ID,
        itemNo: `${TEST_ITEM_NO} 1`,
        upc: '123123',
      },
      {
        vendorId: TEST_VENDOR_ID,
        itemNo: `${TEST_ITEM_NO} 2`,
        upc: '123125',
      },
      {
        vendorId: TEST_VENDOR_ID,
        itemNo: `${TEST_ITEM_NO} 2`,
        upc: '123124',
      },
      {
        vendorId: TEST_VENDOR_ID,
        itemNo: `${TEST_ITEM_NO} 3`,
        upc: '123123',
      },
    ])

    const expectedResults = arraySchema(UPCMSSQLSchema)([
      {
        vendorId: TEST_VENDOR_ID,
        itemNo: `${TEST_ITEM_NO} 1`,
        upc: '123123',
      },
      {
        vendorId: TEST_VENDOR_ID,
        itemNo: `${TEST_ITEM_NO} 2`,
        upc: '123124',
      },
      {
        vendorId: TEST_VENDOR_ID,
        itemNo: `${TEST_ITEM_NO} 2`,
        upc: '123125',
      },
    ])

    const t = sql.transaction()
    await t.begin()
    await t.request().query(`
        INSERT INTO 
            Ultimate (VendorId, ItemNumber) 
            VALUES (${TEST_VENDOR_ID}, '${TEST_ITEM_NO} 1')
        INSERT INTO 
            Ultimate (VendorId, ItemNumber) 
            VALUES (${TEST_VENDOR_ID}, '${TEST_ITEM_NO} 2')
        INSERT INTO 
            UPC (vendorId, itemNo, upc) 
            VALUES (${TEST_VENDOR_ID}, '${TEST_ITEM_NO} 2', '123124')
    `)
    await storeProductUPCMSSQL(t, input)
    const results = await t
      .request()
      .query(
        `SELECT * FROM UPC WHERE vendorId=${TEST_VENDOR_ID} AND itemNo like '${TEST_ITEM_NO}%'`,
      )
    expect(results.records.map(UPCMSSQLSchema)).toStrictEqual(expect.arrayContaining(expectedResults))
    await t.rollback()
  }, 180000)
})
