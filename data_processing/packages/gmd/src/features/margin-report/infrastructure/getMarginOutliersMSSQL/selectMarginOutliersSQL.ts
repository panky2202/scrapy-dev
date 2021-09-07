function resolveRetailPrice(table: string) {
  /*
I think the table function is faster than other methods. Haven't checked tho
 */
  return `
  COALESCE(
     CASE ${table}.RetailSellingUnit
         WHEN '1 FOR 1' THEN 1.00
         WHEN '2 FOR 1' THEN 0.50
         WHEN '3 FOR 1' THEN 0.33
         WHEN '4 FOR 1' THEN 0.25
         WHEN '5 FOR 1' THEN 0.20
         WHEN '6 FOR 1' THEN 0.16
         WHEN '7 FOR 1' THEN 0.14
         WHEN '8 FOR 1' THEN 0.12
         WHEN '9 FOR 1' THEN 0.11
         WHEN '10 FOR 1' THEN 0.10
         WHEN '' THEN NULL
         WHEN NULL THEN NULL
         END,
     NULLIF(${table}.MstrRetailPrice, 0)
 ) 
 `
}

function Ultimate() {
  /*
Need to consider that special OFIVE case.
When Discount is 3, then we are reselling the item, thus, vendor id is OFIVE's vendor id
 */
  return `
  (SELECT (IIF(Discont = 3, 1145, VendorId)) AS VendorId,
             ItemNumber,
             Id,
             MstrRetailPrice,
             RetailSellingUnit,
             ModifiedOn,
             Discont,
             Bucket,
             Description
      FROM Ultimate)
  `
}

function UltimateLogging() {
  /*
Need to consider that special OFIVE case.
When Discount is 3, then we are reselling the item, thus, vendor id is OFIVE's vendor id
 */
  return `
  (SELECT (IIF(Discont = 3, 1145, VendorId)) AS VendorId,
             ItemNumber,
             Id,
             MstrRetailPrice,
             RetailSellingUnit,
             ModifiedOn,
             Discont,
             Bucket,
             Description,
             InsertUpdateDelete
      FROM UltimateLogging)
  `
}

const customRetailPrice = (params: {
  time: string
  itemNumber: string
  vendorId: string
  storeId: string
}) =>
  customRetail({
    field: `${resolveRetailPrice('IND')} RetailPrice`,
    ...params,
  })

const customRetailPriceDate = (params: {
  time: string
  itemNumber: string
  vendorId: string
  storeId: string
}) =>
  customRetail({
    field: `IIF(${resolveRetailPrice(
      'IND',
    )} IS NULL, NULL, IND.ModifiedOn) RetailPriceDate`,
    ...params,
  })

function customRetail(params: {
  field: string
  time: string
  itemNumber: string
  vendorId: string
  storeId: string
}) {
  return `
  SELECT TOP 1 ${params.field} 
  FROM individualRetailStores IND
  LEFT JOIN ${Ultimate()} U ON IND.UltimateID = U.Id
  WHERE U.ItemNumber = ${params.itemNumber}
    AND U.VendorId = ${params.vendorId}
    AND IND.StoreID = ${params.storeId} 
    AND IND.ModifiedOn < ${params.time}
  ORDER BY IND.ModifiedOn DESC 
  `
}

const masterRetailPrice = (params: {
  time: string
  itemNumber: string
  vendorId: string
}) => masterRetail({field: 'RetailPrice', ...params})

const masterRetailPriceDate = (params: {
  time: string
  itemNumber: string
  vendorId: string
}) => masterRetail({field: 'ModifiedOn', ...params})

function masterRetail(params: {
  field: string
  time: string
  itemNumber: string
  vendorId: string
}) {
  return `
  SELECT TOP 1 ${params.field}
  FROM (
           SELECT ModifiedOn, 
                  ${resolveRetailPrice('Ultimate')} RetailPrice
           FROM ${Ultimate()} Ultimate
           WHERE Ultimate.ItemNumber = ${params.itemNumber}
             AND Ultimate.VendorId = ${params.vendorId}
             AND Ultimate.ModifiedOn < ${params.time}

           UNION ALL

           SELECT ModifiedOn, 
                  IIF(UltimateLogging.InsertUpdateDelete = 2, NULL, ${resolveRetailPrice(
                    'UltimateLogging',
                  )}) RetailPrice
           FROM ${UltimateLogging()} UltimateLogging
           WHERE UltimateLogging.ItemNumber = ${params.itemNumber}
             AND UltimateLogging.VendorId = ${params.vendorId}
             AND UltimateLogging.ModifiedOn < ${params.time}
             
           UNION ALL
           
           -- Synthetic history. We can try to guess old retail price.
           SELECT CONVERT(DATETIME, '1970-01-01') ModifiedOn, (
             ${firstRetailPrice(params)}
             ) RetailPrice
             
       ) t1
  ORDER BY ModifiedOn DESC
  `
}

