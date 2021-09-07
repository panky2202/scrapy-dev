We try host all our services in Azure cloud. Azure - is our main cloud provider. In this document we will describe our
Azure infrastructure.

## Resource group

All resources in Azure grouped by "Resource group". Consider Resource group as a folder, that holds filed-resources. We
have 2 main Resource groups:

- `GMD-Staging` is our staging environment. All devs should have free access to it. Do not keep valuable data in the
  staging environment, do not store there something you're afraid to lose and make public. Consider all resource and
  data in staging as public. Here we can freely run all our dev tests without fear of breaking something.
- `GMD-Production` is our production environment. Only top trusted devs should have access to it. We keep here valuable
  data and resources we can't publicly share.

`GMD-Staging` tries to mirror `GMD-Production` setup. That way devs can develop products without fear of breaking
production.

## Main Resources

We create lots of different Azure resources and store them in "Resource groups". The main resources are:

- `App Service plan` it's like a computer. You can run cloud applications on it, but unlike a real dedicated computer
  this thing can infinitely scale. Keep in mind, that you can't put Serverless plan into vnet, you need to make Premium
  plan to be able to use vnet. Serverless plan is cheaper, but there are several features that you can't do with
  Serverless plan.
- `SQL server` just a MSSQL server. Can have databases inside.
- `Function App` core of our system. Function app allows to run code in the Azure cloud. Needs a `App Service plan`
  and `Storage account` to exist. There are two main types of functions: with custom Docker container and without it.
  You can't run custom Docker container on Serverless `App Service plan` plan. You also can't use vnet on the Serverless
  plan.
- `Application Insights` this thing can store logs, it also allows using Kusto Query Language to search in these logs.
- `Storage account` this allows to store binary data in the Azure cloud, huge amount of binary data. It also
  stores `Function App` bodies. You can add triggers that will execute `Function App` on new data added to
  a `Storage account`. You can host static website in a `Storage account`. You can attach `CDN` to a `Storage account`.
- `Virtual network` aka vnet. It's like your own private internet: all resources can see each other, but not available
  from external Internet. This is secure, however it costs $. VNet Gateway will cost about $150/month, if you want to
  access it with OpenVPN.
- `Virtual network gateway` you will need it, if want to access vnet from regular internet. Costs at least $150/month.
  Needs 45 minutes to install. You can't use Basic SKU with OpenVPN, you need higher plans. You will need to configure "
  Point-to-site configuration", there chose OpenVPN tunnel type. You will need
  to [create root certificates, and generate client's certificates](https://docs.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-certificates-point-to-site-linux)
  . Then you will need to convert caCert.pem to base64 and put it into "Public certificate data". After it, you will
  need to press "Download VPN client". There will be "*.ovpn" file. Open it with text editor and add client's cert and
  key to it. Do not forget to copy "-----BEGIN/END CERTIFICATE-----" and "-----BEGIN/END RSA PRIVATE KEY-----" strings.
  Then you can use "*.ovpn" file with any OpenVPN client, it will make you secure connection, treat this file as a
  password. You can't use Private DNS for OpenVPN connections and will need a private db IP address to access db in
  vnet. You will need to create a Private Endpoint for the db you want to access. Important notice: for example your SQL
  login is `gmdUser`. If you want to use it in vnet under OpenVPN you will need to write it as
  `gmdUser@gmd-test-server.privatelink.database.windows.net` where the second part after @ is your Private Endpoint
  Private Domain.
- `Cognitive Services` here we host our Computer Vision resources. Allows performing OCR.
- `CDN` the fastest way to destitute binary data over internet. The main idea: make lots of copies of your data and keep
  them near your customers to access them with low latency and high speed.

## Security

Our main valuable asset is data in the SQL Production database. We should prevent the db access and data leakage. Focus
all your security efforts on the data protection.

The best way to protect the database is to put it into a vnet, and restrict connections to OpenVPN. However, this will
cost at least $150/month, which is unreasonable in the current state.

### Production DB

Current security:

- We use admin login/password
- We use a firewall and restrict IPs who can access the database

However, we have a vulnerability in the firewall rules:

- We allow users to access to our db with IP ranges. This is ok, but not 100% secure, the IP could be spoofed
- We use “Allow Azure services and resources to access this server” check. We need it, cuz we want our backend to access
  our DB, but the backend do not have fixed IP. This one is security threat, cuz it will allow access from ANY azure IP,
  if even it is not our application. Someone could run its own application in Azure cloud and this rule will allow the
  access. Hacker will still need login/password tho, but they could be obtained from devs that are not longer work with
  us. Basically this option disables firewall IP ranges

### Staging DB

Current security:

- We use admin login/password
- We use a firewall and restrict IPs who can access the database. However, public GitLab runner IP's added to the
  firewall

There is no firewall, staging db allows access to it from Internet. This is needed cuz we want to run integration tests
from GitLab on our staging database.

You can find staging db credentials [here](https://gitlab.com/engaging/scrapy/-/blob/dev/data_processing/packages/gmd-backend/local.settings.json)

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=Azure-Infrastructure.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
