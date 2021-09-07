# MSSQL: How To Import Big Tables

Sometimes you need to have access to some data in your MSSQL, but it is far away:
- the data lives in a different MSSQL/Cosmos/MongoDB/Web URL/Blob storage/etc, in a some remote place
- and the data is of size of 1m records, so you could not copy/paste it with a convenient methods

Moving such data may be tricky, one option is to use EXTERNAL DATA SOURCE.

You can mount your external data as a normal mssql table, and then work with it. You can even copy external data into a local table, this will be fast. It took me 1 minute to copy 100k of big records, 1m of records will take you 10 minutes. Read more on [stackoverflow](https://stackoverflow.com/questions/6572754/sql-azure-copy-table-between-databases).

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=MSSQL_How_To_Import_Big_Tables.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
