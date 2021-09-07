## Spider Merge Request

- Vendor Name: <!-- Insert Vendor Name. -->
- Vendor Id: <!-- Insert Vendor Id. -->
- Website URL: <!-- Insert Website URL. -->

## The Workflow

- Start writing code. Use this
  tutorial [How to Develop Scrapy Spiders](https://gitlab.com/engaging/scrapy/-/wikis/How-to-Develop-Scrapy-Spiders).
- This merge request is the center of communication. Here you can ask others for help. Use @ to call for a specific
  person. You are expected to communicate a lot
- **If you see an issue – fix it**. There is no `your/not yours` code segregation, eg everyone is highly encouraged
  change all the code and comment on all the code
- There is no shame if code you wrote was changed or reviewed by someone else. We all produce imperfect code. We try to
  maximize value for our clients, but we know that the code will always be imperfect, and will always have ways to
  improve. We all know that software development is about tradeoffs and constant learning
- When you're done, complete the `Developer's checklist`
- After that call a Maintainer for a review

## Developer's checklist (required)

<!-- Is filled by you -->

- [ ] Make sure that all tests are green. GitLab pipeline should be green, eg, successful.
- [ ] All requests produced by scrapy parse functions are tested with `@request` spider contracts
- [ ] All items produced by scrapy parse functions are tested with `@item` spider contracts
- [ ] Make sure that no old tests were modified without discussing it with a Maintainer
- [ ] The Spider's name is correct
- [ ] Make sure that UPC and IMAGE_URL were scraped correctly, or confirmed, that could not be scraped
- [ ] Make sure that VENDORID and VENDOR name are correct
- [ ] All other todos are done. Merge request is assigned to a Maintainer for a review

## Maintainer's checklist (required)

<!-- Is filled by a Maintainer -->

- [ ] Make sure that all tests are green. GitLab pipeline should be green, eg, successful.
- [ ] All requests produced by scrapy parse functions are tested with `@request` spider contracts
- [ ] All items produced by scrapy parse functions are tested with `@item` spider contracts
- [ ] Make sure that no old tests were modified without discussing it with a Maintainer
- [ ] The Spider's name is correct
- [ ] Make sure that UPC and IMAGE_URL were scraped correctly, or confirmed, that could not be scraped
- [ ] Make sure that VENDORID and VENDOR name are correct
- [ ] Make sure that code follows Python best practice

*Let's parse the world :earth_asia:*
