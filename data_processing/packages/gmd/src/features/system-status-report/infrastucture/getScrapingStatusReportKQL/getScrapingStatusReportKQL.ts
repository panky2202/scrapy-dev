import {arraySchema} from '../../../../common/domain/schema'
import {SystemStatusReportFilter} from '../../domain/ports/GetSystemStatusReport'
import {KQLProvider} from '../../../../common/infrastructure/ports/KQLProvider'
import {
  GetScrapingStatusReportData,
  ParsingErrorWithVendor,
  ParsingErrorWithVendorSchema,
} from '../../application/ports/GetScrapingStatusReportData'

function summarizeErrors(data: ParsingErrorWithVendor[]) {
  const uniqueVendorIds = [...new Set(data.map((item) => item.vendorId))]
  return uniqueVendorIds.map((id) =>
    ParsingErrorWithVendorSchema({
      vendorId: id,
      errors: {
        source: 'spider',
        totalErrors: data.reduce(
          (sum, current) => sum + current.errors.totalErrors,
          0,
        ),
      },
    }),
  )
}

function parsingErrorsWithVendors(data: string): ParsingErrorWithVendor {
  const vendorIdSearch = data[0].match(/'vendor_id': (\d+),/)
  const totalErrorsSearch = data[0].match(/'log_count\/ERROR': (\d+),/)

  return ParsingErrorWithVendorSchema({
    vendorId: vendorIdSearch ? vendorIdSearch[1] : 0,
    errors: {
      source: 'spider',
      totalErrors: totalErrorsSearch ? totalErrorsSearch[1] : '0',
    },
  })
}

export function getScrapingStatusReportKQL(deps: {
  kql: KQLProvider
}): GetScrapingStatusReportData {
  const {kql} = deps
  return async function ({since}: SystemStatusReportFilter) {
    const results = await kql.request().query(
      `traces 
           | distinct message, timestamp
           | where timestamp > datetime(${since.toISOString()})
           | where message has "Dumping Scrapy stats" 
           | project message`,
    )

    const data = arraySchema(parsingErrorsWithVendors)(results.records)

    return summarizeErrors(data)
  }
}
