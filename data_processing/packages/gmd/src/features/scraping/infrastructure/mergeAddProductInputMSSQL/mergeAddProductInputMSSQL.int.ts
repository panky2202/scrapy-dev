import {MSSQLProvider} from '../../../../common/infrastructure/ports/MSSQLProvider'
import {mssqlProviderConnectedToAzure} from '../../../../common/infrastructure/sql/mssqlProviderConnectedToAzure'
import {mergeAddProductInputMSSQL} from './mergeAddProductInputMSSQL'
import {AddProductInputSchema} from '../../domain/ports/AddProducts'
import {expect} from '@jest/globals'
import {ProductUltimateMSSQLSchema} from './ProductUltimateMSSQL'
import {arraySchema} from '../../../../common/domain/schema'

const TEST_VENDOR_ID = 1
const TEST_ITEM_NO = 'test item no'

describe('mergeAddProductInputMSSQL', function() {
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
        imageUrl: 'https://test.com',
        description: 'test product',
      },
      {
        vendorId: TEST_VENDOR_ID,
        itemNo: `${TEST_ITEM_NO} 1`,
        upc: '123123',
        imageUrl: 'https://test.com',
        description: 'test product',
      },
      {
        vendorId: TEST_VENDOR_ID,
        itemNo: `${TEST_ITEM_NO} 2`,
        upc: '123123',
        imageUrl: 'https://test.com',
        description: 'test product',
      },
      {
        vendorId: TEST_VENDOR_ID,
        itemNo: `${TEST_ITEM_NO} 3`,
        upc: '123123',
        imageUrl: 'https://test.com',
        description: 'test product',
      },
    ])

    const expectedResults = arraySchema(ProductUltimateMSSQLSchema)([
      {
        VendorId: TEST_VENDOR_ID,
        ItemNumber: `${TEST_ITEM_NO} 1`,
        UpcNumber: '123123',
        ImageUrl: 'https://example.com',
        Description: 'test product',
      },
      {
        VendorId: TEST_VENDOR_ID,
        ItemNumber: `${TEST_ITEM_NO} 2`,
        UpcNumber: '777',
        ImageUrl: 'https://test.com',
        Description: 'test product',
      },
    ])

    const t = sql.transaction()
    await t.begin()
    await t.request().query(`
        INSERT INTO 
            Ultimate (VendorId, ItemNumber, imageUrl) 
            VALUES (${TEST_VENDOR_ID}, '${TEST_ITEM_NO} 1', 'https://example.com')
        INSERT INTO 
            Ultimate (VendorId, ItemNumber, UpcNumber) 
            VALUES (${TEST_VENDOR_ID}, '${TEST_ITEM_NO} 2', '777')
    `)
    await mergeAddProductInputMSSQL(t, input)
    const results = await t
      .request()
      .query(
        `SELECT * FROM Ultimate WHERE VendorId=${TEST_VENDOR_ID} AND ItemNumber like '${TEST_ITEM_NO}%'`,
      )
    expect(results.records.map(ProductUltimateMSSQLSchema)).toStrictEqual(
      expectedResults,
    )
    await t.rollback()
  })
})
