const selectPreviousInvoicePrice = (params: {
  vendorId: string
  itemNumber: string
  invoiceDate: string
  invoiceId: string
}) => `
        SELECT TOP 1 
            Cost
        FROM Item ItPrev
            INNER JOIN Invoice IPrev ON IPrev.ID = ItPrev.InvoiceID
        WHERE ItPrev.VendorId = ${params.vendorId}
          AND ItPrev.ItemNumber = ${params.itemNumber}
          AND IPrev.InvoiceDate <= ${params.invoiceDate}
          AND IPrev.ID < ${params.invoiceId}
        ORDER BY IPrev.InvoiceDate DESC, IPrev.ID DESC
  `

/*
 * Cost Change Events Report
 *
 * @param resultsTableName We will CREATE a new table with such name, and output results there.
 * If it exists we will OVERWRITE it.
 *
 * We want to know, what invoices bought items by new price
 * Eg, what invoices have price different, from a prev such invoice
 */
export function selectCostChangeEventsSQL(resultsTableName: string) {
  const previousInvoicePrice =
    '(' +
    selectPreviousInvoicePrice({
      vendorId: 'It.VendorId',
      itemNumber: 'It.ItemNumber',
      invoiceDate: 'I.InvoiceDate',
      invoiceId: 'I.ID',
    }) +
    ')'

  return `
    DROP TABLE IF EXISTS ${resultsTableName};
    SELECT It.ID ItemID,
           I.InvoiceDate,
           InvoiceId,
           I.InvoiceNumber,
           U.Bucket,
           Vendor.DisplayName      VendorName,
           It.ItemNumber,
           Store.StoreName,
           It.Description,
           ${previousInvoicePrice} PreviousInvoiceCost,
           It.Cost                 InvoiceCost
    INTO ${resultsTableName}
    FROM Item It
             INNER JOIN Invoice I ON I.ID = It.InvoiceID
             INNER JOIN Vendor ON Vendor.Id = It.VendorId
             INNER JOIN Store ON Store.ID = I.StoreID
             LEFT JOIN Ultimate U ON U.VendorId = It.VendorId AND U.ItemNumber = It.ItemNumber
    WHERE It.Cost IS NOT NULL 
      AND ${previousInvoicePrice} IS NOT NULL 
      AND ABS(${previousInvoicePrice} - It.Cost) >= 0.01 
    ORDER BY I.InvoiceDate DESC, I.ID DESC;
  `
}
