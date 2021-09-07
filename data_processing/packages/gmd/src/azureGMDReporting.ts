/*
This feature periodically called as a background job
It generates reports and sends them to stakeholders

Composition Root
This file is a composition root of our reporting app, we create all dependencies here.
This app will periodically fire and build reports for business.
*/

import {AzureFunction, Context} from '@azure/functions'
import {GlobalConfig} from './common/application/globalConfig'
import {mssqlProviderNode} from './common/infrastructure/mssqlProviderNode'
import {hoursToMS} from './common/utils/hoursToMS'
import {costChangeReportFeature} from './features/cost-change-report/application/costChangeReportFeature'
import {sendMailAzure} from './common/infrastructure/sendMailAzure'
import {systemStatusReportFeature} from './features/system-status-report/application/systemStatusReportFeature'
import {SystemStatusReportFilterSchema} from './features/system-status-report/domain/ports/GetSystemStatusReport'
import {numberSchema} from './common/domain/schema'
import dayjs from 'dayjs'
import {slackProviderWebAPI} from './features/system-status-report/infrastucture/slackProviderWebAPI'
import {kqlProviderNode} from './common/infrastructure/kqlProviderNode'

const sqlWithBigTimeout = mssqlProviderNode({
  user: GlobalConfig.SQL.userName,
  password: GlobalConfig.SQL.password,
  server: GlobalConfig.SQL.server ?? '',
  port: GlobalConfig.SQL.port,
  database: GlobalConfig.SQL.database,
  requestTimeout: hoursToMS(4), // need a big timeout, reports can take hours to build
})
const sendMail = sendMailAzure(GlobalConfig.REPORTING.emailKey)
const slack = slackProviderWebAPI({
  token: GlobalConfig.REPORTING.slackToken,
})
const kqlRequest = kqlProviderNode({
  baseURL: GlobalConfig.KQL.baseURL,
  headers: GlobalConfig.KQL.headers,
  timeout: hoursToMS(1),
})

// Temporary disabled
// const marginReport = marginReportFeature({sendMail, sqlWithBigTimeout})
const costChangeReport = costChangeReportFeature({sendMail, sqlWithBigTimeout})

export const azureGMDReporting: AzureFunction = async (context: Context) => {
  const systemStatusReport = systemStatusReportFeature({
    sqlWithBigTimeout,
    slack,
    kqlRequest,
    log: context.log,
  })

  const onError = (x: any) => context.log('--->', x)

  await Promise.all([
    /*
    Temporary disabled
    Paul told, that there is an error in the MarginReport logic
    Will fix later, he needs CostChangeReport before

    await marginReport(
      MarginOutliersFilterSchema({
        since: dayjs()
          .subtract(
            numberSchema(GlobalConfig.REPORTING.marginReport.sinceInDays),
            'days',
          )
          .toDate(),
        count: GlobalConfig.REPORTING.marginReport.reportItemsCount,
      }),
    ).catch(context.log),
    */

    await systemStatusReport(
      SystemStatusReportFilterSchema({
        since: dayjs()
          .subtract(
            numberSchema(GlobalConfig.REPORTING.marginReport.sinceInDays),
            'days',
          )
          .toDate(),
      }),
    ).catch(onError),

    await costChangeReport().catch(onError),
  ])
}
