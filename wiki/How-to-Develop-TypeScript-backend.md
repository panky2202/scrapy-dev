**Making TypeScript backend is easy!**

Traditionally systems have heavily separated frontend from backend, eg, in one git repo you will find a React frontend,
and in another you will find Node backend. We use different approach. We use **Monorepo Vertical Slice Architecture**
setup. Read this article to know what the heck it means.

# Main Concepts

You should be familiar with several concepts, before starting to improve our system.

## Monorepo

All the system code can be found in one git repo. Backend, frontend, document parsers, web scrapers all these projects
live in one repo. This has three main benefits:

- It is easy to work with 1 repo. That what it sounds. One folder. One CI/CD pipeline. One set of rules and access
  rights. Etc. It saves us tons of time on managing stuff
- It is easy to share code between projects. You made a handy React component? Put it in a common folder, now all
  projects has access to it
- Atomic updates. Usually new business features impact multiple system layers, eg, a new feature will need UI update and
  backend update. In a monorepo you can pack all this new code in one merge request
- All developers have access to all the code. This allows devs to learn from each
  other, [It forces the conversation, and makes trade-offs visible](https://medium.com/@adamhjk/monorepo-please-do-3657e08a4b70)
  . You can make impact in all system layers without need to switching projects, and this is super important for
  Vertical Slice Architecture

## GraphQL

To pass data between front and back you need some protocol. Usually it is a simple REST. However, we use something much
cooler and powerful: GraphQL. Read [GraphQL vs REST](GraphQL-vs-REST.md) for more info.

The central part of GraphQL is a GraphQL schema. It's a file, that describes your protocol with a special language
GraphQL SDL. This file could be compiled to TS types. This file will also be compiled to documentation. Do not confuse
GQL Schema with TS Schema, that will be described later.

GQL server will automatically provide a playground - a web UI for devs to play with an API. Eg, you can send command to
your backend, read consistent documentation from your browser. This is super handy and speeds up development process.

## Vertical Slice Architecture

Programs are living organisms. They are not static, they are constantly evolving, changing, shifting. The goal of any
program architecture is to make all future changes cheap. To make them cheap, you need to foresee them. We can 100%
foreseen them tho, but we can find some patterns.

Usually business evolves in features. Eg, GMD asks you to add "barcode scanner feature", when a user can scan a barcode
from his device and receive the scanned item price. Usually these features impact all system's layers. Eg, the barcode
scanner will need a UI, backend, and some SQL tables. Knowing this we can structure our project that way, that the
features are easy to add. Eg, adding a new feature will not cause a cascade change of all prev features.

[Vertical Slice Architecture](Vertical-Slice-Architecture.md) does exactly the thing above: it allows adding new
features that impact multiple layers (UI/Back/Persistence) without causing cascade change in the system.

## What's next

- [Introduction Into TypeScript Vertical Slice Architecture](Introduction-Into-TS-Vertical-Slice-Architecture.md)
- [How to Run Backend Locally](How-To-Run-Backend-Locally.md)
- [How to Test Time Trigger Functions](How-to-test-time-trigger-functions.md)

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=How-to-Develop-TypeScript-backend.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
