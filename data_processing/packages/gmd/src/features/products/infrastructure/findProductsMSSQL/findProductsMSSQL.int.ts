import {mssqlProviderConnectedToAzure} from '../../../../common/infrastructure/sql'
import {MSSQLProvider} from '../../../../common/infrastructure/ports/MSSQLProvider'
import {Product, ProductSchema} from '../../../../common/domain/entities'
import {findProductsMSSQL} from './findProductsMSSQL'
import {
  ProductsInput,
  ProductsInputSchema,
} from '../../domain/ports/FindProducts'

const TEST_VENDOR_ID = 1
const TEST_ITEM_NO = 'findProductsMSSQL'
const GOOD_UPC1 = '725272730430'
const GOOD_UPC2 = '725272730416'
const GOOD_UPC3 = '725212730704'
const EMAIL = 'test@email.com'

describe('findProductsMSSQL', function() {
  let sql: MSSQLProvider

  beforeAll(async function() {
    sql = await mssqlProviderConnectedToAzure()
  }, 180000)

  afterAll(async function() {
    if (sql) await sql.close()
  })

  const test = async (input: ProductsInput, expectedResult: Product[]) => {
    const t = sql.transaction()
    await t.begin()
    await t.request().query(`
        INSERT INTO 
            Ultimate (VendorId, ItemNumber, UpcNumber, Description) 
            VALUES 
                (${TEST_VENDOR_ID}, '${TEST_ITEM_NO} 1', '${GOOD_UPC1}', 'item 1'),
                (${TEST_VENDOR_ID}, '${TEST_ITEM_NO} 2', '', 'item 2');
                
        INSERT INTO 
            UPC (vendorId, itemNo, upc) 
            VALUES 
                (${TEST_VENDOR_ID}, '${TEST_ITEM_NO} 1', '${GOOD_UPC2}'),
                (${TEST_VENDOR_ID}, '${TEST_ITEM_NO} 1', '${GOOD_UPC3}'),
                (${TEST_VENDOR_ID}, '${TEST_ITEM_NO} 2', '${GOOD_UPC3}');
    `)
    const results = await findProductsMSSQL({sql: t})(input)
    expect(results).toStrictEqual(expectedResult)
    await t.rollback()
  }

  describe('Should find product by multiple UPCs', function() {
    it('Should find product by UPC1', async function() {
      await test(ProductsInputSchema({upc: GOOD_UPC1, email: EMAIL}), [
        ProductSchema({
          vendor: {id: TEST_VENDOR_ID},
          itemNo: `${TEST_ITEM_NO} 1`,
          description: 'item 1',
          upc: [GOOD_UPC1],
        }),
      ])
    })

    it('Should find product by UPC2', async function() {
      await test(ProductsInputSchema({upc: GOOD_UPC2, email: EMAIL}), [
        ProductSchema({
          vendor: {id: TEST_VENDOR_ID},
          itemNo: `${TEST_ITEM_NO} 1`,
          description: 'item 1',
          upc: [GOOD_UPC1],
        }),
      ])
    })

    it('Should find product by UPC3', async function() {
      await test(ProductsInputSchema({upc: GOOD_UPC3, email: EMAIL}), [
        ProductSchema({
          vendor: {id: TEST_VENDOR_ID},
          itemNo: `${TEST_ITEM_NO} 1`,
          description: 'item 1',
          upc: [GOOD_UPC1],
        }),
        ProductSchema({
          vendor: {id: TEST_VENDOR_ID},
          itemNo: `${TEST_ITEM_NO} 2`,
          description: 'item 2',
          upc: [],
        }),
      ])
    })
  })
})
