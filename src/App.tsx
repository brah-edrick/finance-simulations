import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import RetirementCalculator from "./Pages/RetirementCalculator";
import { CompoundInterestCalculator } from "./Pages/CompoundInterestCalculator";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RetirementCalculator />} path="retirement/" />
        <Route element={<CompoundInterestCalculator />} path="interest/" />{" "}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
