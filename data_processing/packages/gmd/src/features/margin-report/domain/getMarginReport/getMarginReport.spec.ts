import {getMarginReport} from './getMarginReport'
import {MarginReportItemSchema} from '../value-objects/MarginReport'
import {MarginOutliersFilter} from '../ports/GetMarginReport'
import {arraySchema} from '../../../../common/domain/schema'
import {
  DateTypeSchema,
  IntegerPositiveNumberSchema,
  NonEmptyStringSchema,
} from '../../../../common/domain/value-objects'

const itm = MarginReportItemSchema({
  Margin: 420.69,
  Description: 'Very. Huge. Condoms.',
  Bucket: 'HUGE_CONDOMS',
  ItemNumber: '69420',
  MarginStatus: 'Expansion',
  MarginQ1: 1,
  MarginQ2: 2,
  MarginQ3: 3,
  VendorName: 'BIGD',
  InvoiceDate: '2009-02-03 12:00:00Z',
  RetailPriceDate: '2009-03-03 12:00:00Z',
  InvoiceNumber: '123XXX',
  InvoiceCost: 123.12,
  RetailPrice: 999.99,
  CustomRetailPrice: 55,
  MasterRetailPrice: 66,
  StoreName: 'WALMART',
})

describe('getMarginReport', function () {
  it('Should work', async function () {
    const flt: MarginOutliersFilter = {
      count: IntegerPositiveNumberSchema(300),
      since: DateTypeSchema(new Date()),
    }

    const f = getMarginReport({
      sourceName: NonEmptyStringSchema('some.server.com'),
      getMarginOutliers: async (filter) => {
        expect(filter).toStrictEqual(flt)
        return arraySchema(MarginReportItemSchema)([itm, itm, itm])
      },
    })

    await expect(f(flt)).resolves.toStrictEqual(
      expect.objectContaining({
        resultsArePartial: false,
        items: [itm, itm, itm],
      }),
    )
  })

  it('Should display partial', async function () {
    const flt: MarginOutliersFilter = {
      count: IntegerPositiveNumberSchema(3),
      since: DateTypeSchema(new Date()),
    }

    const f = getMarginReport({
      sourceName: NonEmptyStringSchema('some.server.com'),
      getMarginOutliers: async () =>
        arraySchema(MarginReportItemSchema)([itm, itm, itm]),
    })

    await expect(f(flt)).resolves.toStrictEqual(
      expect.objectContaining({
        resultsArePartial: true,
        items: [itm, itm, itm],
      }),
    )
  })

  it('Should show error', async function () {
    const flt: MarginOutliersFilter = {
      count: IntegerPositiveNumberSchema(3),
      since: DateTypeSchema(new Date()),
    }

    const f = getMarginReport({
      sourceName: NonEmptyStringSchema('some.server.com'),
      getMarginOutliers: async () => {
        throw 'boom!'
      },
    })

    await expect(f(flt)).resolves.toStrictEqual(
      expect.objectContaining({
        error: expect.stringContaining('boom!'),
        resultsArePartial: false,
        items: [],
      }),
    )
  })
})
