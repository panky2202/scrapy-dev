# How to test time-trigger functions

When working with Azure Function App you have ability to build Time Triggers – special functions that will execute
periodically.

Imagine you are working on a reporting feature. This feature is being triggered once a day. How can you test it without
waiting a whole day to the trigger to happen?

You have 2 options to trigger a time trigger prematurely:

## 1. Use Azure portal UI

This is the most convenient method to trigger a function

- Open your application
- Press Functions
- Open your time trigger function
- Press Code + Test
- Press Test / Run
- Add json params if needed
- Press Run

![](uploads/How-to-test-time-trigger-functions/azure%20trigger%20ui.png)

However, if your function executes more than approximately 2 min, the function call will be cancelled mid air and you
will get no results. For >2 min calls you need the method 2

## 2. Use CURL

You need to send a specially formatted POST HTTP request to Azure that will trigger the function. You can read more
about it in the
article [Manually run a non HTTP-triggered function](https://docs.microsoft.com/en-us/azure/azure-functions/functions-manually-run-non-http)
.

- You need your APP_NAME
- You need your FUNCTION_NAME
- You need to get your `x-functions-key` from the App config
- Make sure you data containing `{ "input": "test" }`

The bash command looks like this:

```
curl \
  --header "Content-Type: application/json" \
  --data '{ "input": "test" }' \
  --header "x-functions-key: ...PUT YOUR KEY HERE..." \
  --request POST \
  https://APP_NAME.azurewebsites.net/admin/functions/FUNCTION_NAME
```

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=How-to-test-time-trigger-functions.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
