# How to SQL

Why do we use it?

## The problem

SQL is hard to use:

- It's a whole new language. Simpler than TS, but still you have to learn it.
- It needs a schema. Schema is always out of sync between staging/prod. Need to make a new column or index? Good luck
  updating your DB manually.
- If you lose your focus for a second, you may allow an [SQL injection](https://www.w3schools.com/sql/sql_injection.asp)
  .
- You can write a query, that can NUKE your whole database. I nuked in the past when used temporary tables on a looooong
  query. When I tried to cancel the query I figured out, that transaction rollback is basically endless.
- It is hard to test. You need an actual SQL server with tables if you want to test your query.

But why do we still use SQL for our persistence layer? We could store our data in NoSQL, like, in key/value storage,
this would solve the pain points.

The reason is – SQL is not only persistence. It is also computation and data analysis. SQL can run huge ass parallel
computation algorithms on our data. This feature is crucial for business reports, analytics, and decision-making.

SQL is in the top 3 popular languages of choice when it comes to data science according
to [Kaggle 2019 survey](https://businessoverbroadway.com/2020/06/29/usage-of-programming-languages-by-data-scientists-python-grows-while-r-weakens/)
. Python/SQL/R – these things crack data nowadays.

So, why do we use SQL, even if it is a pain to use?

- It allows running huge computations

Now when we have known it, let's make your experience with SQL smoother.

## IDE for MSSQL

You want to use an IDE. SQL syntax is complex. Typing is boring and could be automated. You also want to know which
parts of SQL schema are missing from production vs git.

- For Mac/Linux DataGrip
- For Windows SSMS or DataGrip

DataGrip also allows running analysis on a query and finding missing indexes.

## Must Know Keywords

Before diving into sweet-sweet coding, read the documentation and use cases of these keywords. This will help you to
recall a solution for common SQL tasks. These keywords cover 90% of what you usually do in SQL:

- SELECT * FROM X WHERE Y
- SELECT TOP
- ORDER BY
- INNER JOIN
- LEFT JOIN
- CROSS JOIN
- UNION ALL
- CASE
- IS NOT NULL
- IIF()
- COALESCE()
- CONVERT()
- NULLIF()
- ROW_NUMBER() – this one is handy if you want to find the top 1 row of some shape

## Temporary Things

In MSSQL `Table` is a regular table name, but `#Table` is a temporary table name. Temporary things will be alive till
your session is alive. As soon as you drop connection they will be lost. Extremely helpful for testing.

### Use CTEs

[Common Table Expressions](https://docs.microsoft.com/en-us/sql/t-sql/queries/with-common-table-expression-transact-sql)
or CTEs are a handy way to organize your huge SQL queries. They allow extracting part of your query into a "variable",
eg, you can name a part of your query. This makes your code readable and structured, eg, you need to update 1 place
instead of 10.

```
WITH
    doubleCost AS (SELECT *, Cost * 2 DoubleCost FROM Ultimate)

SELECT Item.ItemNumber, doubleCost
FROM Item
         INNER JOIN doubleCost ON Item.ItemNumber = doubleCost.ItemNumber AND
                                  Item.VendorId = doubleCost.VendorId
```

Here `doubleCost` is a substitute for `(SELECT *, Cost * 2 DoubleCost FROM Ultimate)`.

### Don't use CTEs

Sometimes CTEs make your queries super slow. If speed is your issue, try to avoid CTEs. Often it means that no human can
write/support/refactor such a big query. In this case generate your query with TS.

In my case, I speed up a query from 10h to 10min by just inlining all CTEs, and rephrasing my algo in no CTE way.

Don't worry if your query will have huge repetitive parts, it will not impact performance. MSSQL made this way, that it
will optimize repeated query parts even if they will be of a page long.

## SQL and TypeScript

Usually our SQL <-> TypeScript functions look like this:

```typescript
export function getMarginOutliersMSSQL(deps: { sql: SQLRequestSource }) {
  const { sql } = deps
  return async function ({ count, since }: MarginOutliersFilter): Promise<MarginReportItem[]> {
    const results = await sql
      .request()
      .input('since', since.toISOString())
      // !!! 'SELECT TOP @count' could not be passed as a param, we need replace, aware of injection!
      .query(selectMarginOutliersSQL().replace('@count', String(count)))

    return arraySchema(MarginReportItemSchema)(results.records)
  }
}
```

- We inject an SQL provider as a dependency. This allows us to test our functions.
- All parameters injected with safe input() or triple checked on SQL injection. Eg, "count" is injected without input(),
  but it is a schema branded type of positive number, thus no SQL injection is possible.
- We run a query and convert SQL results to TS from "unknown" type with a schema.

## How to test SQL with Jest

Imagine we have a query:

```
SELECT * FROM Items WHERE price = 2.0
```

How to test it? It's a tricky thing, you need an up and running server. For example Staging server.

The issues with Stagin server:

- Our staging server can have 1000 items with price = 2, or have 0. The state of our SQL server is completely detached
  from the test. You need to create rows in your tables yourself before running your test.
- If you automatically create new rows before your test, you need to clean them, or they will start to pile up. Eg, SQL
  has persistent state.

There are 2 tricks that make it happen:

- We use SQL transactions. Any rows you created/deleted within a transaction will be available for our query. But in the
  end of the test you can roll back the transaction and revert all the changes, thus the test will not change the db
  state.
- We inject SQL provider as a dependency into our function. An injectable SQL provider allows us to mock some tables of
  the request under test. This way, we can update the provider such, that it will replace `Items` table to `#Items`.
  This way we can create a temporary table `#Items` before our test. It will be automatically cleaned up after the test.

## Warning: Temporary tables may make your query "un-cancelable"

If you made lots of IO with temporary tables in your query, but didn't actually change any state of your DB, you may
think, that query cancel is free. This is not the case. If you cancel 1h long query with temp table, it will attempt to
roll back all the transaction on this table. It can take impressive amount of time.

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=How-SQL.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
