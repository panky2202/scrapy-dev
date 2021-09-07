import {arraySchema} from '../../../../common/domain/schema'
import {NonEmptyStringSchema} from '../../../../common/domain/value-objects'
import {
  CostChangeEventSchema,
  MAX_COST_CHANGE_EVENTS_IN_REPORT,
} from '../value-objects/CostChangeReport'
import {getCostChangeReport} from './getCostChangeReport'

const itm = CostChangeEventSchema({
  PreviousInvoiceCost: 22,
  Description: 'Very. Huge. Condoms.',
  Bucket: 'HUGE_CONDOMS',
  ItemNumber: '69420',
  VendorName: 'BIGD',
  InvoiceDate: '2009-02-03 12:00:00Z',
  InvoiceNumber: '123XXX',
  InvoiceCost: 123.12,
  StoreName: 'WALMART',
})

describe('getCostChangeReport', function () {
  it('Should work', async function () {
    const f = getCostChangeReport({
      sourceName: NonEmptyStringSchema('some.server.com'),
      getCostChangeEvents: async () => {
        return arraySchema(CostChangeEventSchema)([itm, itm, itm])
      },
    })

    await expect(f()).resolves.toStrictEqual(
      expect.objectContaining({
        resultsArePartial: false,
        items: [itm, itm, itm],
      }),
    )
  })

  it('Should display partial', async function () {
    const data = Array(MAX_COST_CHANGE_EVENTS_IN_REPORT).fill(itm)
    const f = getCostChangeReport({
      sourceName: NonEmptyStringSchema('some.server.com'),
      getCostChangeEvents: async () => arraySchema(CostChangeEventSchema)(data),
    })

    await expect(f()).resolves.toStrictEqual(
      expect.objectContaining({
        resultsArePartial: true,
        items: data,
      }),
    )
  })

  it('Should show error', async function () {
    const f = getCostChangeReport({
      sourceName: NonEmptyStringSchema('some.server.com'),
      getCostChangeEvents: async () => {
        const badEvent = CostChangeEventSchema({
          PreviousInvoiceCost: 1.0,
          InvoiceCost: 1.0,
          Bucket: 'bucket',
          VendorName: 'vendor 1',
          InvoiceDate: new Date(),
          Description: 'something',
          InvoiceNumber: '123',
          ItemNumber: 'item 1',
          StoreName: 'store',
        })
        return [badEvent]
      },
    })

    await expect(f()).resolves.toStrictEqual(
      expect.objectContaining({
        error: expect.stringContaining('This is not a cost change event'),
        resultsArePartial: false,
        items: [],
      }),
    )
  })
})
