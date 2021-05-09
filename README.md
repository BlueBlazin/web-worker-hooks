# ⚛️ web-worker-hooks

React hooks for running code inside web workers without needing to eject CRA apps.

---

## Installation

```sh
npm install web-worker-hooks
```

---

## Usage

This package provides a suite of hooks to perform background tasks in Web Workers.

Starting with the most general hook

1. `useWorker`.

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

The function provided to the hook gets called immediately inside the worker It receives two arguments, `postMessage` which shadows the `postMessage` function available on the worker scope. And a `setOnMessage` function which can be used to set `onmessage`.

The hook returns a plain `Worker` instance so all its methods are available for use.

2. `useWorkerTimeout`

```jsx
function App() {
  const [count, setCount] = React.useState(0);
  const clearTimeout = React.useRef(() => {});
  const workerSetTimeout = useWorkerTimeout();

  React.useEffect(() => {
    function startTimer() {
      // The timeout will be run in a worker thread
      clearTimeout.current = workerSetTimeout(startTimer, 1000);
      setCount((c) => c + 1);
    }
  }, []);

  return (
    <div>
      <div>{count}</div>
      <button onClick={() => clearTimeout.current()}>Cancel Timer</button>
    </div>
  );
}
```

The hook takes no arguments and returns a near drop-in replacement for `window.setTimeout`. The main difference is that calling `workerSetTimeout` will return a function which can be called for clearing the timeout instead of needing to call `window.clearTimeout`.

3. `useWorkerInterval`

Identical to `useWorkerTimeout` except that it calls `setInterval`.

4. `usePureWorker`

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
