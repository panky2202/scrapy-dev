# CI pipeline takes too much time

## The problem

Our CI pipeline takes at least 20 minutes to finish, and this brings at least the next issue:

* Feedback from the pipeline is too slow. 20 minutes can make us stop our work just to know if the pipeline is green.

## Improvements

There are some improvements we can do to reduce this time

* **Store our own base Docker image**. Dockerfile does not change often. Last change was done on May 15th. Therefore, we
  can store our custom base Docker image in gitlab registry to just copy files. Then we won't build the environment
  installing dependencies, and just pulling the images. We can have another gitlab workflow to build and push this image
  on demand.
* **Run build and test in parallel**. We have a linear ci. We can run build(We should rename this because we are running
  tests also here) and test in parallel because they are not dependent of an artifact.
* Bonus **Add Makefile to run tasks that can onboard people** In the Makefile we can add tasks as create environments,
  run linters, create githooks. Specially githooks would help us to receive feedback faster, and not waiting for the
  pipeline to tell us if something is wrong.

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=cr3-ci-takes-too-much-time.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
