import { Route, Routes } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { RequireAdmin } from "@/components/auth/RequireAdmin";
import HomePage from "@/pages/HomePage";
import PokemonDetailPage from "@/pages/PokemonDetailPage";
import CalculatorPage from "@/pages/CalculatorPage";
import SimulatorPage from "@/pages/SimulatorPage";
import AdminPage from "@/pages/AdminPage";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pokemon/:id" element={<PokemonDetailPage />} />
          <Route path="/pokemon/:id/calculator" element={<CalculatorPage />} />
          <Route path="/pokemon/:id/simulator" element={<SimulatorPage />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminPage />
              </RequireAdmin>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
