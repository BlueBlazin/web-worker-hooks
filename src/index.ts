import React from "react";

type SerializablePrimitive =
  | boolean
  | null
  | undefined
  | number
  | bigint
  | string
  | SerializablePrimitive[];

type PlainObject = {
  [key: string]: SerializablePrimitive | PlainObject;
};

type StructuredClonable =
  | SerializablePrimitive
  | Date
  | RegExp
  | Blob
  | File
  | FileList
  | ArrayBuffer
  | ArrayBufferView
  | ImageBitmap
  | ImageData
  | Map<StructuredClonable, StructuredClonable>
  | Set<StructuredClonable>
  | PlainObject;

type WorkerPostMessage = (
  msg: StructuredClonable,
  transfers?: Transferable[]
) => void;

type MessageHandler = (msg: MessageEvent) => void;

type WorkerSetOnMessage = (messageHandler: MessageHandler) => void;

type WorkerFunction = (
  postMessage: WorkerPostMessage,
  setOnMessage: WorkerSetOnMessage
) => void;

type PureFunction<T = StructuredClonable, R = StructuredClonable> = (
  args?: T
) => R;

interface PureFunctionParams {
  args: StructuredClonable[];
  transfer: Transferable[];
}

/**
 * A hook for creating a web worker and executing specified code inside it.
 *
 * @param workerFunction The workerFunction parameter expects a function
 * which accepts two arguments:
 * 1. `postMessage` - A function that can be called with any web
 * Worker compatible message to be sent **to** the main thread.
 * 2. `setOnMessage` - A function that needs to be called with a handler
 * function to handle messages **from** the main thread.
 *
 * @returns An instance of `Worker`. This is a normal web worker
 * DOM object. You will need to manually set `Worker.onmessage` to
 * your message handler to handle messages from the worker thread.
 *
 * To post messages to the worker thread, you can use `Worker.postMessage`.
 */
export function useWorker(workerFunction: WorkerFunction) {
  const [worker] = React.useState(() => makeWorker(workerFunction));

  return worker;
}

function makeWorker(workerFunction: WorkerFunction) {
  const blobCode = `
      function setOnMessage(messageHandler) {
        self.onmessage = messageHandler;
      }
  
      (${workerFunction})(self.postMessage, setOnMessage);
    `;

  return makeWorkerFromBlobPart(blobCode);
}

function makeWorkerFromBlobPart(blobCode: string) {
  const blob = new Blob([blobCode], { type: "text/javascript" });
  const blobUrl = URL.createObjectURL(blob);

  const worker = new Worker(blobUrl);

  return worker;
}

/**
 * A utility hook for running `setTimeout` in a worker thread and
 * calling a handler/callback in the main thread when the timeout fires.
 *
 * Running `setTimeout` in the background thread will reduce tab throttling.
 *
 * @returns `workerSetTimeout`
 * A function that can be used as a near replacement for `window.setTimeout`.
 * It takes two arguments:
 * 1. `handler`: A callback for when the timeout fires.
 * 2. `timeout`: The duration after which to call the `handler`.
 *
 * Calling it will eturn a function that can be used to
 * cancel the timeout, similar to `window.clearTimeout(handle)`.
 */
export function useWorkerTimeout() {
  const worker = useWorker((postMessage, setOnMessage) => {
    let timeoutId: number;

    function startTimeout(timeout: number) {
      timeoutId = setTimeout(() => postMessage("TIMEOUT"), timeout);
    }

    setOnMessage((msg) => {
      if (msg.data[0] === "SET_TIMEOUT") {
        startTimeout(msg.data[1]);
      } else if (msg.data[0] === "CLEAR_TIMEOUT") {
        clearTimeout(timeoutId);
      }
    });
  });

  function workerSetTimeout(handler: () => void, timeout: number) {
    worker.onmessage = (msg) => {
      if (msg.data === "TIMEOUT") {
        handler();
      }
    };

    worker.postMessage(["SET_TIMEOUT", timeout]);

    return () => {
      worker.postMessage(["CLEAR_TIMEOUT"]);
    };
  }

  React.useEffect(() => () => worker.terminate(), []);

  return workerSetTimeout;
}

/**
 * A utility hook for running `setInterval` in a worker thread and
 * calling a handler/callback in the main thread when the timeout fires.
 *
 * Running `setInterval` in the background thread will reduce tab throttling.
 *
 * @returns `workerSetInterval`
 * A function that can be used as a near replacement for `window.setInterval`.
 * It takes two arguments:
 * 1. `handler`: A callback that's called every `timeout` miliseconds.
 * 2. `timeout`: The time in miliseconds between calls to `handler`.
 *
 * Calling it will return a function that can be used to
 * cancel the interval, similar to `window.clearInterval(handle)`.
 */
export function useWorkerInterval() {
  const worker = useWorker((postMessage, setOnMessage) => {
    let intervalId: number;

    function startInterval(timeout: number) {
      intervalId = setInterval(() => postMessage("TIMEOUT"), timeout);
    }

    setOnMessage((msg) => {
      if (msg.data[0] === "SET_INTERVAL") {
        startInterval(msg.data[1]);
      } else if (msg.data[0] === "CLEAR_INTERVAL") {
        clearInterval(intervalId);
      }
    });
  });

  function workerSetInterval(handler: () => void, timeout: number) {
    worker.onmessage = (msg) => {
      if (msg.data === "TIMEOUT") {
        handler();
      }
    };

    worker.postMessage(["SET_INTERVAL", timeout]);

    return () => {
      worker.postMessage(["CLEAR_INTERVAL"]);
    };
  }

  React.useEffect(() => () => worker.terminate(), []);

  return workerSetInterval;
}

/**
 * A hook for running a pure function in a web worker.
 *
 * @param pureFunction The pure function you want to run in the
 * background thread.
 *
 * @returns `workerPureFunction`
 * A function that when called calls the provided `pureFunction`
 * and returns a Promise which will contain the `pureFunction`s
 * return value upon completion.
 *
 * `workerPureFunction` takes a single argument. An object with two
 * properties:
 * 1. `args`: An array of arguments to supply to `pureFunction`.
 * 2. `transfer`: An optional array of Transferables.
 */
export function usePureWorker(pureFunction: PureFunction) {
  const blobCode = `
    onmessage = (msg) => {
      postMessage((${pureFunction})(...msg.data));
    };
  `;

  const [worker] = React.useState(() => makeWorkerFromBlobPart(blobCode));

  function workerPureFunction({ args, transfer = [] }: PureFunctionParams) {
    worker.postMessage(args, transfer);

    return new Promise((resolve) => {
      worker.onmessage = (msg) => resolve(msg.data);
    });
  }

  React.useEffect(() => () => worker.terminate(), []);

  return workerPureFunction;
}
