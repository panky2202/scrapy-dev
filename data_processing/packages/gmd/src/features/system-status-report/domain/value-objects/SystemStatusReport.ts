import {
  arraySchema,
  InferSchemaType,
  literalSchema,
  objectSchema,
  optional,
  unionSchema,
} from '../../../../common/domain/schema'
import {
  DateTypeSchema,
  NonEmptyStringSchema,
  PositiveNumber,
  PositiveNumberSchema,
} from '../../../../common/domain/value-objects'
import {pipe} from 'lodash/fp'
import {round, sortBy, sum} from 'lodash'

export const VendorNameSchema = NonEmptyStringSchema

export const ParsingErrorSchema = objectSchema({
  source: NonEmptyStringSchema,
  totalErrors: PositiveNumberSchema,
})

const toPercent = (value: PositiveNumber, total: PositiveNumber) =>
  PositiveNumberSchema(total === 0 ? 0 : round(value / total, 2))

export const DatabaseItemsSchema = pipe(
  objectSchema({
    total: PositiveNumberSchema,
    withImages: PositiveNumberSchema,
    withUPC: PositiveNumberSchema,
  }),
  (x) => ({
    ...x,
    withImagesPercent: toPercent(x.withImages, x.total),
    withUPCPercent: toPercent(x.withUPC, x.total),
  }),
)

export type VendorStatusReport = InferSchemaType<
  typeof VendorStatusReportSchema
>
export const VendorStatusReportSchema = objectSchema({
  vendorName: VendorNameSchema,

  // How much errors the system produced
  parsingErrors: arraySchema(ParsingErrorSchema, 100),

  // How much value the system produced
  databaseItems: DatabaseItemsSchema,
})

/*
# What is SystemStatusReport?

After we deploy our system to production, what's next?
- How can we be sure that the system is working as expected?
- Are there any errors and exceptions?
- How much value the system produces?

This is extremely important and high value questions that we want to ask.
The SystemStatusReport gives us these answers daily.

Each day everyone on the company will receive this report and have an ability to act on it.
It should give insights to the business, opportunities, errors, and grows potential.

The report may consists of these parts:
- spiders and document parsers status
- backend status
- frontend status
- feedback from clients
- git stats
*/
export type SystemStatusReport = InferSchemaType<
  typeof SystemStatusReportSchema
>
export const SystemStatusReportSchema = pipe(
  objectSchema({
    // This way we will not confuse prod vs staging
    environment: unionSchema([
      literalSchema('production'),
      literalSchema('development'),
      literalSchema('test'),
    ]),
    // How deep of our historical data we use to build this report
    since: DateTypeSchema,
    // When did we start building the report
    reportStarted: DateTypeSchema,
    // When did we finish building the report
    reportEnded: DateTypeSchema,
    // Was there any error during building
    error: optional(NonEmptyStringSchema),

    // For each vendor we generate a status report
    vendors: pipe(arraySchema(VendorStatusReportSchema, 1000), (x) =>
      sortBy(x, [(x) => x.databaseItems.total]).reverse(),
    ),
  }),
  (x) => ({
    ...x,
    vendors: [
      VendorStatusReportSchema({
        vendorName: 'All Vendors',
        parsingErrors: [],
        databaseItems: {
          total: sum(x.vendors.map((y) => y.databaseItems.total)),
          withUPC: sum(x.vendors.map((y) => y.databaseItems.withUPC)),
          withImages: sum(x.vendors.map((y) => y.databaseItems.withImages)),
        },
      }),
      ...x.vendors,
    ],
  }),
)
