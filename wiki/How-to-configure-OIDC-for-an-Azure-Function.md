OIDC – is a modern robust protocol for authentication. But it's kinda hard to configure for an Azure function:

- open [https://resources.azure.com/](https://resources.azure.com/)
- enable file auth config
  using [instruction](https://docs.microsoft.com/en-us/azure/app-service/app-service-authentication-how-to#enabling-file-based-configuration)
  , name your config "auth.json"
- create "auth.json", add it to repo, and fill it
  using [instruction](https://docs.microsoft.com/en-us/azure/app-service/configure-authentication-provider-openid-connect#-add-provider-information-to-your-application)
- you can find all "auth.json" structure
  description [here](https://docs.microsoft.com/en-us/azure/app-service/app-service-authentication-how-to#configuration-file-reference)

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=How-to-configure-OIDC-for-an-Azure-Function.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
