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

## Examples

### Making a network call

```ts
const FetchUser = defineAction<{ userId: string }>("FetchUser");
const FetchUserSuccess = defineAction<{ data: IUserData }>("FetchUserSuccess");
const FetchUserFailed = defineAction<{ message: string }>("FetchUserFailed");

on(emitter, FetchUser.TYPE, async ({ userId }) => {
  // Note: `userId` and all of these calls are type-aware! No saga ReturnType shenanigans
  try {
    const data = await Api.fetchUser(userId);
    put(emitter, FetchUserSuccess({ data }));
  } catch (e) {
    put(emitter, FetchUserFailed({ message: e.message }));
  }
});
```

### Closing a popover unless the user mouses into it or its anchor

This snippet shows how multiple action types can be combined to implement complex behavior. Here we use `lodash.debounce()` for most of the heavy lifting.

```ts
const DismissPopover = defineAction("DismissPopover");
const PopoverAnchorEnter = defineAction("PopoverAnchorEnter");
const PopoverEnter = defineAction("PopoverEnter");

function popoverHandler(emitter: IEmitter) {
  const debouncedHide = lodash.debounce(() => {
    store.setState({ ...store.state, popover: undefined });
  }, 500);

  on(emitter, DismissPopover.TYPE, () => {
    debouncedHide();
  });

  on(emitter, PopoverAnchorEnter.TYPE, () => {
    debouncedHide.cancel();
  });

  on(emitter, PopoverEnter.TYPE, () => {
    debouncedHide.cancel();
  });
}
```

For comparison, equivalent Redux-Saga code is something like:

```ts
const DismissPopover = defineAction("DismissPopover");
const PopoverAnchorEnter = defineAction("PopoverAnchorEnter");
const PopoverEnter = defineAction("PopoverEnter");

function popoverSaga() {
  yield fork(function* () {
    while (true) {
      yield takeLatest(DismissPopover.TYPE, function* () {
        const { pass } = yield race({
          anchorEnter: take(PopoverAnchorEnter.TYPE),
          enter: take(PopoverEnter.TYPE),
          pass: delay(500),
        });

        if (pass) {
          yield put(DismissPopoverInternal()); // goes off to a reducer somewhere
        }
      };
    }
  });
}
```
