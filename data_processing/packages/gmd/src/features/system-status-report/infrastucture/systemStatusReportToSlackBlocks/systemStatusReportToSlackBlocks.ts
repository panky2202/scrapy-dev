import {
  VendorStatusReport,
  SystemStatusReport,
} from '../../domain/value-objects/SystemStatusReport'
import {SlackBlock} from '../slackProviderWebAPI'
import {formatDate} from '../../../../common/utils/formatDate'
import dayjs from 'dayjs'
import {PositiveNumber} from '../../../../common/domain/value-objects'
import {chunk} from 'lodash'

function footer(): SlackBlock[] {
  return [
    {
      type: 'divider',
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: "Let's automate the world :earth_asia:",
        },
      ],
    },
  ]
}

function header({
  reportStarted,
  reportEnded,
  environment,
  since,
}: SystemStatusReport): SlackBlock[] {
  const executionTimeInMinutes = dayjs(reportEnded).diff(
    reportStarted,
    'minutes',
  )

  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `System Status Report (${formatDate(reportEnded)})`,
        emoji: true,
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'plain_text',
          text: `Environment: ${environment.toLowerCase()}`,
          emoji: true,
        },
      ],
    },
    {
      type: 'context',
      elements: [
        {
          type: 'plain_text',
          text: `Since: ${formatDate(since)}`,
          emoji: true,
        },
      ],
    },
    {
      type: 'context',
      elements: [
        {
          type: 'plain_text',
          text: `Build time: ${executionTimeInMinutes} minutes`,
          emoji: true,
        },
      ],
    },
  ]
}

const formatPercent = (x: PositiveNumber) => `${(x * 100).toFixed(0)}%`

function vendorInfoToString({
  vendorName,
  parsingErrors,
  databaseItems: {total, withImagesPercent, withUPCPercent},
}: VendorStatusReport) {
  const errors = parsingErrors
    .map((x) => `${x.source}Errors=${x.totalErrors}`)
    .join(' | ')
  return `${vendorName} – Total=${total} | UPC=${formatPercent(
    withUPCPercent,
  )} | Images=${formatPercent(withImagesPercent)} | ${errors}`
}

function parsersInfo({
  title,
  parsers,
}: {
  title: string
  parsers: VendorStatusReport[]
}): SlackBlock[] {
  if (!parsers.length) {
    return []
  }

  const vendorSection = (vendors: VendorStatusReport[]): SlackBlock => ({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: vendors
        .map(vendorInfoToString)
        .map((x) => '- ' + x)
        .join('\n'),
    },
  })

  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: title,
        emoji: true,
      },
    },
    ...chunk(parsers, 25).map(vendorSection),
  ]
}

function emptyState(): SlackBlock[] {
  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'No results',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: "We haven't produced any results",
      },
    },
  ]
}

function error({title, text}: {title: string; text?: string}): SlackBlock[] {
  if (!text) {
    return []
  }

  return [
    {
      type: 'divider',
    },
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `:bangbang: ${title}`,
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text,
      },
    },
  ]
}

/*
We are rendering SystemStatusReport to SlackBlocks
SlackBlocks are a way to beautifully structure messages in Slack
You can play around with SlackBlocks in a block builder: https://app.slack.com/block-kit-builder
The builder allows to build SlackBlocks schema

If you want to check how this message will look in Slack, go to spec and run the tests
They will produce ./dist artifacts. Copy the systemStatusReport.json to the block builder
 */
export function systemStatusReportToSlackBlocks(
  report: SystemStatusReport,
): SlackBlock[] {
  const body = [
    ...parsersInfo({
      title: 'Parsers',
      parsers: report.vendors,
    }),
  ]

  return [
    ...header(report),
    ...(body.length ? body : emptyState()),
    ...error({title: 'Error', text: report.error}),
    ...footer(),
  ]
}
