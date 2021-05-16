import React, { useState } from "react";
import { useWorkerTimeout } from "web-worker-hooks";

import styles from "./TimerPage.module.css";

function TimerPage() {
  const [count, setCount] = useState(0);
  const [workerCount, setWorkerCount] = useState(0);
  const workerSetTimeout = useWorkerTimeout();

  function handleClick() {
    function workerTimeout() {
      workerSetTimeout(workerTimeout, 1000);
      setWorkerCount((c) => c + 1);
    }

    function mainTimeout() {
      setTimeout(mainTimeout, 1000);
      setCount((c) => c + 1);
    }

    workerTimeout();
    mainTimeout();
  }

  return (
    <div className={styles.container}>
      <div className={styles["counters-container"]}>
        <div className={styles.counter}>
          <div>{workerCount}</div>
          <div className={styles.description}>workerSetTimeout</div>
        </div>
        <div className={styles.counter}>
          <div>{count}</div>
          <div className={styles.description}>window.setTimeout</div>
        </div>
      </div>
      <div className={styles.button} onClick={() => handleClick()}>
        Start Timers
      </div>
    </div>
  );
}

export default TimerPage;
