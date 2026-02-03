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
      <Route path="/" element={<Navigate to="/admin/login" />} />

      <Route path="/admin/login" element={<AdminLogin />} />

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
        <Route path="results/:id" element={<Results />} />
      </Route>

      <Route path="/verify" element={<Verify />} />
      <Route path="/test" element={<Test />} />
      <Route path="/thank-you" element={<ThankYou />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
