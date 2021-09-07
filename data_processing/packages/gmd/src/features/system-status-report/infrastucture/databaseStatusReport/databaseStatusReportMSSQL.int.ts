import {getDatabaseStatusReportMSSQL} from './databaseStatusReportMSSQL'
import {
  createTableOfStructureMSSQL,
  testSQL,
} from '../../../../common/infrastructure/sql'
import {replaceWords} from '../../../../common/utils/replaceWords'
import {addFlavorToSQLRequestSource} from '../../../../common/infrastructure/sql/addFlavorToSQLRequestSource'

describe('getDatabaseStatusReportMSSQL', function () {
  it('Should work with empty tables', async () => {
    const expectedResults = expect.arrayContaining([])
    await test(expectedResults, {})
  })
  it('Should work with Ultimate table', async () => {
    const expectedResults = expect.arrayContaining([
      expect.objectContaining({
        VendorId: 1,
        VendorName: 'TEMP_VENDOR_1',
        WithUPC: 4,
        WithImages: 3,
        Total: 4,
      }),
      expect.objectContaining({
        VendorId: 2,
        VendorName: 'TEMP_VENDOR_2',
        WithUPC: 2,
        WithImages: 2,
        Total: 4,
      }),
    ])
    await test(expectedResults, {_ultimate: true})
  })

  it('Should work with UPC table', async () => {
    const expectedResults = expect.arrayContaining([])
    await test(expectedResults, {_upc: true})
  })

  it('Should work with UPC and Ultimate table', async () => {
    const expectedResults = expect.arrayContaining([
      expect.objectContaining({
        VendorId: 1,
        VendorName: 'TEMP_VENDOR_1',
        WithUPC: 4,
        WithImages: 3,
        Total: 4,
      }),
      expect.objectContaining({
        VendorId: 2,
        VendorName: 'TEMP_VENDOR_2',
        WithUPC: 4,
        WithImages: 2,
        Total: 4,
      }),
    ])
    await test(expectedResults, {_upc: true, _ultimate: true})
  })

  async function test(
    expectedResults: jest.Expect,
    {_upc = false, _ultimate = false},
  ) {
    const genValues = (values: string[]) =>
      values.map((x) =>
        x
          .split(', ')
          .map((y) => `'${y}'`)
          .join(', '),
      )
    const vendors = {
      columns: 'Id, Name, DisplayName, UseDocParserAPI, IsPrime',
      values: genValues([
        '1, V1, TEMP_VENDOR_1, false, false',
        '2, V2, TEMP_VENDOR_2, false, false',
      ]),
      identityInsert: true,
    }
    const ultimate = {
      columns:
        'vendorId, ItemNumber, UpcNumber, ImageUrl, ModifiedOn, CreatedOn, CreatedBy, ModifiedBy',
      values: _ultimate
        ? genValues([
            '1, item_1, 321321321, https://www.gmd.com',
            '1, item_2, 321321321, https://www.gmd.com',
            '1, item_3, 321321321, NULL',
            '1, item_4, 321321321, https://www.gmd.com',
            '2, item_1, NULL, https://www.gmd.com',
            '2, item_2, 321321321, NULL',
            '2, item_3, NULL, https://www.gmd.com',
            '2, item_4, 321321321, NULL',
          ]).map((x) => x + `, '2021-10-10', '2021-10-10', 0, 0`)
        : [],
    }
    const upc = {
      columns: 'vendorId, itemNo, upc',
      values: _upc
        ? genValues([
            '1, item_1, 123123123',
            '1, item_1, 123123124',
            '1, item_1, 123123125',
            '1, item_4, 123123123',
            '1, item_5, 999999999',
            '2, item_1, 123123123',
            '2, item_2, 123123124',
            '2, item_3, 123123125',
            '2, item_4, 123123126',
            '2, item_5, NULL',
          ])
        : [],
    }
    const createTablesQuery = `
        ${createTableOfStructureMSSQL('#Vendor', 'Vendor', vendors)}
        ${createTableOfStructureMSSQL('#Ultimate', 'Ultimate', ultimate)}
        ${createTableOfStructureMSSQL('#UPC', 'UPC', upc)}
        `
    await testSQL(async (sql) => {
      const setupTestEnvironment = (query: string) =>
        createTablesQuery +
        ' ' +
        replaceWords(
          {
            Vendor: '#Vendor',
            Ultimate: '#Ultimate',
            UPC: '#UPC',
          },
          query,
        )

      const f = getDatabaseStatusReportMSSQL({
        sql: addFlavorToSQLRequestSource(setupTestEnvironment)(sql),
      })

      const results = await f()
      expect(results).toEqual(expectedResults)
    })
  }
})
