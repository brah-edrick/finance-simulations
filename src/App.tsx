import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { RetirementCalculator } from "./Pages/RetirementCalculator";
import { CompoundInterestCalculator } from "./Pages/CompoundInterestCalculator";
import { FIRECalculator } from "./Pages/FIRE";
import { RoadToMillionaireCalculator } from "./Pages/RoadToMillionaireCalculator";
import { Callout } from "@tremor/react";
import {
  SparklesIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/16/solid";
function App() {
  return (
    <>
      <div className="min-h-[100vh]">
        <BrowserRouter>
          <Routes>
            <Route element={<FIRECalculator />} path="FIRE/" />
            <Route element={<RetirementCalculator />} path="retirement/" />
            <Route element={<CompoundInterestCalculator />} path="interest/" />
            <Route
              element={<RoadToMillionaireCalculator />}
              path="millionaire/"
            />
            <Route
              element={<Navigate to="/retirement" replace={true} />}
              path="/"
            />
          </Routes>
        </BrowserRouter>
      </div>
      <div className="flex gap-2 mt-16 flex-col">
        <Callout
          icon={SparklesIcon}
          title="Crafted with Aloha in Honolulu, HI 🤙🏻"
        >
          Made with TailwindCSS, Tremor and Typescript
        </Callout>
        <Callout
          title="Author's Note"
          icon={ExclamationTriangleIcon}
          color="orange"
        >
          I am not a financial advisor and this application should not be
          considered financial advice. This is just a pet project. While I
          believe the calculations in this app are mostly accurate, please
          consult a professional before making any financial decisions.
        </Callout>
      </div>
    </>
  );
}

export default App;
