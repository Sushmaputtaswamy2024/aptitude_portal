import { Link, useNavigate, Outlet } from "react-router-dom";
import { useState } from "react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  return (
    <div className="admin-layout">
      {/* Mobile header */}
      <header className="admin-mobile-header">
        <div />
        <img src="/logo.png" alt="VIndia" className="admin-logo-mobile" />
        <button className="hamburger" onClick={() => setOpen(true)}>☰</button>
      </header>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <img src="/logo.png" alt="VIndia" className="admin-logo" />

        <nav className="admin-nav" onClick={() => setOpen(false)}>
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/invite">Invite</Link>
          <Link to="/admin/status">Status</Link>
          <Link to="/admin/results">Results</Link>
        </nav>

        <button onClick={logout} className="logout-btn">Logout</button>
      </aside>

      {open && <div className="admin-overlay" onClick={() => setOpen(false)} />}

      {/* CONTENT */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
