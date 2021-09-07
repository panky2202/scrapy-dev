import {mssqlProviderConnectedToAzure} from './mssqlProviderConnectedToAzure'
import {SQLRequestSource} from '../ports/MSSQLProvider'
import {addFlavorToSQLRequestSource} from './addFlavorToSQLRequestSource'

export async function testSQL(f: (sql: SQLRequestSource) => Promise<unknown>) {
  const sql = await mssqlProviderConnectedToAzure()
  try {
    const t = sql.transaction()
    try {
      await t.begin()
      await f(
        addFlavorToSQLRequestSource((sql) => {
          console.log('Testing SQL', sql)
          return sql
        })(t),
      )
    } finally {
      await t.rollback()
    }
  } finally {
    if (sql) {
      await sql.close()
    }
  }
}
