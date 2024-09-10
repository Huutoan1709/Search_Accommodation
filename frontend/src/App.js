import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { publicroutes } from "./routes";
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {publicroutes.map((route, index) => {
            return (
              <Route
                key={index}
                path={route.path}
                element={<route.component />}
              />
            );
          })}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
