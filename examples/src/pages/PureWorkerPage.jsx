import React, { useEffect, useState } from "react";
import { usePureWorker } from "web-worker-hooks";
import styles from "./PureWorkerPage.module.css";

function PureWorkerPage() {
  const [resultWorker, setResultWorker] = useState(0);
  const [disabled, setDisabled] = useState(false);
  const [result, setResult] = useState(0);

  function fib(n) {
    function fib(n) {
      if (n < 2) {
        return n;
      }
      return fib(n - 1) + fib(n - 2);
    }

    return fib(n);
  }

  const workerPureFunction = usePureWorker(fib);

  function handleClickWorker() {
    setDisabled(true);
    workerPureFunction({ args: [42] }).then((value) => {
      setResultWorker(value);
      setDisabled(false);
    });
  }

  function handleClick() {
    setResult(fib(42));
  }

  return (
    <div className={styles["PureWorkerPage"]}>
      <MagicSquares />
      <div className={styles["result-container"]}>
        <div style={{ width: 600, textAlign: "center" }}>
          Result: {resultWorker}
        </div>
        <button onClick={handleClickWorker} style={{ cursor: "pointer" }}>
          Compute fib(42) in worker thread
        </button>
      </div>
      <div className={styles["result-container"]}>
        <div style={{ width: 600, textAlign: "center" }}>Result: {result}</div>
        <button
          disabled={disabled}
          onClick={handleClick}
          style={{ cursor: "pointer" }}
        >
          Compute fib(42) in main thread
        </button>
      </div>
      <div className={styles["tooltip"]}>
        Click the first button to compute fibonacci(42) in a web worker and
        watch while you wait for it to finish. The animation goes on. Then click
        the second button to run the computation in the main thread.
      </div>
    </div>
  );
}

export default PureWorkerPage;

function MagicSquares() {
  const [chosen, setChosen] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setChosen(Math.floor(Math.random() * 9));
    }, 300);

    return () => clearInterval(intervalId);
  }, []);

  function renderSquares() {
    return Array(3)
      .fill(0)
      .map((_, i) => {
        return (
          <div style={{ display: "flex" }} key={`outer-${i}`}>
            {Array(3)
              .fill(0)
              .map((_, j) => {
                const n = i * 3 + j;
                const style = {
                  backgroundColor: chosen === n ? "#dd4444" : "#ccc",
                };

                return (
                  <div className={styles["square"]} style={style} key={n}></div>
                );
              })}
          </div>
        );
      });
  }

  return <div>{renderSquares()}</div>;
}
