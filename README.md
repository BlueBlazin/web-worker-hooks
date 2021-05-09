# ⚛️ web-worker-hooks

React hooks for running code inside web workers without needing to eject CRA apps.

---

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
  1. [useWorker](#useWorker)
  2. [useWorkerTimeout](#useWorkerTimeout)
  3. [useWorkerInterval](#useWorkerInterval)
  4. [usePureWorker](#usePureWorker)
- [Example](#example)

---

## Installation

```sh
npm install web-worker-hooks
```

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

![example gif](https://raw.githubusercontent.com/BlueBlazin/web-worker-hooks/master/example.gif)
