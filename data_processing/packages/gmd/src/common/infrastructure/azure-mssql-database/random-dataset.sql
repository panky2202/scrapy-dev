/*
To test our reporting query we need
*/

/*
Generates Random UltimateLogging history
- takes all invoices
- finds first/last order date for each product
- then for each product generates UltimateLogging history
- we take the first/last date, and generate a time point with a price
- then write the thing to UltimateLogging
 */
WITH
    random AS (
        SELECT 1 AS x
        UNION ALL
        SELECT 1
        UNION ALL
        SELECT 1
        UNION ALL
        SELECT 1
        UNION ALL
        SELECT 1
        UNION ALL
        SELECT 1
        UNION ALL
        SELECT 1
    ),

    invoices AS (
        SELECT DISTINCT I.ApprovedDate,
                        U.Id AS UltiamteID
        FROM Item
                 LEFT JOIN Invoice I ON Item.InvoiceNumber = I.InvoiceNumber
                 LEFT JOIN Ultimate U ON Item.VendorId = U.VendorId AND
                                         Item.ItemNumber = U.ItemNumber
        WHERE I.ApprovedDate IS NOT NULL
    ),

    items AS (
        SELECT DISTINCT *,
                        MIN(ApprovedDate)
                            OVER ( PARTITION BY UltiamteID) AS MinDate,
                        MAX(ApprovedDate)
                            OVER ( PARTITION BY UltiamteID) AS MaxDate
        FROM invoices
    ),

    randomPrices AS (
        SELECT *,
               ROUND(RAND(CHECKSUM(NEWID())) * 2 + 0.01, 2) AS RetailPrice,
               DATEADD(HOUR, -- random hour between min/max +-2
                       RAND(CHECKSUM(NEWID())) *
                       (1 + DATEDIFF(HOUR, MinDate, MaxDate)) +
                       RAND(CHECKSUM(NEWID())) * 4 * 24 - 2 * 24,
                       MinDate)                             AS Date
        FROM items
                 CROSS JOIN random
    )

INSERT
INTO UltimateLogging (MstrRetailPrice,
                      VendorId,
                      ItemNumber,
                      Description,
                      CreatedOn,
                      ModifiedOn,
                      ModifiedBy,
                      InsertUpdateDelete)
SELECT TOP 30000 RetailPrice AS MstrRetailPrice,
                 U.VendorId,
                 U.ItemNumber,
                 U.Description,
                 Date        AS CreatedOn,
                 Date        AS ModifiedOn,
                 0           AS ModifiedBy,
                 1           AS InsertUpdateDelete
FROM randomPrices
         LEFT JOIN Ultimate U ON U.Id = UltiamteID
ORDER BY NEWID()
GO

/*
Generates Random individualRetailStores history
- takes all invoices
- finds first/last order date for each product
- then for each product generates individualRetailStores history
- we take the first/last date, and generate a time point with a price
- we take a random store id
- then write the thing to UltimateLogging
 */
WITH
    random AS (
        SELECT 1 AS x
        UNION ALL
        SELECT 1
        UNION ALL
        SELECT 1
        UNION ALL
        SELECT 1
        UNION ALL
        SELECT 1
        UNION ALL
        SELECT 1
        UNION ALL
        SELECT 1
    ),

    invoices AS (
        SELECT DISTINCT I.ApprovedDate,
                        U.Id AS UltiamteID
        FROM Item
                 LEFT JOIN Invoice I ON Item.InvoiceNumber = I.InvoiceNumber
                 LEFT JOIN Ultimate U ON Item.VendorId = U.VendorId AND
                                         Item.ItemNumber = U.ItemNumber
        WHERE I.ApprovedDate IS NOT NULL
    ),

    items AS (
        SELECT DISTINCT *,
                        MIN(ApprovedDate)
                            OVER ( PARTITION BY UltiamteID) AS MinDate,
                        MAX(ApprovedDate)
                            OVER ( PARTITION BY UltiamteID) AS MaxDate
        FROM invoices
    ),

    randomPrices AS (
        SELECT *,
               ROUND(RAND(CHECKSUM(NEWID())) * 2 + 0.01, 2) AS RetailPrice,
               DATEADD(HOUR, -- random hour between min/max +-2
                       RAND(CHECKSUM(NEWID())) *
                       (1 + DATEDIFF(HOUR, MinDate, MaxDate)) +
                       RAND(CHECKSUM(NEWID())) * 4 * 24 - 2 * 24,
                       MinDate)                             AS Date
        FROM items
                 CROSS JOIN random
    )

INSERT
INTO individualRetailStores (UltimateID,
                             StoreID,
                             MstrRetailPrice,
                             ModifiedBy,
                             ModifiedOn)
SELECT TOP 30000 UltiamteID,
             ABS(CHECKSUM(NEWID()) % 11) + 1 AS StoreID,
             RetailPrice                     AS MstrRetailPrice,
             0                               AS ModifiedBy,
             Date                            AS ModifiedOn
FROM randomPrices
         LEFT JOIN Ultimate U ON U.Id = UltiamteID
ORDER BY NEWID()
GO


SELECT COUNT(*)
FROM individualRetailStores