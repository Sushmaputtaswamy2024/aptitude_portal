import BrandHeader from "./BrandHeader";

export default function BrandLayout({ children }) {
  return (
    <div className="brand-page">
      <BrandHeader />
      <main className="brand-content">{children}</main>
    </div>
  );
}
