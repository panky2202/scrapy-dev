## Why should we use a virtual python environment

By default all Python dependencies and interpreters are global:
- If you run `pip install <dependency>` it will be installed into your system globally

This sounds harmless. However, consider this:
- You have several different python projects. Some project require Python 3, some Python 2
- Some projects require `<dependency>` version 1.0.0, some version 2.0.0

The projects start to conflict with each other. This quickly becomes a mess. This is where the python virtual environment comes into play.

## How to use a virtual python environment
> For mac os python 3. Feel free to add Windows instructions.
- Download the project's git repo
- Open terminal in the project's root
- Run `python3 -m venv .venv`. This will create a `.venv` folder in the project's root. This folder should not be committed to git. Treat it as `node_modules`
- To activete the environment run `source ./.venv/bin/activate`
- If you run `which python` you will see, that now your terminal uses python from the virtual environment
- `pip install -e .` will install all the project dependencies from `requirements.txt` into your environment. Don't forget the `-e` opt
- Now you can safely run `scrapy check` or `scrapy shell` or other python tools 

As you can see, you need manually activate the environment each time you create a new terminal. This is tedious. However, modern IDEs like PyCharm CE provide a convenient automatic environment switch [Configure a virtual environment in PyCharm](https://www.jetbrains.com/help/pycharm/creating-virtual-environment.html).

After configuring IDE it will automatically activate the environment in each new terminal session and shift+enter tests runs.

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=How-To-Setup-Python-Virtual-Environment.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
