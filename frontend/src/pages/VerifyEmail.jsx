import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import BrandLayout from "../components/BrandLayout";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      setMessage("Invalid verification link.");
      return;
    }

    api
      .get(`/verify?token=${token}`) // ✅ FIXED
      .then(() => {
        setMessage("Email verified successfully. Redirecting to assessment...");
        setTimeout(() => navigate(`/test?token=${token}`), 1500);
      })
      .catch((err) => {
        if (err.response?.status === 410) {
          setMessage(
            "This verification link has expired. Please request a new invite."
          );
        } else {
          setMessage("Verification link is invalid.");
        }
      });
  }, [params, navigate]);

  return (
    <BrandLayout>
      <h2>Email Verification</h2>
      <p style={{ marginTop: 20 }}>{message}</p>
    </BrandLayout>
  );
}
