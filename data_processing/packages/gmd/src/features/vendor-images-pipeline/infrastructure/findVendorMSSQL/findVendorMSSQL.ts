import {SQLRequestSource, SQLResponse} from "../../../../common/infrastructure/ports/MSSQLProvider";
import {FindVendor} from "../../domain/ports/FindVendor";
import {VendorMSSQLSchema} from "../VendorMSSQL";

export function findVendorMSSQL(dependencies: {
  sql: SQLRequestSource
}): FindVendor {
  const {sql} = dependencies

  return async function (input) {
    const results: SQLResponse = await sql
      .request()
      .input('displayName', input.displayName).query(`
      SELECT
        v.id ,
        v.displayName 
      FROM Vendor as v
      WHERE v.displayName = @displayName
    `)
    return results.records.map(VendorMSSQLSchema)
  }
}
