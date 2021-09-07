import {pipe} from 'lodash/fp'
import {
  arraySchema,
  booleanSchema,
  hasBrand,
  InferSchemaType,
  literalSchema,
  numberSchema,
  objectSchema,
  optional,
  stringSchema,
  unionSchema,
} from '../../../../common/domain/schema'
import {
  CleanNonEmptyStringSchema,
  DateTypeSchema,
  ItemNumberSchema,
  NonEmptyStringSchema,
  PRICE_DIGITS,
  PriceSchema,
} from '../../../../common/domain/value-objects'
import {roundAsExcel} from '../../../../common/utils/roundAsExcel'

export type Margin = InferSchemaType<typeof MarginSchema>
export const MarginSchema = pipe(
  CleanNonEmptyStringSchema,
  numberSchema,
  (x) => roundAsExcel(x, PRICE_DIGITS),
  hasBrand('Margin'),
)

export type MarginStatus = InferSchemaType<typeof MarginStatusSchema>
export const MarginStatusSchema = unionSchema([
  literalSchema('Compression'),
  literalSchema('Expansion'),
])

export type MarginReportItem = InferSchemaType<typeof MarginReportItemSchema>
export const MarginReportItemSchema = objectSchema({
  // When did we bought the item from a Vendor
  InvoiceDate: DateTypeSchema,

  // When did we price the item for the last time
  RetailPriceDate: DateTypeSchema,

  // Type of an item, eg, toy or shampoo
  Bucket: optional(stringSchema),

  // Unique if of invoice if tax forms and other systems
  InvoiceNumber: optional(stringSchema),

  // From whom we bought the item
  VendorName: optional(stringSchema),

  // Where we are reselling the item
  StoreName: optional(stringSchema),

  // Item's description
  Description: optional(stringSchema),

  // How much we paid for the item
  InvoiceCost: PriceSchema,

  // For what price we are reselling the item
  RetailPrice: PriceSchema,

  // Default price of the item
  // If a Store doesn't have CustomPrice then RetailPrice=MasterRetailPrice
  MasterRetailPrice: PriceSchema,

  // Each store can resell the item with a custom price.
  // If a Store has CustomRetailPrice then RetailPrice=CustomRetailPrice
  CustomRetailPrice: optional(PriceSchema),

  // Unique item id INSIDE the Vendor.
  // Different vendors can have same ItemNumbers for different items.
  // But inside one vendor ItemNumber is unique for a concrete item.
  ItemNumber: ItemNumberSchema,

  // Margin = RetailPrice - InvoicePrice
  Margin: MarginSchema,

  // We take each time we bought the item for the store
  // And check RetailPrice for the item in the store
  // And calculate Margin history, eg,
  // For each store we know historical data on how much profit it made for each item
  // The we take this historical data for and compress it to MarginQX
  // QX - is a Quantile X
  // This way in this report Margin represents the current item's margin
  // MarginQ2 represents median of what we usually sell this item for in this store
  // Eg, we compressed the item history into QX, so we could find a MarginStatus
  MarginQ1: MarginSchema,
  MarginQ2: MarginSchema,
  MarginQ3: MarginSchema,

  // Basically answers the question: do we need to change our RetailPrice?
  // There is a formula, that uses Qx and margin to calculate MarginStatus
  // Compression - we are losing more than expecting, mb we need to raise the RetailPrice
  // Expansion - we are earning more than expecting, mb we need to buy more
  // Normal - all things going as expected, do nothing
  MarginStatus: MarginStatusSchema,
})

/*
# Introduction into "Our items priced incorrectly" issue
What is MarginReport?

We have like 10 (at the time of writing this) retail stores in US
These stores sell various items
These stores buy these items from vendors and resell them at a higher price
Time-to-time each store's manager makes an order on items he wants
Each time a store buys an item from a vendor we get a record in the Item table in MSSQL
The price we bought an item called Invoice Price, and we bought it on Invoice Date

Each store wants to resell items it bought with a markup to get profit. Eg, buy on $0.5 and sell on $1.0.
Difference between buy/sell is called Margin.
Multiple stores can sell the same item, but each store can have a custom price on the same item. The price stores sell items called Retail Price.

What is the big issue:
- Currently we have invalid Retail Prices in our database for a lot of items

What is an invalid price?
Vendors time to time change prices they sell items:
- today I bought a toy for $10
- the month after the vendor can sell the same toy for $20, or for $5

But our database has Retail Price of $15. We can't buy items for $20 and sell them for $15 - this is money loss.
We need to change our Retail Price. This case is obvious.

Less obvious case:
- we have 10 years in a row margin of $10 for this toy
- vendor's prices went a bit up, and now we have margin of $5
- it's not a negative margin, but we still doesn't get margin we expect, we need to adjust the Retail Price

Paul and Eric adjust Retail Price manually. They are good at it, but there is an issue:
- We have like 200k of items
- We buy them from many vendors multiple times a month, even day
- And sell them in 10 stores
- It is really hard to find manually, what items have invalid price

This is where MarginReport comes into play. It runs daily and finds which items have invalid margin, and send a report with these items to email of Paul and Eric.
After receiving the report the guys can open software Fabiano made and fix the prices.

---

Business uses daily MarginReports to detect 2 main things:
- Margin compression
- Margin expansion

A margin is a difference between how much the business paid for an item,
and how much stores sell the item, eg, its a profit from an item.

Margin compression happens when business starts to receive *less* profit from an item than *usual*
Margin expansion happens when business starts to receive *more* profit from an item than *usual*

Eg, if we used to sell an item with a margin $1 and now we sell it with a margin $0.1 – it's compression

A manager will receive MarginReports daily and take actions:
- The manager will need to amend the item price if expansion or compression is detected
- The manager also can choose not to take an action, and mark the event as resolved

This way the business price items
*/
export type MarginReport = InferSchemaType<typeof MarginReportSchema>
export const MarginReportSchema = objectSchema({
  sourceName: NonEmptyStringSchema,
  since: DateTypeSchema,
  reportStarted: DateTypeSchema,
  reportEnded: DateTypeSchema,
  error: optional(NonEmptyStringSchema),
  items: arraySchema(MarginReportItemSchema, 4000),
  resultsArePartial: booleanSchema,
})
