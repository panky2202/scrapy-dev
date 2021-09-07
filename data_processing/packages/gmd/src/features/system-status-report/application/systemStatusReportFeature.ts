import {SlackProvider} from '../infrastucture/slackProviderWebAPI'
import {GlobalConfig} from '../../../common/application/globalConfig'
import {Logger} from '../../../common/domain/ports/Logger'
import {systemStatusReportToSlackBlocks} from '../infrastucture/systemStatusReportToSlackBlocks'
import {getScrapingStatusReportKQL} from '../infrastucture/getScrapingStatusReportKQL'
import {SystemStatusReportFilter} from '../domain/ports/GetSystemStatusReport'
import {getDatabaseStatusReportMSSQL} from '../infrastucture/databaseStatusReport'
import {MSSQLProvider} from '../../../common/infrastructure/ports/MSSQLProvider'
import {KQLProvider} from '../../../common/infrastructure/ports/KQLProvider'
import {getSystemStatusReport} from './getSystemStatusReport'

/*
This feature generates SystemStatusReport and sends it to basically everyone
Consider it is public
Refer to SystemStatusReport.ts for additional details
 */
export function systemStatusReportFeature({
  sqlWithBigTimeout,
  kqlRequest,
  slack,
  log,
}: {
  sqlWithBigTimeout: MSSQLProvider
  kqlRequest: KQLProvider
  slack: SlackProvider
  log: Logger
}) {
  const getReport = getSystemStatusReport({
    environment: GlobalConfig.env,
    getScrapingStatusReportData: getScrapingStatusReportKQL({kql: kqlRequest}),
    getDatabaseStatusReport: getDatabaseStatusReportMSSQL({
      sql: sqlWithBigTimeout,
    }),
  })

  return async function (filter: SystemStatusReportFilter) {
    const report = await getReport(filter)

    log(`---> report: ${JSON.stringify(report)}`)
    const blocks = systemStatusReportToSlackBlocks(report)
    log(`---> blocks: ${JSON.stringify(blocks)}`)

    await slack.postBlockMessage({
      channel: GlobalConfig.REPORTING.systemStatusReport.slackChannel,
      blocks,
    })
  }
}
