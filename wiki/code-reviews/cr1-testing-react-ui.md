# CR1: Testing React UI

- From: Aleksey
- To: Guilherme

## Inquiry

Basically separated the hooks from the UI now the tests work and the app also works, which is good

Can you please check if I did the right thing? Because I'll replicate it on the other UIs I pushed the thing
in [this branch](https://gitlab.com/engaging/scrapy/-/commit/dff88e7ac94523bba2a4a89b54701fe0760b382b)

## Files In Review

- [missingProducts.tsx](https://gitlab.com/engaging/scrapy/-/blob/dff88e7ac94523bba2a4a89b54701fe0760b382b/data_processing/packages/gmd/src/features/missing-products/ui/missingProducts.tsx)
- [missingProducts.spec.tsx](https://gitlab.com/engaging/scrapy/-/blob/dff88e7ac94523bba2a4a89b54701fe0760b382b/data_processing/packages/gmd/src/features/missing-products/ui/missingProducts.spec.tsx)

## Review

Impressive how fast you learn. Your components are composable. The render test is correct.

---

You have only “Should render without errors” which is a needed test, but we need more We need to know, that pressing all
the buttons work, and the data is displayed, and loading state works, etc, play around

---

```javascript
jest.useFakeTimers()
```

They act strangely, try to avoid them. Pain in ass to work with. I propose to use real timers, but move time-out to
deps, so you could configure 50ms timeouts so tests run faster

---

```javascript
jest.mock('next/router')
```

Mocking modules work. However, try to avoid it. Read
more [ here ](https://gitlab.com/engaging/scrapy/-/blob/dev/wiki/TypeScript-Dependency-Injection.md#di-allows-explicitly-mock-dependencies)

as you can see, router is hard to test, it’s like a web request, so, move it to deps Inject all hard to test
dependencies. router is well tested library and will work 10 times of 10, however it doesn’t allow unit test our
components. This is why we move such things in dependencies, and then validate with TS, that connections are fine

You can add “onCancel” and “onSubmit” dependencies to ConnectedMissingProductsUI, and inject there web request and redirect This
will allow you to test the component with unit tests And test the connection between the “web request” and “onSubmit”
with TS

- for UI test you only need to test, that by pressing a button you call a correct callback
- that text is shown on screen
- that some component is on screen

You do not need to test redirect, extract it

---

If you move ConnectedMissingProductsUI deps to a type, you can write like this:

```javascript
function ConnectedMissingProductsUI(deps: MissingProductsUIDeps) {
}

function useMissingProductUI(): MissingProductsUIDeps {
}

export function missingProducts(deps: {
  useAddMissingProduct: UseAddMissingProduct
  useQuery: UseQuery<any>
}) {
  return function ConnectedMissingProductsUI() {
    return (
      <ConnectedMissingProductsUI {...useMissingProductUI(deps)} />
    )
  }
} 
```

I also proposed to use Connected notation ui is: NAME hook is: useNAME()
connected ui is: ConnectedNAME

---

```
register: any 
```

better make a type for register callback and put it near form

---

If you show the snack bar on the bottom, then it will be hidden, if on iOS user has opened keyboard

Opinion, you may not implement this part:

In theory there is a better design option for this kind of things:
Components can be in different states:

- [ empty state ](https://material.io/design/communication/empty-states.html) - component has no data
- [ error state ](https://material.io/archive/guidelines/patterns/errors.html#errors-user-input-errors) - some error
  happened and component shows its error
- loading state - component is busy and thinking
- disabled state - component is disabled
- normal state - we have data, and we are interactive etc, there are like more you can think of

So, when you move the state to snack bar, you make your UI less composable and less intuitive. For example, what if we
have 2 lists on screen? Then we don’t know, which one made an error.

Check [ this component ](https://gitlab.com/engaging/monorepo/-/blob/development/packages/order-list-app/src/screens/OfferScreen/components/OfferScreen/OfferScreen.tsx)
, it has some different state example. Don’t replicate 1to1, you may do better

It is useful to think of components, as something that can be in several different states. In each state the component
acts a bit differently. Eg, displays error, show spinner, grey out, etc

Snack bar is for events that do not have components, I think. For something global.

In our case, mb it should work like this:
the product list has different states:

- if no product found, eg, empty state, then display a message and a button instead of a list of items.
- initial state contains instructions how to scan the product
- on error we show error message

---

Files should be named as the main exported thing missingProducts.tsx should be ConnectedMissingProductsUI in your case

---

```
autoCloseTime={1000}>
```

You ask a user to react fast I hate when I reading an error and it vanished in a second :D Id remove the timeout

---

Our code formattings are different, I have shorter lines

![](cr1/Screenshot%202021-07-09%20at%2011.28.28.png)
![](cr1/Screenshot%202021-07-09%20at%2011.28.36.png)

---
---

### :bulb: Help us to improve the Wiki
- Didn't find something?
- Explanations were not clear?

[Leave a feedback!](https://docs.google.com/forms/d/e/1FAIpQLScE_i7txZOlPgFhmnBOephz9hdhvnJDbXjmkKqnjRSjx_d8kg/viewform?usp=pp_url&entry.685765712=cr1-testing-react-ui.md)

---

[What is your favorite hobby or a computer game?](https://forms.gle/X4U9Jni6s3hfSW8e6) Answer, and find out the 
answers of others! 

---

*Let's automate the world :earth_asia:*
