import {GlobalConfig} from '../../application/globalConfig'
import {mssqlProviderNode} from '../mssqlProviderNode'

export async function mssqlProviderConnectedToAzure() {
  const sql = mssqlProviderNode({
    user: GlobalConfig.SQL.userName,
    password: GlobalConfig.SQL.password,
    server: GlobalConfig.SQL.server ?? '',
    port: GlobalConfig.SQL.port,
    database: GlobalConfig.SQL.database,
    requestTimeout: 2 * 60 * 1000
  })

  await sql.connect()
  return sql
}
