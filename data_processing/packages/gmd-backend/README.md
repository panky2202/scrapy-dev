Run `yarn dev` for local development, and use `http://localhost:7071/dev/api/graphql` endpoint. Do not forget
the `/dev/` prefix in the URL! Check `proxies.json` for more info on this regard.

Pitfalls of deployment to Azure:

- do not forget to specify IPROCESSOR_CLIENT_SECRET in auth.json
- use proxies.json so back end front had the same domain. CORS *will not help* you if you will have different domains!
  You MUST have the same origin on front and back
- locally NEXT JS uses routes without .html, but on Azure all routes will have .html
- Azure storage account needs Premium tier to serve static content
