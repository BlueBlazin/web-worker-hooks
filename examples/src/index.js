import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";

import "./index.css";
import App from "./App";
import TimerPage from "./pages/TimerPage";
import PureWorkerPage from "./pages/PureWorkerPage";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Switch>
        <Route exact path="/">
          <App />
        </Route>
        <Route exact path="/timer-example">
          <TimerPage />
        </Route>
        <Route exact path="/pureworker-example">
          <PureWorkerPage />
        </Route>
      </Switch>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
