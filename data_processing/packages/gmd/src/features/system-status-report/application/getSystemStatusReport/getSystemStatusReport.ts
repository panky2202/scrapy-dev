import {
  SystemStatusReport,
  SystemStatusReportSchema,
  VendorStatusReport,
  VendorStatusReportSchema,
} from '../../domain/value-objects/SystemStatusReport'
import {GetSystemStatusReport} from '../../domain/ports/GetSystemStatusReport'
import {
  GetScrapingStatusReportData,
  ParsingErrorWithVendor,
} from '../ports/GetScrapingStatusReportData'
import {
  GetDatabaseStatusReport,
  VendorDatabaseItems,
  VendorDatabaseItemsSchema,
} from '../ports/GetDatabaseStatusReport'

function joinReportData(
  scrapingData: ParsingErrorWithVendor[],
  databaseData: VendorDatabaseItems[],
): VendorStatusReport[] {
  if (scrapingData.find((item) => item.vendorId === 0)) {
    databaseData.push(
      VendorDatabaseItemsSchema({
        Total: 0,
        VendorId: 0,
        VendorName: 'Unknown',
        WithUPC: 0,
        WithImages: 0,
      }),
    )
  }
  return databaseData.map((databaseStatus) => {
    return VendorStatusReportSchema({
      vendorName: databaseStatus.VendorName,
      parsingErrors: scrapingData
        .filter((x) => x.vendorId === databaseStatus.VendorId)
        .map((item) => item.errors),
      databaseItems: {
        withUPC: databaseStatus.WithUPC,
        withImages: databaseStatus.WithImages,
        total: databaseStatus.Total,
      },
    })
  })
}

export function getSystemStatusReport(deps: {
  environment: SystemStatusReport['environment']
  getScrapingStatusReportData: GetScrapingStatusReportData
  getDatabaseStatusReport: GetDatabaseStatusReport
}): GetSystemStatusReport {
  const {environment, getScrapingStatusReportData, getDatabaseStatusReport} =
    deps
  return async function (filter) {
    const reportStarted = new Date()
    try {
      const databaseItems = await getDatabaseStatusReport()
      const scrapingData = await getScrapingStatusReportData(filter)

      const vendors = joinReportData(scrapingData, databaseItems)

      return SystemStatusReportSchema({
        since: filter.since,
        environment: environment,
        reportStarted: reportStarted,
        reportEnded: new Date(),
        vendors,
      })
    } catch (e) {
      return SystemStatusReportSchema({
        since: filter.since,
        reportStarted,
        reportEnded: new Date(),
        error: e,
        environment: environment,
        vendors: [],
      })
    }
  }
}
