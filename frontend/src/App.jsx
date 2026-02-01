import { Routes, Route, Navigate } from "react-router-dom";

import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import InviteCandidates from "./pages/InviteCandidates";
import CandidateStatus from "./pages/CandidateStatus";
import Results from "./pages/Results";
import Verify from "./pages/VerifyEmail";
import Test from "./pages/Test";
import ThankYou from "./pages/ThankYou";

import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* Default */}
      <Route path="/" element={<Navigate to="/admin/login" />} />

      {/* Admin Login */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ================= ADMIN PROTECTED ================= */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="invite" element={<InviteCandidates />} />
        <Route path="status" element={<CandidateStatus />} />

        {/* Admin Results */}
        <Route path="results/:id" element={<Results />} />
      </Route>

      {/* ================= CANDIDATE PUBLIC ================= */}
      <Route path="/verify" element={<Verify />} />
      <Route path="/test" element={<Test />} />
      <Route path="/thank-you" element={<ThankYou />} />

      {/* Candidate Results (PUBLIC) */}
      <Route path="/results/:id" element={<Results />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
