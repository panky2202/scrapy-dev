function readEnv(): 'production' | 'development' | 'test' {
  const env = process.env.NODE_ENV
  if (env === 'production' || env === 'development' || env === 'test') {
    return env
  }
  throw `Unknown NODE_ENV ${env}`
}

export const GlobalConfig = {
  env: readEnv(),
  KQL: {
    baseURL: process.env.KQL_BASE_URL,
    headers: {'X-API-Key': process.env.KQL_API_KEY},
  },
  SQL: {
    server: process.env.SQL_SERVER,
    port: Number(process.env.SQL_PORT),
    database: process.env.SQL_DATABASE,
    userName: process.env.SQL_USERNAME,
    password: process.env.SQL_PASSWORD,
  },
  AZURE_STORAGE: {
    connectionString: process.env.AZURE_STORAGE_ACCOUNT ?? '',
    imagesBlob: process.env.IMAGES_HOST ?? '',
  },
  REPORTING: {
    marginReport: {
      reportItemsCount: process.env.REPORTING_MARGIN_ITEMS_COUNT ?? '100',
      sinceInDays: process.env.REPORTING_MARGIN_SINCE_IN_DAYS ?? '3650',
    },
    systemStatusReport: {
      slackChannel: process.env.REPORTING_SYSTEM_SLACK_CHANNEL ?? '',
      sinceInDays: process.env.REPORTING_MARGIN_SINCE_IN_DAYS ?? '1',
    },
    fromEmail: process.env.REPORTING_FROM_EMAIL ?? 'reporting@gmdstoresinc.com',
    toEmailsCommaSeparated:
      process.env.REPORTING_TO_EMAILS_COMMA_SEPARATED ?? 'cirnotoss@gmail.com',
    emailKey: process.env.REPORTING_EMAIL_KEY ?? '',
    slackToken: process.env.SLACK_TOKEN ?? '',
  },
}
