import React, { useState, useEffect } from "react";
import { useWorker } from "web-worker-hooks";

import styles from "./ImportPage.module.css";

function ImportPage() {
  const [value, setValue] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const worker = useWorker(
    (postMessage, setOnMessage, imports) => {
      console.log(imports);
      setOnMessage((msg) => {
        postMessage(imports["mexp"].eval(msg.data));
      });
    },
    { mexp: "math-expression-evaluator" }
  );

  useEffect(() => {
    worker.onmessage = (msg) => {
      setEvaluation(msg.data);
    };

    return () => worker.terminate();
  }, []);

  function handleClick() {
    worker.postMessage(value);
  }

  return (
    <div>
      <div>{evaluation}</div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <input
          value={value}
          onChange={(e) => {
            setValue(e.data);
          }}
        ></input>
        <div>
          <button onClick={handleClick}>Evaluate</button>
        </div>
      </form>
    </div>
  );
}

export default ImportPage;
