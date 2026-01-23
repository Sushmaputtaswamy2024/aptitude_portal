export default function BrandHeader() {
  return (
    <div style={logoContainer}>
      <img
        src="/logo.png"
        alt="VIndia Infrasec"
        style={logoStyle}
      />
    </div>
  );
}

const logoContainer = {
  position: "fixed",
  top: 24,
  left: 40,
  zIndex: 1000,
};

const logoStyle = {
  height: 80,
  width: "auto",
};
