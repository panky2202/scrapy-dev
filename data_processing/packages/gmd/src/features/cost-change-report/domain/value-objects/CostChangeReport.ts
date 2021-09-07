import {
  arraySchema,
  booleanSchema,
  hasBrand,
  InferSchemaType,
  objectSchema,
  optional,
  refine,
  stringSchema,
} from '../../../../common/domain/schema'
import {
  DateTypeSchema,
  ItemNumberSchema,
  NonEmptyStringSchema,
  PriceSchema,
} from '../../../../common/domain/value-objects'
import {pipe} from 'lodash/fp'

// This event means that InvoicePrice != PreviousInvoicePrice
export type CostChangeEvent = InferSchemaType<typeof CostChangeEventSchema>
export const CostChangeEventSchema = pipe(
  objectSchema({
    // When did we bought the item from a Vendor
    InvoiceDate: DateTypeSchema,

    // Unique if of invoice if tax forms and other systems
    InvoiceNumber: optional(stringSchema),

    // Type of an item, eg, toy or shampoo
    Bucket: optional(stringSchema),

    // From whom we bought the item
    VendorName: optional(stringSchema),

    // Unique item id INSIDE the Vendor.
    // Different vendors can have same ItemNumbers for different items.
    // But inside one vendor ItemNumber is unique for a concrete item.
    ItemNumber: ItemNumberSchema,

    // Where we are reselling the item
    StoreName: optional(stringSchema),

    // Item's description
    Description: optional(stringSchema),

    // How much we paid for the item previous time
    PreviousInvoiceCost: PriceSchema,

    // How much we paid for the item
    InvoiceCost: PriceSchema,
  }),
  refine(
    (x) => x.InvoiceCost !== x.PreviousInvoiceCost,
    "This is not a cost change event, the cost haven't changed",
  ),
  hasBrand('CostChangeEvent'),
)

/*
- We take all invoices
- We iterating per item
- We check the item invoice price history
- It looks like this:
  - day1: we bought the item for $1.0
  - day2: $1.0
  - day3: $1.0
  - day4: !EVENT! we bought the item for $2.0, and it is different from the prev price $1.0
  - day5: $2.0
  - day6: $2.0
  - day7: !EVENT! we bought the item for $1.99, and it is different from the prev price $2.0
  - day8: $1.99
- Each time we buy an item we compare its price with the prev price we bought it
- If the price is different we generate an Event and add it to the CostChangeReport
- We will use this data to cross check the MarginReport

fields are the same as margin report, except no margin, no q1,q2,q3, but HAS a field PriviousInvoicePrice
*/
export const MAX_COST_CHANGE_EVENTS_IN_REPORT = 200
export type CostChangeReport = InferSchemaType<typeof CostChangeReportSchema>
export const CostChangeReportSchema = objectSchema({
  sourceName: NonEmptyStringSchema,
  reportStarted: DateTypeSchema,
  reportEnded: DateTypeSchema,
  error: optional(NonEmptyStringSchema),
  items: arraySchema(CostChangeEventSchema, MAX_COST_CHANGE_EVENTS_IN_REPORT),
  resultsArePartial: booleanSchema,
})
