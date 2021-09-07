import {systemStatusReportToSlackBlocks} from './systemStatusReportToSlackBlocks'
import {SystemStatusReportSchema} from '../../domain/value-objects/SystemStatusReport'
import {promises} from 'fs'
import {join} from 'path'

describe('systemStatusReportToSlackBlocks', function () {
  it('Should work', async function () {
    const results = systemStatusReportToSlackBlocks(
      SystemStatusReportSchema({
        error: 'Lol',
        since: '2000-10-15T00:00:00.000Z',
        reportStarted: '2021-10-15T00:00:00.000Z',
        reportEnded: '2022-10-15T00:00:00.000Z',
        environment: 'test',
        vendors: [
          {
            vendorName: 'random name',
            databaseItems: {
              withUPC: 12,
              total: 600,
              withImages: 333,
            },
            parsingErrors: [
              {source: 'pdf', totalErrors: 666},
              {source: 'jpeg', totalErrors: 1},
            ],
          },
          {
            vendorName: 'random name',
            databaseItems: {
              withUPC: 12,
              total: 600,
              withImages: 333,
            },
            parsingErrors: [
              {source: 'pdf', totalErrors: 666},
              {source: 'jpeg', totalErrors: 1},
            ],
          },
          {
            vendorName: 'random name',
            databaseItems: {
              withUPC: 12,
              total: 600,
              withImages: 333,
            },
            parsingErrors: [
              {source: 'pdf', totalErrors: 666},
              {source: 'jpeg', totalErrors: 1},
            ],
          },
        ],
      }),
    )

    expect(results.length).toBeGreaterThan(0)

    await promises.mkdir(join(__dirname, '/dist/'), {recursive: true})
    await promises.writeFile(
      join(__dirname, '/dist/systemStatusReport.json'),
      JSON.stringify({blocks: results}),
      {},
    )
  })
})
