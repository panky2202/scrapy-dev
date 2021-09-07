If you have never tried Test Driven Development in production before, then your mind will be blown away. From now on
your life will be sweet as honey. Prepare to ascend to the next level of existence.

### 1. What is automated unit testing?

We write a program (a unit test), that will run a part of our program with specific input, and will expect a valid output. If the output is invalid, then an exception will be thrown.

Unit tests are being executed by a CI/CD pipeline in GitLab. Thus, each code push in GitLab will run all the unit tests against the push, and validate, that the code is still correct.

### 2. Why do we write automated tests?

To write tests mean to write more code. Why do we want to spend our time and write more code that will not scrape data?
Feels like this will slow us down, feels like a hassle.

This is actually a common cognitive mistake. In reality, tests drastically speed up the development process and quality.

**1.1 Without tests you will encounter more bugs. Fixing bugs consumes lots of development time. Exponentially more time, than time invested in testing.**

Tests allow testing edge cases before code gets in production, where it will encounter these edge cases. They are rare, but with big data are regular.

For example, your program consists of 6 functions. Each function has 3 interesting edge cases. Thus, the whole edge case amount for such a program will be `3*3*3*3*3*3=729` possible combinations.

You can now feel the exponent. Real programs consist of many moving parts with many edge cases. And the total amount of edge cases grows exponentially. You can't physically test an exponential amount of edge cases.

`unit tests` allow us to test units in isolation. And the 6 functions with 3 edge cases example transform into `3+3+3+3+3+3=16`. Thus, the only way to cover a program with tests is to test isolated modules.

You can't manually test hundreds of isolated modules. You need automated tests.

**1.2 Without tests refactoring is blocked. Without refactoring code could not evolve and improve.**

Consider these scenarios:

- You wrote a program without tests. It works
- If someone would like to change the program code: extract a common module or make the code easier to understand, then someone needs manually validate, that the program still works fine

Or even better:

- You want to change a common module. Now you need manually validate that **each program that uses this module** works fine

Without tests, even in small projects, you pretty soon will spend all your time on manual program validation. Thus, developers will skip manual testing and get bugs in production, and then spend tons of time fixing them. Or they do not refactor common modules, and without common modules, you implement the same logic over and over again.

**1.3 Without tests you need to run the whole system to test even a small function update**

You add an edge case in the depth of your program. This edge case happens on super-rare data. You have two options:

- wait, till the case happens
- write mock code, that will provide the program with the data, and then remove the code

Both options are slow as hell.

**I hope now I sold you unit testing, if not, please, ask questions below**

# Important rule to remember: Do not change old tests, without consulting with a Maintainer. They were written for a reason and define the correct way the system expects to behave.

## Test-Driven Development
We all practice TDD. This means we first write an automated test that fails, and then write code, so it passes:
1. Write a test, and make it fail
2. Rush and write code that makes the test green as soon as possible
3. Refactor the code, so it would be clean
4. Repeat

This called the `TDD loop`. It repeats many times during a spider's development. The size of the initial test can be small, then comes small code, then small refactoring, eg you are not expected to write all the tests from start. Move in small incremental steps.

The TDD loop will speed you up drastically, but you will have to spend some time on initial learning.

Check some lectures of Uncle Bob, I think he gives a good introduction to the topic. There is some outdated stuff, but some ideas are immortal.
- [The Three Laws of TDD](https://www.youtube.com/watch?v=qkblc5WRn-U)
- [Clean Code - Uncle Bob / Lesson 1](https://www.youtube.com/watch?v=7EmboKQH8lM)

# What's next
- [Automated Testing with Python](Automated-Testing-with-Python.md)

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=Introduction-to-Automated-Testing.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
