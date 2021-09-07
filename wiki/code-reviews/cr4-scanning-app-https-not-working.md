# CR4: Scanning App HTTPS not working

- From: Guilherme
- To: Aleksey


# Inquiry

Basically separated the hooks from the UI now the tests work and the app also works, which is good
Can you please check if I did the right thing? Because I'll replicate it on the other UIs I pushed the thing
in this branch

# Files In Review

- gmd-frontend\package.json

# Review

The "dev:https" script is not working properly. It gives us cors error when the app tries to connect to the backend using https.
Https is necessary if we want to test the app through our phones with camera access. If we connect our phones to the http app, it does not allow camera usage.

# Solution

Check why https server is being blocked by cors. I checked that there is a https-server.js file that starts a local server. Maybe it is an ip related problem, or the problem is the fact that the server runs from our local machine and tries to access an azure database. This has to be investigated further.

# Conclusion

We cannot test the scanning app using https as it is blocked by cors policy. We have to investigate further the reason behind the block and solve it to make testing easier.
