import { BrowserRouter, Routes, Route } from "react-router-dom";
import Onboarding from "./pages/Onboarding";
import Today from "./pages/Today";
import Weekly from "./pages/Weekly";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/today" element={<Today />} />
        <Route path="/weekly" element={<Weekly />} />
      </Routes>
    </BrowserRouter>
  );
}
