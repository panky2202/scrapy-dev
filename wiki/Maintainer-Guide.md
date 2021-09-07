1. Ask others to review the code. We need to grow new Maintainers. They can grow only from reviews. Ask other developers to review the code. But don't ask people who can't code to review.

# Unsorted
- If you merge code into the `deployment` branch the Spiders will be deployed to Zyte cloud, and Document Scrapers will be deployed to azure. 1-week release cycle recommended
- A periodic pipeline scheduled to run the deployed Spiders on Zyte cloud
- The `deployment` branch has access to `SHUB_APIKEY` environment variable. This value is used by `shub` to send command to Zyte cloud
- We use 2 main environments: `production` and `staging`. dev branch for `staging`, deployment branch for `production`
- No one can push direct commits to production, but maintainers can feel free to push commits to staging

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=Maintainer-Guide.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
