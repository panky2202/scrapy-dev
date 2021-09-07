import {marginReportToHTML} from './marginReportToHTML'
import {promises} from 'fs'
import {join} from 'path'
import {MarginReportSchema} from '../../domain/value-objects/MarginReport'

describe('marginReportToHTML', function () {
  it('Should render', async function () {
    const html = marginReportToHTML(
      MarginReportSchema({
        sourceName: 'soma.database.com',
        since: '2022-10-15T00:00:00.000Z',
        reportStarted: '2021-10-15T00:00:00.000Z',
        reportEnded: '2022-10-15T00:00:00.000Z',
        error: 'Oh, no!!!',
        resultsArePartial: true,
        items: [
          {
            Margin: 420.69,
            Description: 'Very. Huge. Condoms.',
            Bucket: 'HUGE_CONDOMS',
            ItemNumber: '69420',
            MarginStatus: 'Expansion',
            MarginQ1: 1,
            MarginQ2: 2,
            MarginQ3: 3,
            VendorName: 'BIGD',
            InvoiceDate: '2022-10-15T00:00:00.000Z',
            RetailPriceDate: '2022-10-11T00:00:00.000Z',
            InvoiceNumber: '123XXX',
            InvoiceCost: 123.12,
            RetailPrice: 999.99,
            CustomRetailPrice: 16,
            MasterRetailPrice: 8,
            StoreName: 'WALMART',
          },
          {
            Margin: 420.69,
            ItemNumber: '69420',
            MarginStatus: 'Compression',
            MarginQ1: 1,
            MarginQ2: 2,
            MarginQ3: 3,
            InvoiceDate: '2022-10-15T00:00:00.000Z',
            RetailPriceDate: '2022-10-11T00:00:00.000Z',
            InvoiceNumber: '123XXX',
            InvoiceCost: 123.12,
            RetailPrice: 999.99,
            CustomRetailPrice: 16,
            MasterRetailPrice: 8,
          },
          {
            Margin: 420.69,
            ItemNumber: '69420',
            MarginStatus: 'Compression',
            MarginQ1: 1,
            MarginQ2: 2,
            MarginQ3: 3,
            InvoiceDate: '2022-10-15T00:00:00.000Z',
            RetailPriceDate: '2022-10-11T00:00:00.000Z',
            InvoiceNumber: '123XXX',
            InvoiceCost: 123.12,
            RetailPrice: 999.99,
            MasterRetailPrice: 8,
          },
        ],
      }),
    )

    expect(html).toBeTruthy()

    await promises.mkdir(join(__dirname, '/dist/'), {recursive: true})
    await promises.writeFile(
      join(__dirname, '/dist/marginReportExample.html'),
      html,
      {},
    )
  })

  it('Should render empty report', async function () {
    const html = marginReportToHTML(
      MarginReportSchema({
        sourceName: 'soma.database.com',
        since: '2022-10-15T00:00:00.000Z',
        reportStarted: '2021-10-15T00:00:00.000Z',
        reportEnded: '2022-10-15T00:00:00.000Z',
        resultsArePartial: false,
        items: [],
      }),
    )

    expect(html).toBeTruthy()

    await promises.mkdir(join(__dirname, '/dist/'), {recursive: true})
    await promises.writeFile(
      join(__dirname, '/dist/emptyMarginReportExample.html'),
      html,
      {},
    )
  })
})
