https://headspring.com/2019/11/05/why-vertical-slice-architecture-is-better/

In the nutshell `gmd` package consists of `features`. Each feature consists of multiple layers:

- ui
- application
- domain
- infrastructure

# Vertical Slice Architecture

Business tends to think and evolve in features: add this screen, add this form, this promo code discount, etc. Our
systems also tend to evolve by feature, cuz the systems are linked to the business.

However, with the most currently popular onion/hexagon/clean architecture developers tend to think of a system as
independent layers: UI, persistence, domain, application.

Developers group things according to their layer, or their type. By default, developers prefer "Logical cohesion". They
group UI stuff with UI, domain with domain, images with images, resolvers with resolvers, controllers with controllers.

Things that live together tend to become coupled. Thus with layered architecture things in a layer become coupled.
Layers are decoupled from each other, but coupled inside. And from here arises the issue.

Each, even small, new feature or change touches all the layers: UI, application, domain, infrastructure. If we want to
add a new feature, we need:

- to update our domain business logic
- add new ui
- extend/update REST/GQL communication protocol
- store new data in SQL persistence layer

We need to touch every single system layer. Each feature is spread across every system layer.

But layers are coupled inside. Coupled things tend to change together. Thus by adding or changing a feature we may touch
every other feature in the system.

In a layered architecture, features are inherently coupled. And this is a big issue.

Business wants to add more and more features. But all these features are coupled thus each new change will cost more and
more effort. Until the development will hit a wall.

And this where the Vertical Slice Architecture will saves us.

The selling point of the Vertical Slice Architecture is that we strive to develop our apps by feature, and not by layer.
Thus we should group things by feature, not by layer.

Inside each feature, we still have our beloved layers, but the features are decoupled from each other.

## File Structure example

In our repo the slices look like file structure:

- features
    - barcode_reader
        - ui
        - application
        - domain
        - infrastructure
    - parsing
        - application
        - domain
        - infrastructure

`barcode_reader` and `parsing` are features. They consist of layers. As you can see each feature is not limited to even
one program. UI is run as React frontend and application as Node backend, but the code still live in one folder. This is
magic.

## What's next

- [Introduction Into TypeScript Vertical Slice Architecture](Introduction-Into-TS-Vertical-Slice-Architecture.md)

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=Vertical-Slice-Architecture.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
