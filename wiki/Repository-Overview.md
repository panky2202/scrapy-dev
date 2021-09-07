This repository is a Monorepo. Monorepo is a software development strategy where code for many projects is stored in the
same repository.

# Monorepo Pros

- Fast and smooth development experience for a company, that specializes on making many interdependent projects.
- Developers share code and can learn from each
  other. [It forces the conversation, and makes trade-offs visible](https://medium.com/@adamhjk/monorepo-please-do-3657e08a4b70)
  .
- Full transparency. If you made a change and broke something you will know it instantly. If a dependency needs to be
  fixed, anyone can fix it cuz all the dependency uses are visible and available for change.

# Languages

Our repository has 2 main languages:

- Python. Easy to work with, easy to learn, but has no types. This limits its use to the borders of our system, cuz the
  core needs types to scale.
- TypeScript. Has stiff learning curve, demands lots of code, and it takes several months to learn TS if you know
  Python. TS has powerful type system. This allows to write complex and scalable business logic. TS is the core of our
  system.

# Repository's structure

- `./data_processing` here TS lives. It has different backends, plus React frontend. The goal is to interact with a user
  and process data.
- `./data_scraping` here Python lives. It has different systems, that collect external data: parsers, scrapers. The goal
  is to grab data and push it to the core.
- `./wiki` here all our documents live
- `package.json` entry point for TS development
- `setup.py` entry point for Python development
- `.gitlab-ci.yml` our CI/CD that is being run by GitLab
- `Dockerfile` all our containers live here

# Pre-push tests

Before you push code to the GitLab, you will automatically run locally all repo tests. This will allow you to get fast
feedback and save from "waited 30 min, GitLab has failed due to nonsense" issue. GitLab is really slow in running tests,
but your computer is fast.

Expect delay of 5 min on push.

# Logs
We produce lots of logs. Check [How to access logs](How-to-access-logs.md).

# What's next

- [Scalable Software Development Guide](Scalable-Software-Development-Guide.md)
- [Introduction Into TypeScript Vertical Slice Architecture](Introduction-Into-TS-Vertical-Slice-Architecture.md)
- [How to Work With TypeScript Projects](How-to-Work-With-TypeScript-Projects.md)
- [How to Develop Scrapy Spiders](How-to-Develop-Scrapy-Spiders.md)
- [How to Develop Document Scrapers](How-to-Develop-Document-Scrapers.md)
- [How to access logs](How-to-access-logs.md)

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=Repository-Overview.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
