[![](https://img.shields.io/circleci/build/github/crazytoucan/tinysaga)](https://app.circleci.com/pipelines/github/crazytoucan/tinysaga?branch=develop)
[![](https://img.shields.io/npm/v/tinysaga)](https://www.npmjs.com/package/tinysaga)

# tinysaga

Simple state and logic management library for modern React apps.

## Installation

```sh
$ yarn add tinysaga
```

Comes with TypeScript typings out of the box, as well as ESM support and tree shaking.

## Overview

Tinysaga is the no-frills state management solution for modern React apps.
Users of [Redux](https://redux.js.org/), [React Redux](https://react-redux.js.org/), and [Redux-Saga](https://redux-saga.js.org/) will be familiar with Tinysaga's constructs and ideas.

Out of the box, Tinysaga includes the following pieces:

* A `Store` class which allows the user to update state and subscribe to changes. Its view-facing API is identical to that of Redux.
* React integration via a Store `<Provider>` and familiar `useDispatch()` and `useSelector()` hooks.
* Logic handling infrastructure via familiar `Channel` and `put()`/`on()` patterns.
* Builtin strong Action typing on all of the above to make dispatching and handling actions more fluent in TypeScript.

## Comparison to Redux-Saga

Redux-Saga is a great library which allows applications to manage the complex state updates and side effects that happen in many React-Redux applications. It is a crucial part of the current frontend software stack.

However, the library itself is quite complex, which can cause problems in the following ways:

1. Developers onboarding into a Saga-based codebase may need to understand the Saga fork and threading model pretty deeply in order to contribute to the code. This creates cognitive overhead for even the best developers.
2. The effect model can be surprising to unravel. For example, sending a callback to external code becomes a lot more complex as developers need to reason about how to invoke effects from within the callback.
3. The syntax itself can be challenging and unfamiliar, such as `yield` and `yield*`, or why you would want to `yield take` inside of a `while (true)` loop.
4. The code can be very hard to debug, especially in modern compile-to-ES6 toolchains where the generators become obfuscated. Stepping through code can be a chore, and profiling code through many layers of effect realization can be a nightmare.

Tinysaga supports most of the common `put()` and `on()` workflows, along with `take()` and `takeAdvanced()` sugar, without necessitating generators through your codebase.
This allows the programmer to implement his or her logic through the tried-and-true event bus architecture, with the help of well-understood plain JavaScript utilities like Lodash for debouncing, throttling, and cancellation, without opening your organization up to the long-term tooling and execution risk that comes with newer technologies like generators.

## License

MIT
