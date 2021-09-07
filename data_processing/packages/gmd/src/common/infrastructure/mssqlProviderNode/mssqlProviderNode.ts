import {MSSQLProvider, SQLRequest, SQLTransaction} from '../ports/MSSQLProvider'
import {mapValues, pickBy, flatten} from 'lodash'
import sql, {config, ConnectionPool, Request} from 'mssql'

function replaceNullsWithUndefineds(obj: object) {
  return pickBy(
    mapValues(obj, (value) => (value === null ? undefined : value)),
    (value) => value !== undefined,
  )
}

function guessSqlType(value: number | string) {
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return sql.Int
    }
    return sql.Decimal(19, 4)
  }
  return sql.VarChar()
}

//

function request(pool: ConnectionPool, r: Request): SQLRequest {
  return {
    input: (name, value) => {
      return request(pool, r.input(name, guessSqlType(value), value))
    },
    query: async (sql) => {
      await pool.connect()
      const result = await r.query(sql)
      return {
        records: flatten(result.recordsets).map(replaceNullsWithUndefineds),
      }
    },
    bulkInsert: async (tableName, shape, records) => {
      if (records.length === 0) {
        return {
          rowsAffected: 0,
        }
      }
      await pool.connect()
      const table = new sql.Table(tableName)
      table.create = true
      shape.forEach(({name, type, nullable}) =>
        table.columns.add(
          name,
          type === 'integer'
            ? sql.Int
            : type === 'number'
            ? sql.Decimal(19, 4)
            : sql.VarChar(sql.MAX),
          {nullable},
        ),
      )
      records.forEach((record) => table.rows.add(...record))

      return await r.bulk(table)
    },
  }
}

function transaction(pool: ConnectionPool, name: string): SQLTransaction {
  const t = pool.transaction()
  return {
    name: () => name,
    begin: async () => {
      await pool.connect()
      await t.begin()
    },
    commit: () => t.commit(),
    rollback: () => t.rollback(),
    request: () => request(pool, t.request()),
  }
}

export const mssqlProviderNode = (config: config): MSSQLProvider => {
  const pool = new sql.ConnectionPool({
    ...config,
    ...{
      options: {
        encrypt: true,
        enableArithAbort: true,
      },
    },
  })

  pool.on('error', (e) => {
    console.error(`MSSQL database error: ${e}`)
  })

  return {
    name: () => config.server,
    transaction: () => transaction(pool, config.server),
    request: () => request(pool, pool.request()),
    connect: async () => {
      await pool.connect()
    },
    close: async () => pool.close(),
  }
}
