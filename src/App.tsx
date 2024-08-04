import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import RetirementCalculator from "./Pages/RetirementCalculator";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RetirementCalculator />} path="retirement/" />{" "}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
