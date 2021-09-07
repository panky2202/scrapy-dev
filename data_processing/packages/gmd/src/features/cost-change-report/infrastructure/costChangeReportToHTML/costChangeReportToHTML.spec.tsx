import {promises} from 'fs'
import {join} from 'path'
import {costChangeReportToHTML} from './costChangeReportToHTML'
import {CostChangeReportSchema} from '../../domain/value-objects/CostChangeReport'

describe('costChangeReportToHTML', function () {
  it('Should render', async function () {
    const html = costChangeReportToHTML(
      CostChangeReportSchema({
        sourceName: 'soma.database.com',
        reportStarted: '2021-10-15T00:00:00.000Z',
        reportEnded: '2022-10-15T00:00:00.000Z',
        error: 'Oh, no!!!',
        resultsArePartial: true,
        items: [
          {
            PreviousInvoiceCost: 222,
            Description: 'Very. Huge. Condoms.',
            Bucket: 'HUGE_CONDOMS',
            ItemNumber: '69420',
            VendorName: 'BIGD',
            InvoiceDate: '2022-10-15T00:00:00.000Z',
            InvoiceNumber: '123XXX',
            InvoiceCost: 123.12,
            StoreName: 'WALMART',
          },
          {
            PreviousInvoiceCost: 222,
            ItemNumber: '69420',
            InvoiceDate: '2022-10-15T00:00:00.000Z',
            InvoiceNumber: '123XXX',
            InvoiceCost: 123.12,
          },
          {
            PreviousInvoiceCost: 222,
            ItemNumber: '69420',
            InvoiceDate: '2022-10-15T00:00:00.000Z',
            InvoiceNumber: '123XXX',
            InvoiceCost: 123.12,
          },
        ],
      }),
    )

    expect(html).toBeTruthy()

    await promises.mkdir(join(__dirname, '/dist/'), {recursive: true})
    await promises.writeFile(
      join(__dirname, '/dist/costChangeReportExample.html'),
      html,
      {},
    )
  })

  it('Should render normal report', async function () {
    const html = costChangeReportToHTML(
      CostChangeReportSchema({
        sourceName: 'soma.database.com',
        reportStarted: '2021-10-15T00:00:00.000Z',
        reportEnded: '2022-10-15T00:00:00.000Z',
        resultsArePartial: false,
        items: [
          {
            PreviousInvoiceCost: 222,
            Description: 'Very. Huge. Condoms.',
            Bucket: 'HUGE_CONDOMS',
            ItemNumber: '69420',
            VendorName: 'BIGD',
            InvoiceDate: '2022-10-15T00:00:00.000Z',
            InvoiceNumber: '123XXX',
            InvoiceCost: 123.12,
            StoreName: 'WALMART',
          },
          {
            PreviousInvoiceCost: 222,
            ItemNumber: '69420',
            InvoiceDate: '2022-10-15T00:00:00.000Z',
            InvoiceNumber: '123XXX',
            InvoiceCost: 123.12,
          },
          {
            PreviousInvoiceCost: 222,
            ItemNumber: '69420',
            InvoiceDate: '2022-10-15T00:00:00.000Z',
            InvoiceNumber: '123XXX',
            InvoiceCost: 123.12,
          },
        ],
      }),
    )

    expect(html).toBeTruthy()

    await promises.mkdir(join(__dirname, '/dist/'), {recursive: true})
    await promises.writeFile(
      join(__dirname, '/dist/costChangeReportExampleNormal.html'),
      html,
      {},
    )
  })

  it('Should render empty report', async function () {
    const html = costChangeReportToHTML(
      CostChangeReportSchema({
        sourceName: 'soma.database.com',
        reportStarted: '2021-10-15T00:00:00.000Z',
        reportEnded: '2022-10-15T00:00:00.000Z',
        resultsArePartial: false,
        items: [],
      }),
    )

    expect(html).toBeTruthy()

    await promises.mkdir(join(__dirname, '/dist/'), {recursive: true})
    await promises.writeFile(
      join(__dirname, '/dist/emptyCostChangeReportExample.html'),
      html,
      {},
    )
  })
})
