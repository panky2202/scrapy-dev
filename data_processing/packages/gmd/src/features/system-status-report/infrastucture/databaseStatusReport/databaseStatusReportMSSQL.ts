import {arraySchema} from '../../../../common/domain/schema'
import {SQLRequestSource} from '../../../../common/infrastructure/ports/MSSQLProvider'
import {
  GetDatabaseStatusReport,
  VendorDatabaseItemsSchema,
} from '../../application/ports/GetDatabaseStatusReport'

function selectWithImages({vendorId}: {vendorId: string}) {
  return `
  SELECT COUNT(*)
  FROM Ultimate U2
  WHERE U2.VendorId = ${vendorId}
    AND U2.ImageUrl <> ''
    AND U2.ImageUrl IS NOT NULL
    AND U2.ImageUrl != 'NULL'
  `
}

function selectWithUPC({vendorId}: {vendorId: string}) {
  return `
  SELECT COUNT(*)
  FROM Ultimate U2
  WHERE U2.VendorId = ${vendorId}
    AND (
              ISNUMERIC(U2.UpcNumber) = 1
          OR
              EXISTS(SELECT *
                     FROM dbo.UPC
                     WHERE UPC.itemNo = U2.ItemNumber
                       AND UPC.vendorId = U2.VendorId
                       AND ISNUMERIC(UPC.upc) = 1)
      )
  `
}

export function getDatabaseStatusReportMSSQL(dependencies: {
  sql: SQLRequestSource
}): GetDatabaseStatusReport {
  const {sql} = dependencies
  return async function () {
    const results = await sql.request().query(
      `
        SELECT U.VendorId,
               (SELECT TOP 1 DisplayName FROM Vendor WHERE Vendor.Id = U.VendorId) VendorName,
               COUNT(*) Total,
               (${selectWithImages({vendorId: 'U.VendorId'})}) WithImages,
               (${selectWithUPC({vendorId: 'U.VendorId'})}) WithUPC
        FROM Ultimate U
        GROUP BY U.VendorId
      `,
    )
    return arraySchema(VendorDatabaseItemsSchema)(results.records)
  }
}