function firstRetailPrice(params: {itemNumber: string; vendorId: string}) {
  return `
  SELECT TOP 1 RetailPrice
  FROM (
           SELECT ModifiedOn, 
                  ${resolveRetailPrice('Ultimate')} RetailPrice
           FROM ${Ultimate()} Ultimate
           WHERE Ultimate.ItemNumber = ${params.itemNumber}
             AND Ultimate.VendorId = ${params.vendorId}

           UNION ALL

           SELECT ModifiedOn, 
                  IIF(UltimateLogging.InsertUpdateDelete = 2, NULL, ${resolveRetailPrice(
                    'UltimateLogging',
                  )}) RetailPrice
           FROM ${UltimateLogging()} UltimateLogging
           WHERE UltimateLogging.ItemNumber = ${params.itemNumber}
             AND UltimateLogging.VendorId = ${params.vendorId}
             
       ) t1
  ORDER BY ModifiedOn
  `
}

/*
What was the item retail price in that shop during this time?
 */
const retailPrice = (params: {
  time: string
  itemNumber: string
  vendorId: string
  storeId: string
}) => `
  COALESCE((${customRetailPrice(params)}), (${masterRetailPrice(params)}))
  `

/*
When did the last time we priced the item?
 */
const retailPriceDate = (params: {
  time: string
  itemNumber: string
  vendorId: string
  storeId: string
}) => `
  COALESCE((${customRetailPriceDate(params)}), (
  ${masterRetailPriceDate(params)}))
  `

/*
Which margin is %percentile% margin for this item and store?
 */
function marginPercentile(params: {
  percentile: string
  itemNumber: string
  vendorId: string
  storeId: string
}) {
  /*
- Selecting all invoices of an item
- For each invoice we find a retail price
- Knowing the retail price, we could calculate margin
- And using the margin we calculate margin percentile
   */
  return `
  SELECT DISTINCT PERCENTILE_CONT(${
    params.percentile
  }) WITHIN GROUP (ORDER BY Margin) OVER () FROM (
    SELECT (RetailPrice - InvoiceCost) Margin FROM (
      SELECT  IT.Cost InvoiceCost, 
              ${retailPrice({...params, time: 'I.InvoiceDate'})} RetailPrice
      FROM Item IT
      INNER JOIN Invoice I ON IT.InvoiceID = I.ID 
      WHERE IT.ItemNumber = ${params.itemNumber}
        AND IT.VendorId = ${params.vendorId}
        AND I.StoreID = ${params.storeId}
    ) marginQPart1
    WHERE RetailPrice IS NOT NULL AND InvoiceCost IS NOT NULL 
  ) marginQPart2
  `
}

/*
For each item in each store we find the latest invoice
We also assemble different auxiliary data here like store and vendor names
 */
function latestOffers() {
  return `
  SELECT StoreID,
         invoices.VendorId,
         invoices.ItemNumber,
         invoices.Cost InvoiceCost,
         invoices.InvoiceNumber,
         InvoiceID,
         InvoiceDate,
         U.Id          UltimateID,
         U.Bucket,
         U.Description,
         StoreName,
         VendorName,
         ItemID
  FROM (
           SELECT *
           FROM (
                    SELECT ROW_NUMBER()
                                   OVER (
                                       PARTITION BY
                                       IT.VendorId,
                                       IT.ItemNumber,
                                       I.StoreID
                                       ORDER BY I.InvoiceDate DESC, IT.InvoiceID DESC
                                       ) rn,
                           IT.ItemNumber,
                           IT.VendorId,
                           IT.InvoiceID,
                           IT.Cost,
                           IT.InvoiceNumber,
                           I.InvoiceDate,
                           Vendor.DisplayName as VendorName,
                           I.StoreID,
                           StoreName,
                           IT.ID ItemID
                    FROM Item IT
                             INNER JOIN Invoice I ON IT.InvoiceID = I.ID
                             INNER JOIN Vendor ON Vendor.Id = IT.VendorId
                             INNER JOIN Store ON Store.ID = I.StoreID
                    WHERE IT.Cost IS NOT NULL 
                ) AS t2
           WHERE rn = 1
       ) invoices
           INNER JOIN ${Ultimate()} U ON invoices.VendorId = U.VendorId AND invoices.ItemNumber = U.ItemNumber
  WHERE (U.ModifiedOn >= @since OR InvoiceDate >= @since)
  `
}

