Key factor that allows to scale software production:

- automated testing
- automated deployment
- developers have freedom to make key decisions themselves
- management is focused on explaining context, and not on giving tasks

## Rules of thumb

- If you want to write something: grab an example that you like from nearby; copy it; refactor it. Generally, try to
  repeat the clean code you see around. Not all the code will be clean tho. With experience, you should start cleaning
  around mistakes you see
- Delete all unused code you see, don't push unused code/imports to git. This is extremely important for smooth
  refactoring. Imagine you have a huge feature that busses no longer uses. If you leave this feature in a repo, each
  refactoring of common library will require developers to update this useless feature, or CI/CD will fail. This drains
  resource. Unused code drains teams resources on updates during refactoring, and adds cognitive load.
- Feel stuck/confused? ask for help! The help will come, but with a huge delay tho, we are 100% remote team in different
  timezones
- Try to avoid state/value
  mutation. [An article on the subject](https://medium.com/dailyjs/the-state-of-immutability-169d2cd11310)
- Try to split your code into more functions
- Try to split your code into more variables
- Try to split your code into more modules
- Practice Test-Driven Development
- Do not change old tests without consulting with a Maintainer. They were written for a reason and define the correct
  way the system expects to behave
- More communication with other devs generally is a good thing
- Don't commit any credentials to git. Consider all git data public

## What your management wants

To make it easier to accept merge requests, you should think and write code that way, so it would be easier to review.
This means:

- All complex logic should be covered with unit tests, thus a Maintainer can just check, that tests output expected
  results, and have edge cases covered. Without the tests, Maintainer will need to debug your code, to understand, that
  it is correct
- Lots of functions and variables names. More names you add to the code - easier it is understood, what it does. Don't
  use comments tho, comments are not validated with the compiler and can become stale

## Guides and Articles

- [Code Review Rules](Code-Review-Rules.md)
- [Introduction to Automated Testing](Introduction-to-Automated-Testing.md)
- [Introduction Into TypeScript Vertical Slice Architecture](Introduction-Into-TS-Vertical-Slice-Architecture.md)
- [Automated Testing with Python](Automated-Testing-with-Python.md)
- [Code Navigation Guide](Code-Navigation-Guide.md)
- [Refactoring Guide](Refactoring-Guide.md)
- [Understand Software Architecture in 15 Minutes or Less
  ](Understand-Software-Architecture-in-15-Minutes-or-Less.md)
- [Branch Name Convention](Branch-Name-Convention.md)
- [Agile Workflow](Agile-Workflow.md)
- [How To Setup Python Virtual Environment](How-To-Setup-Python-Virtual-Environment.md)
- [Code Style](Code-Style.md)
- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [Double Your React Coding Speed With This Simple Trick](https://javascript.plainenglish.io/double-your-react-coding-speed-with-this-simple-trick-ca2e47d1bf97)
- [Parse, don’t validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)
- [GraphQL vs REST](GraphQL-vs-REST.md)
- [Guidelines On Designing GraphQL Schema](Guidelines-On-Designing-GraphQL-Schema.md)
- [TypeScript Dependency Injection](TypeScript-Dependency-Injection.md)
- [Design things that way, that they will be easy to use](Design-things-that-way-that-they-will-be-easy-to-use.md)
- [How SQL](How-SQL.md)
- [How to Test Time Trigger Functions](How-to-test-time-trigger-functions.md)

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=Scalable-Software-Development-Guide.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
