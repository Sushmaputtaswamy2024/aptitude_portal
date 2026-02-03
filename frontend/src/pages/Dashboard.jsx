import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    invited: 0,
    verified: 0,
    started: 0,
    submitted: 0,
  });

  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/status")
      .then((res) => {
        const raw = res.data || [];

        // ✅ Deduplicate by candidate_id (keep latest only)
        const map = {};
        raw.forEach((r) => {
          if (
            !map[r.candidate_id] ||
            new Date(r.last_updated) > new Date(map[r.candidate_id].last_updated)
          ) {
            map[r.candidate_id] = r;
          }
        });

        const data = Object.values(map);

        setStats({
          invited: data.filter((c) => c.status === "INVITED").length,
          verified: data.filter((c) => c.status === "VERIFIED").length,
          started: data.filter((c) => c.status === "STARTED").length,
          submitted: data.filter((c) => c.status === "SUBMITTED").length,
        });

        setRecent(
          [...data]
            .sort(
              (a, b) =>
                new Date(b.last_updated) - new Date(a.last_updated)
            )
            .slice(0, 5)
        );
      })
      .catch((err) => {
        console.error("Failed to load dashboard", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <h2>Admin Overview</h2>
      <p style={{ marginTop: 6 }}>
        Summary of candidate assessment activity.
      </p>

      {loading && <p style={{ marginTop: 20 }}>Loading dashboard...</p>}

      {!loading && (
        <>
          {/* ===== SUMMARY ===== */}
          <div style={cardGrid}>
            <StatCard title="Invited" value={stats.invited} />
            <StatCard title="Email Verified" value={stats.verified} />
            <StatCard title="Test Started" value={stats.started} />
            <StatCard title="Completed" value={stats.submitted} />
          </div>

          {/* ===== QUICK ACTIONS ===== */}
          <div style={{ marginTop: 50 }}>
            <h3>Quick Actions</h3>

            <div style={actionGrid}>
              <ActionCard
                title="Invite Candidates"
                description="Send aptitude test invitations"
                link="/admin/invite"
              />

              <ActionCard
                title="Candidate Status"
                description="View results & progress"
                link="/admin/status"
              />
            </div>
          </div>

          {/* ===== RECENT ===== */}
          <div style={{ marginTop: 60 }}>
            <h3>Recent Activity</h3>

            <div style={activityBox}>
              {recent.map((r) => (
                <div key={r.candidate_id} style={activityRow}>
                  <div>
                    <strong>{r.name}</strong>
                    <div style={{ fontSize: 13, color: "#4b5563" }}>
                      {statusText(r.status)}
                    </div>
                  </div>

                  <div style={{ fontSize: 12, color: "#6b7280" }}>
                    {formatTime(r.last_updated)}
                  </div>
                </div>
              ))}

              {recent.length === 0 && (
                <p style={{ padding: 16, color: "#6b7280" }}>
                  No recent activity
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ title, value }) {
  return (
    <div style={statCard}>
      <div style={{ fontSize: 13, color: "#4b5563" }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function ActionCard({ title, description, link }) {
  return (
    <Link to={link} style={actionLink}>
      <div style={actionCard}>
        <div style={{ fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 13, color: "#4b5563", marginTop: 6 }}>
          {description}
        </div>
      </div>
    </Link>
  );
}

/* ================= HELPERS ================= */

function statusText(status) {
  if (status === "INVITED") return "Invitation sent";
  if (status === "VERIFIED") return "Email verified";
  if (status === "STARTED") return "Test started";
  if (status === "SUBMITTED") return "Test completed";
  return status;
}

function formatTime(time) {
  if (!time) return "-";
  return new Date(time).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ================= STYLES ================= */

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 20,
  marginTop: 30,
};

const statCard = {
  padding: 20,
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 6,
};

const actionGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 20,
  marginTop: 20,
};

const actionCard = {
  padding: 18,
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 6,
};

const actionLink = {
  textDecoration: "none",
  color: "#1f2933",
};

const activityBox = {
  marginTop: 20,
  background: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: 6,
};

const activityRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "14px 18px",
  borderBottom: "1px solid #e5e7eb",
};
