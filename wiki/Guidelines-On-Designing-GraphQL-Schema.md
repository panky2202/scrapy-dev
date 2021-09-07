Here you can add useful links and concepts about GraphQL

We assume you know:
- [How to read GraphQL schema](https://www.apollographql.com/docs/apollo-server/schema/schema/)

## Guidelines on designing GraphQL schema
Took them from this video [Shopify dev on how to design GraphQL API](https://www.youtube.com/watch?v=mqaz6vmAGis&list=WL&index=1&t=1s), recommend for watching.
1. Never expose implementation details in your API design
2. It's easier to add elements than to remove them
3. Group closely-related fields together into their own type
4. Look forward, to the future. Can you see a time when a list field might need to be paginated?
5. Use object referencies instead of id fields
6. Choose field names based on what makes sense, not based on the implementation or what the field may be called in legacy APIs
7. Use enums for fields that can only take a specific set of values
8. The API should provide business logic, not just data. Complex calculations should be done on the server (in one place), not on the client (in many places).

Also, check this extremely useful [GraphQL Design Tutorial from Shopify](https://github.com/Shopify/graphql-design-tutorial).

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=Guidelines-On-Designing-GraphQL-Schema.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
