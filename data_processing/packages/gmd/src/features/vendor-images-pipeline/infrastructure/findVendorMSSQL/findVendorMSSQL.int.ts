import {
  createTableOfStructureMSSQL,
  testSQL,
} from '../../../../common/infrastructure/sql'
import {replaceWords} from '../../../../common/utils/replaceWords'
import {findVendorMSSQL} from "./findVendorMSSQL";
import {addFlavorToSQLRequestSource} from "../../../../common/infrastructure/sql/addFlavorToSQLRequestSource";
import {VendorInput, VendorInputSchema} from "../../domain/ports/FindVendor";

describe('findVendor', function () {
  it('Should return empty array', async () => {
    const expectedResults = expect.arrayContaining([])
    await test(expectedResults, [],
      VendorInputSchema({displayName: "Not existing Name"}))
  })
  it('Should return one vendor', async () => {
    const expectedResults = expect.arrayContaining([{"displayName": "TEMP_VENDOR_1", "id": 1}])
    await test(expectedResults, [
        '1, V1, TEMP_VENDOR_1, false, false',
      ],
      VendorInputSchema({displayName: "TEMP_VENDOR_1"})
    )
  })
  it('Should return two vendor', async () => {
    const expectedResults = expect.arrayContaining([
      {"displayName": "TEMP_VENDOR_1", "id": 1},
      {"displayName": "TEMP_VENDOR_1", "id": 2},
    ])
    await test(expectedResults, [
        '1, V1, TEMP_VENDOR_1, false, false',
        '2, V2, TEMP_VENDOR_1, false, false',
      ],
      VendorInputSchema({displayName: "TEMP_VENDOR_1"}))
  })

  async function test(
    expectedResults: jest.Expect, vendorsValues: Array<string>, vendorInput: VendorInput
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
      values: genValues(vendorsValues),
      identityInsert: true,
    }
    const createTablesQuery = `
        ${createTableOfStructureMSSQL('#Vendor', 'Vendor', vendors)}
        `
    await testSQL(async (sql) => {
      const setupTestEnvironment = (query: string) =>
        createTablesQuery +
        ' ' +
        replaceWords(
          {
            Vendor: '#Vendor',
          },
          query,
        )
      const f = findVendorMSSQL({
        sql: addFlavorToSQLRequestSource(setupTestEnvironment)(sql),
      })
      const results = await f(vendorInput)
      expect(results).toEqual(expectedResults)
    })
  }
})
