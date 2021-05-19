import "./App.css";
import { Link } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <div>
        <Link to="/timer-example">Timer Example</Link>
      </div>
      <div>
        <Link to="/pureworker-example">Background Compute Example</Link>
      </div>
    </div>
  );
}

export default App;
