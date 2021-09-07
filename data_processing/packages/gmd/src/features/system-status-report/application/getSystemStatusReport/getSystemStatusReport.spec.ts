import {DateTypeSchema} from '../../../../common/domain/value-objects'
import {
  ParsingErrorWithVendor,
  ParsingErrorWithVendorSchema,
} from '../ports/GetScrapingStatusReportData'
import {arraySchema} from '../../../../common/domain/schema'
import {
  VendorDatabaseItems,
  VendorDatabaseItemsSchema,
} from '../ports/GetDatabaseStatusReport'
import {getSystemStatusReport} from './getSystemStatusReport'
import {VendorStatusReportSchema} from '../../domain/value-objects/SystemStatusReport'

describe('getSystemStatusReport', function () {
  it('Should work', async function () {
    const getDatabaseStatusReport = jest
      .fn()
      .mockImplementation((): VendorDatabaseItems[] => {
        return arraySchema(VendorDatabaseItemsSchema)([
          {
            VendorId: 2,
            WithUPC: 6,
            WithImages: 6,
            Total: 10,
            VendorName: 'name #2',
          },
          {
            VendorId: 1,
            WithUPC: 10,
            WithImages: 0,
            Total: 11,
            VendorName: 'name #1',
          },
        ])
      })
    const getScrapingStatusReportData = jest
      .fn()
      .mockImplementation((): ParsingErrorWithVendor[] => {
        return arraySchema(ParsingErrorWithVendorSchema)([
          {
            vendorId: 1,
            errors: {
              source: 'pdf',
              totalErrors: 11,
            },
          },
          {
            vendorId: 3,
            errors: {
              source: 'images',
              totalErrors: 0,
            },
          },
          {
            vendorId: 0,
            errors: {
              source: 'spider',
              totalErrors: 10,
            },
          },
        ])
      })

    const f = getSystemStatusReport({
      environment: 'test',
      getDatabaseStatusReport,
      getScrapingStatusReportData,
    })

    const since = DateTypeSchema(new Date())

    const results = await f({since})

    const vendors = arraySchema(VendorStatusReportSchema)([
      {
        vendorName: 'All Vendors',
        databaseItems: {
          total: 21,
          withUPC: 16,
          withImages: 6,
        },
        parsingErrors: [],
      },
      {
        vendorName: 'name #1',
        databaseItems: {
          total: 11,
          withUPC: 10,
          withImages: 0,
        },
        parsingErrors: [
          {
            source: 'pdf',
            totalErrors: 11,
          },
        ],
      },
      {
        vendorName: 'name #2',
        databaseItems: {
          total: 10,
          withUPC: 6,
          withImages: 6,
        },
        parsingErrors: [],
      },
      {
        vendorName: 'Unknown',
        databaseItems: {
          total: 0,
          withUPC: 0,
          withImages: 0,
        },
        parsingErrors: [
          {
            source: 'spider',
            totalErrors: 10,
          },
        ],
      },
    ])

    expect(results).toStrictEqual(
      expect.objectContaining({
        since,
        environment: 'test',
        vendors,
      }),
    )
  })
})
