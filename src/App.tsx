import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { RetirementCalculator } from "./Pages/RetirementCalculator";
import { CompoundInterestCalculator } from "./Pages/CompoundInterestCalculator";
import { FIRECalculator } from "./Pages/FIRE";
import { RoadToMillionaireCalculator } from "./Pages/RoadToMillionaireCalculator";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<FIRECalculator />} path="FIRE/" />
        <Route element={<RetirementCalculator />} path="retirement/" />
        <Route element={<CompoundInterestCalculator />} path="interest/" />
        <Route
          element={<RoadToMillionaireCalculator />}
          path="millionaire/"
        />{" "}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
