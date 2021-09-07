Applies on each new/modified blob in Azure storage. Will try to extract products from blobs. Checks blob's type and find
for it an [appropriate parser](https://gitlab.com/engaging/scrapy/-/wikis/How-to-Develop-Document-Scrapers#how-function_ocr_product_parser-works).

Input:

- supports PDFs and images, but needs `ocr.json` produced by `function_ocr`

Output:

- products' images as blobs
- products pushed to Web Scraping API
