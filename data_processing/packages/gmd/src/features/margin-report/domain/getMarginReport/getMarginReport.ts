import {GetMarginReport, MarginOutliersFilter} from '../ports/GetMarginReport'
import {
  MarginReportItem,
  MarginReportSchema,
} from '../value-objects/MarginReport'
import {NonEmptyString} from '../../../../common/domain/value-objects'
import {formatException} from '../../../../common/utils/formatException'

export function getMarginReport(deps: {
  sourceName: NonEmptyString
  getMarginOutliers: (
    filter: MarginOutliersFilter,
  ) => Promise<MarginReportItem[]>
}): GetMarginReport {
  const {sourceName, getMarginOutliers} = deps
  return async function (filter) {
    const reportStarted = new Date()
    try {
      const items = await getMarginOutliers(filter)
      return MarginReportSchema({
        since: filter.since,
        sourceName,
        reportStarted,
        reportEnded: new Date(),
        resultsArePartial: items.length >= filter.count,
        items,
      })
    } catch (e) {
      return MarginReportSchema({
        since: filter.since,
        sourceName,
        reportStarted,
        reportEnded: new Date(),
        items: [],
        resultsArePartial: false,
        error: formatException(e),
      })
    }
  }
}
