# CR6: Running Dockerfile as non-root

- From: Carlos
- To: Aleksey

# Files In Review

- Dockerfile

## Review

An application primarily should only have access to the resources it needs.   
Docker containers, by default, run with root privileges.                                                                                                                                                               
```shell
$ docker build --rm -t gmd/scrapy-docker-image .   
```

After building our docker image, if we run the command below, it will return the user who is executing it:
```shell
$ docker run gmd/scrapy-docker-image:latest whoami
root
```

With that being said, we all can think about the risks we are exposed to when putting our containers into a stage/dev/production environment.

# Solution

The solution here would be to create a user/group and run the application process as that user.

```shell
RUN groupadd -r gmd && useradd -r -s /bin/false -g gmd scrapy_user
```
Adding this line in our Dockerfile, it will create a user named `scrapy_user` and a group named `gmd`.


Our Dockerfile could start looking like this...
```shell
RUN groupadd -r gmd && useradd -r -s /bin/false -g gmd scrapy_user

RUN DEBIAN_VERSION=10 \
    && wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.asc.gpg \
    && mv microsoft.asc.gpg /etc/apt/trusted.gpg.d/ \
    && wget -q https://packages.microsoft.com/config/debian/$DEBIAN_VERSION/prod.list \
    && mv prod.list /etc/apt/sources.list.d/microsoft-prod.list \
    && chown scrapy_user:gmd /etc/apt/trusted.gpg.d/microsoft.asc.gpg \
    && chown scrapy_user:gmd /etc/apt/sources.list.d/microsoft-prod.list
```

As in our Dockerfile there are multi-stage builds, and It is not possible to re-use the same user in multiple stages, we would create it twice.

Our second build in Dockerfile would look like this:
```shell
FROM mcr.microsoft.com/azure-functions/python:3.0-python3.8 as azure_parsers
RUN groupadd -r gmd && useradd -r -s /bin/false -g gmd scrapy_user

[...]

RUN cd ./scrapy && pip install --cache-dir ./.pip -e .
RUN chown -R scrapy_user:gmd ./scrapy
USER scrapy_user
COPY ./data_scraping/azure_scraping $AzureWebJobsScriptRoot
```

This way, if we build Docker image and run `whoami` again: 
```shell
$ docker run gmd/scrapy-docker-image:latest whoami
scrapy_user
```

Note: *I'm not sure about the behavior of this change in dev/prod environment - I'm new in the project and could not test it effectively.*

## Conclusion
With this approach, containers will not have `root` privileges on the host.



> Well written, secure and reusable Docker images should not expect to be run as root and should provide a predictable and easy method to limit access.

[Processes In Containers Should Not Run As Root](https://medium.com/@mccode/processes-in-containers-should-not-run-as-root-2feae3f0df3b)

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=cr6-running-docker-as-nonroot.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
