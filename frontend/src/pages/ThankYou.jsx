import BrandLayout from "../components/BrandLayout";

export default function ThankYou() {
  return (
    <BrandLayout>
      <h2>Submission Successful</h2>

      <p style={{ marginTop: 20 }}>
        Thank you for completing the aptitude assessment.
      </p>

      <p style={{ marginTop: 10 }}>
        <strong>VIndia Infrasec Pvt Ltd</strong> will review your submission and
        contact you if shortlisted.
      </p>
    </BrandLayout>
  );
}
