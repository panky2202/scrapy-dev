We have 2 main databases in the azure cloud: staging, and production. Staging is public, you can play with it and tests
stuff. Production contains private data, we should treat production very careful. Read more about our setup
in [Azure Infrastructure](wiki/Azure-Infrastructure.md).

# Access to Staging DB

If you want to check/play around with our data, download TablePlus and connect to the Staging database.

- You can find staging db
  credentials [here](https://gitlab.com/engaging/scrapy/-/blob/dev/data_processing/packages/gmd-backend/local.settings.json)
- I recommend [TablePlus](https://tableplus.com/) as SQL UI client. Have free tier. Very powerful and thoughtful tool

# Main SQL Tables

- `Ultimate` contains all products, that are interesting for our
  business. [Scrapy Spiders](How-to-Develop-Scrapy-Spiders.md)
  and [Document Scrapers](How-to-Develop-Document-Scrapers.md) push data in this table. Each product can be uniquely
  identified as VendorID+ItemNo combo. Each product can have multiple UPCs, but will have only one VendorID+ItemNo
- `UPC` table allows us to store multiple UPCs for one VendorID+ItemNo combo

Scrapy Spiders and Document Scrapers collect data and push it to SQL Tables. However, they are not doing it directly. We
write data to the persistence layer via [Parsing GraphQL API](Parsing-GraphQL-API.md).

From the one end the data is being collected with the Parsing GraphQL API, from the other end it is being used by UPC
Scanner – a website that allows users to scan a barcode, and get description, image and price of a product. In the
future we will allow to buy the products.

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=Database-model.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
