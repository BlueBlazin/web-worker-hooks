# ⚛️ web-worker-hooks

React hooks for running code inside web workers without needing to eject CRA apps.

---

## Table of contents

- [Installation](#installation)
- [Introduction](#introduction)
- [Usage](#usage)
  1. [useWorker](#useWorker)
  2. [useWorkerTimeout](#useWorkerTimeout)
  3. [useWorkerInterval](#useWorkerInterval)
  4. [usePureWorker](#usePureWorker)
- [Example](#example)
- [Limitations & Pitfalls](#limitations-and-pitfalls)
- [API Reference](#api-reference)

---

## Installation

```sh
npm install web-worker-hooks
```

---

## Introduction

`web-worker-hooks` aims to provide simple but powerful easy-to-use hooks for running tasks in web workers without needing to eject apps bootstrapped with Create React App.

The library provides elegant drop-in replacements for `setTimeout` and `setInterval`. The `useWorker` hook gives you full control over Web Worker message passing. `usePureWorker` provides a clean way to run a compute intensive function in a worker thread, and unblock the UI.

---

## Usage

This package provides a suite of hooks to perform background tasks in Web Workers.

Starting with the most general hook

1. #### `useWorker`

```jsx
function App() {
  const worker = useWorker((postMessage, setOnMessage) => {
    setOnMessage((msg) => {
      postMessage([msg.data, "Hello from worker."]);
    });
  });

  React.useEffect(() => {
    worker.onmessage = (msg) => {
      console.log(msg.data);
    };

    worker.postMessage("Hello from main.");
  }, []);

  ...
}
```

The function provided to the hook gets called immediately inside a web worker. It receives two arguments, `postMessage` which shadows the `postMessage` function available on the worker scope. And a `setOnMessage` function which can be used to set `onmessage`.

The hook returns a plain `Worker` object so all its methods are available for use.

2. #### `useWorkerTimeout`

```jsx
function App() {
  const [count, setCount] = React.useState(0);
  const clearTimeout = React.useRef(() => {});
  const workerSetTimeout = useWorkerTimeout();

  React.useEffect(() => {
    function startTimer() {
      clearTimeout.current = workerSetTimeout(startTimer, 1000);
      setCount((c) => c + 1);
    }
  }, []);

  return (
    <div>
      <div>{count}</div>
      <button onClick={() => clearTimeout.current()}>Stop Timer</button>
    </div>
  );
}
```

The hook takes no arguments and returns a near drop-in replacement for `window.setTimeout`. The main difference is that calling `workerSetTimeout` will return a function which can be called for clearing the timeout instead of needing to call `window.clearTimeout`.

3. #### `useWorkerInterval`

Identical to `useWorkerTimeout` except that it calls `setInterval`.

4. #### `usePureWorker`

```jsx
function fib(n) {
  if (n < 2) {
    return n;
  }
  return fib(n - 1) + fib(n - 2);
}

function App() {
  const workerFib = usePureWorker(fib);

  React.useEffect(() => {
    workerFib(42).then((result) => console.log(result));
  }, []);

  ...
}
```

The `usePureWorker` hook can be used to easily create functions that can run a compute intensive pure-ish function when called and return a Promise which will resolve to the result of the computation from the worker.

---

## Example

<a href="https://codesandbox.io/s/web-worker-hooks-example-yefcp" target="_blank">
  <img alt="Edit 5v9yoz7xn4" src="https://codesandbox.io/static/img/play-codesandbox.svg">
</a>

![example gif](https://raw.githubusercontent.com/BlueBlazin/web-worker-hooks/master/pure-worker-example.gif)

---

## Limitations and Pitfalls

1. The main limitation currently is that **you cannot import external libraries** into your workers. This can be a dealbreaker for your usecase so please consider it before installing. You may need to eject your CRA app if you must use a library inside your worker.
2. There is an invisible barrier between the worlds of the function provided to `useWorker` or `usePureWorker` and the main thread. You cannot use any variables or functions defined outside, in the function you pass to run inside the web worker. The `useWorkerTimeout` and `useWorkerInterval` functions don't suffer from this shortcoming since they don't run the callback in a worker thread. Only the timer itself is run in the worker.

---

## API Reference

### `useWorker`

### Import

```js
import { useWorker } from "web-worker-hooks";
```

Parameters:

1. `workerFunction: (postMessage, setOnMessage) => void` - workerFunction is a function that takes two arguments.
   - `postMessage: (msg: any) => void` - The function shadows the `postMessage` function on the worker scope.
   - `setOnMessage: (messageHandler) => void` - Pass it a handler to set `onmessage` on the worker.

Returns:

1. `Worker` - The worker object. This is a standard web worker object that can be used from the main thread like you normally would.

---

### `useWorkerTimeout`

### Import

```js
import { useWorkerTimeout } from "web-worker-hooks";
```

Returns:

1. `workerSetTimeout: (handler: Function, timeout: number) => cancelTimeout` - A function that can be used much like `window.setTimeout`. It takes a handler and a timeout duration as arguments and returns a function that can be called to cancel the timer.

---

### `useWorkerInterval`

### Import

```js
import { useWorkerInterval } from "web-worker-hooks";
```

Returns:

1. `workerSetInterval: (handler: Function, timeout: number) => cancelInterval` - A function that can be used much like `window.setInterval`. It takes a handler and a timeout duration as arguments and returns a function that can be called to cancel the timer.

---

### `usePureWorker`

### Import

```js
import { usePureWorker } from "web-worker-hooks";
```

Parameters:

1. `pureFunction: Function` - A function that takes zero or more arguments and produces a result from them (without relying on external state).

Returns:

1. `workerPureFunction({ args, transfer = [] }) => Promise` - An abstraction over running the supplied pure function in a web worker / background thread. The function takes a single object as argument with two properties:

   - `args: any[]` - A list of arguments that will be passed to the pure function call. **NOTE:** The pure function will not be passed the list itself, just the values as separate arguments.
   - `transfer?: any[]` - A list of `Transferable` values to transfer ownership. **UNSTABLE:** The API for this is still being worked out and will change.

   It returns a `Promise` that resolves to the result of the pure function.
