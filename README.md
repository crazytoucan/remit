[![](https://img.shields.io/circleci/build/github/crazytoucan/tinysaga)](https://app.circleci.com/pipelines/github/crazytoucan/tinysaga?branch=master)
[![](https://img.shields.io/npm/v/tinysaga)](https://www.npmjs.com/package/tinysaga)

# tinysaga

Simple state update pattern for modern React apps.
Allows for updating both immutable state as used by React-Redux and mutable state for computationally intensive desktop applications.
No generators.

## Installation

```sh
$ yarn add tinysaga
```

Comes with TypeScript typings out of the box, as well as ESM support and tree shaking.

## Motivation

Redux-Saga is a great library which allows applications to manage the complex state updates and side effects that happen in many React-Redux applications. It is a crucial part of the current frontend software stack.

However, the library itself is quite complex, which can cause problems in the following ways:

1. Developers onboarding into a Saga-based codebase may need to understand the Saga fork and threading model pretty deeply in order to contribute to the code. This creates cognitive overhead for even the best developers.
2. The effect model can be surprising to unravel. For example, sending a callback to external code becomes a lot more complex as developers need to reason about how to invoke effects from within the callback.
3. The syntax itself can be challenging and unfamiliar, such as `yield` and `yield*`, or why you would want to `yield take` inside of a `while (true)` loop.
4. The code can be very hard to debug, especially in modern compile-to-ES6 toolchains where the generators become obfuscated. Stepping through code can be a chore, and profiling code through many layers of effect realization can be a nightmare.

Tinysaga supports most of the common `put()`, `takeEvery()`, and `take()` workflows from Redux-Saga, leaving only the most complex uses (like debouncing, throttling, and cancellation) to other sophisticated libraries using plain old JavaScript.

## Design

At its core, Tinysaga is really just an event bus that integrates into React-Redux.

- Dispatched Actions from React-Redux (or from other external sources, like a WebSocket or ticking timer) are sent to the Tinysaga `Emitter`.
- The `Emitter` is wired up with handlers for each Action `type` in your application. Those handlers are free to do whatever they want, such as reducing a Store's state, changing any mutable state you have, or dispatching other actions.

There are a set of helpful Effects that Tinysaga exports, such as `take()` and `once()` which allow you to compose the low-level Emitter primitive into more powerful constructs. No generators involved.
