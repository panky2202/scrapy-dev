import {mssqlProviderConnectedToAzure} from '../../../../common/infrastructure/sql'
import {MissingProductMSSQLSchema} from './MissingProductMSSQL'
import {MSSQLProvider} from '../../../../common/infrastructure/ports/MSSQLProvider'
import {addMissingProductMSSQL} from './addMissingProductMSSQL'
import {AddMissingProductResolvedImagesInputSchema} from '../../application/addMissingProduct/ports/AddMissingProductResolvedImages'

describe('insertMissingProductsMSSQL', function () {
  let sql: MSSQLProvider

  beforeAll(async function () {
    sql = await mssqlProviderConnectedToAzure()
  }, 180000)

  afterAll(async function () {
    if (sql) await sql.close()
  })

  async function test(inputComments: string, outputComments?: string) {
    const input = AddMissingProductResolvedImagesInputSchema({
      upc: '123456789',
      comment: inputComments,
      email: 'charaf@gmail.com',
      photoFront: 'https://example.com',
      photoUpc: 'https://example2.com',
      photoBack: 'https://example3.com',
    })

    const expectedResults = MissingProductMSSQLSchema({
      UPC: '123456789',
      Email: 'charaf@gmail.com',
      Comments: outputComments,
    })

    const t = sql.transaction()
    await t.begin()
    await addMissingProductMSSQL({sql: t})(input)
    const results = await t
      .request()
      .query(
        `SELECT UPC, Email, Comments FROM MissingProducts WHERE UPC = '${input.upc}'`,
      )
    expect(results.records.map(MissingProductMSSQLSchema)).toContainEqual(
      expectedResults,
    )
    await t.rollback()
  }

  it('Should work with comments', async function () {
    await test('sample test', 'sample test')
  })

  it('Should work without comments', async function () {
    await test('', undefined)
  })
})
