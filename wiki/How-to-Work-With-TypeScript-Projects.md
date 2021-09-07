To start working on TypeScript projects you will need:

# Requirements

- node
- yarn. **We don't use npm**. Yarn has workspaces, and generally faster

# Getting Started With TS

Open your terminal and run:

### Unix based OS

- `yarn install`
- `yarn test` - this will run unit tests

### Windows

- `yarn install-windows`
- `yarn run build-windows`
- `yarn test`

This will install all dependencies, build all projects, and run all unit tests. If all the tests are green, you have
successfully installed the repo and good to go.

# File Structure

- `./basic-utils` common code for all TS projects
- `./gmd` the main project. It uses [Vertical Slice Architecture](Vertical-Slice-Architecture.md). Thus you can find and
  backend and frontend code here.
- `./gmd-backend` deploys backend parts of `./gmd` to Azure Serverless Function
- `./gmd-frontend` deploys frontend parts of `./gmd` to Azure CDN

# package.json

All the TS projects will contain `package.json` files. These files specify dependencies, but most importantly they
specify useful `scripts`. For example `./gmd-backend/package.json` will contain `dev` script, that will run the backend
locally. Always check scripts for useful tools.

# What's next

- [Introduction Into TypeScript Vertical Slice Architecture](Introduction-Into-TS-Vertical-Slice-Architecture.md)

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=How-to-Work-With-TypeScript-Projects.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