function latestOffersWithPriceData() {
  const tables = {
    vendorId: 'latestOffers.VendorId',
    itemNumber: 'latestOffers.ItemNumber',
    storeId: 'latestOffers.StoreID',
    time: 'latestOffers.InvoiceDate',
  }

  const marginQ = (percentile: string) =>
    '(' +
    marginPercentile({
      percentile: percentile,
      ...tables,
    }) +
    ')'

  /*
  MSSQL works that way, that it will optimize different marginQ() calls into a one call
  The same valid for retailPrice
   */
  return `
  SELECT *,
        ${retailPrice(tables)} RetailPrice,
        ${retailPriceDate(tables)} RetailPriceDate,
        (${customRetailPrice(tables)}) CustomRetailPrice,
        (${masterRetailPrice(tables)}) MasterRetailPrice,
        (${retailPrice(tables)} - InvoiceCost) Margin,
        ${marginQ('0.25')} MarginQ1,
        ${marginQ('0.50')} MarginQ2,
        ${marginQ('0.75')} MarginQ3
  FROM (${latestOffers()}) latestOffers
  `
}

/*
Here we decide whether the current item retail price is abnormal
 */
function selectMarginStatus(from: string) {
  return `
  SELECT *,
         CASE
             WHEN MarginQ3 = MarginQ1 AND Margin = MarginQ2
                 THEN NULL
             WHEN Margin <= MarginQ2 - ((MarginQ3 - MarginQ1) / 2)
                 THEN 'Compression'
             WHEN Margin >= MarginQ2 + ((MarginQ3 - MarginQ1) / 2)
                 THEN 'Expansion'
             END AS MarginStatus
  FROM ${from}
 `
}

/*
 * Margin Outliers Report
 *
 * @param resultsTableName We will CREATE a new table with such name, and output results there.
 * If it exists we will OVERWRITE it.
 *
 * We want to know, which currently sold items have abnormal prices.
 * To know that, we should know what is a regular margin for this item in this store.
 * If regular margin is significantly smaller than the current margin – this is a margin compression.
 * If regular margin is significantly bigger than the current margin – this is a margin expansion.
 *
 * Basically we iterate:
 * - for each invoice
 * - for each item
 * - we calculate retail price
 * - then find margin, eg, difference between InvoiceCost and RetailPrice
 * - then use this margin to calculate q1, q2, q3
 * - and for the last offer calculating margin status
 */
export function selectMarginOutliersSQL(resultsTableName: string) {
  const ms = selectMarginStatus(`
    (${latestOffersWithPriceData()}) offersWithPriceData
  `)

  return `
  DROP TABLE IF EXISTS ${resultsTableName};
  SELECT ItemID,
         InvoiceDate,
         RetailPriceDate,
         Bucket,
         InvoiceNumber,
         VendorId,
         VendorName,
         ItemNumber,
         StoreID,
         StoreName,
         Description,
         InvoiceCost,
         RetailPrice,
         CustomRetailPrice,
         MasterRetailPrice,
         Margin,
         MarginQ1,
         MarginQ2,
         MarginQ3,
         MarginStatus
  INTO ${resultsTableName}
  FROM (${ms}) offersWithMarginStatus
  WHERE Margin IS NOT NULL
    AND MarginQ1 IS NOT NULL
    AND MarginQ2 IS NOT NULL
    AND MarginQ3 IS NOT NULL
  ORDER BY InvoiceDate DESC, StoreID;
  `
}
