Do not disclose private information here, consider this document as public. For private stuff make a private google doc.

In this document, we should start to describe GMD Business on paper. Currently, new developers have a hard time learning about GMD business side of things. This limiting them to produce optimal solutions. If we are able to describe the business, we could easily onboard new developers, and allow them to find the best solutions.

The main rule is simple: the more developers understand the business, the more money they will produce.

# Questions
## 1. How GMD makes money?
> Importing containers of products with his company (YOUNG) and reselling them with the stores (he has +6, Zara, El Passo, etc). 

This needs a bit more description.

- why companies buy from GMD?
- what is the main competitive advantage of GMD?
- how GMD price its products?
- how GMD choose where to buy products on what price?
- what is GMD's logistics?
- what is the physical location of all these businesses? Is the operation international?
- what are many other peculiarities of GMD's business? (eg, there should be 0 products in the warehouse. what is turnover, etc)

## 2. Why do we collect the UPC data?
> Pauls needs a point of sales system to facilitate sales.

This needs a bit more description. What data we collect and how we will use it. And how GMD extracts profit from this. For example, why the world needs one more point of sales when there are dozens on market.

## 2.1. Daily GMD workflow
- what people work there and what they physically do every regular day. For example, there is a worker in the warehouse, what is he doing. And this worker has to price items? And we give him an app to price items and his life is a bit better? How is it happening? Currently, I'm not sure how people will use POS, or what are their day-to-day duites.

## 3. Bigger picture. What are GMD's plans on scaling?
Also, I assume we are looking to persuade investors to give some money. How is it happening? What investors seek? What investors need to see, before give us money?

## 4. What GMD history and current state?
- is it an old company?
- where is it located?
- how many people involved in the company?
- who made it and why?

## 5. How Ultimate Sync makes GMD money?
There is a big SQL function. This function basically does some magic data transformations. This function is crucial and evolves often (please confirm). This function is not covered with tests.

> it is joining data from 7 places to build the Ultimate table;
> which should be Ultimate View instead;
> Ultimate is the input for Point of Sales;
> which is for each product = Cost vs sales price per store level;

Idea here:
- Currently, it is hard to evolve this function. But business will require to change it a lot (please confirm). So we will need to cover this function in tests and move it to TypeScript, this will open the possibility of cheap evolving.

To move the function from SQL to TypeScirpt we will need to understand the business aspect under it.

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=GMD-Business.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
