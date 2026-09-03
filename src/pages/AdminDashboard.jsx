import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, CheckCircle2, Clock3, RefreshCw, Users, XCircle, Star } from "lucide-react";
import AdminNav from "../components/AdminNav";
import { authFetch } from "../lib/authFetch";

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await authFetch("/api/admin/dashboard");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Dashboard could not load.");
      setMetrics(data.metrics || null);
      setDepartments(data.departments || []);
    } catch (loadError) {
      setError(loadError.message || "Admin API connection failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <main className="min-h-screen bg-[var(--jb-bg)] dark:bg-[#07070D] px-4 py-10 sm:px-7 transition-colors duration-300">
      <section className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl bg-linear-to-br from-[#170f24] via-[#211438] to-violet-900 px-6 py-9 text-white shadow-xl sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-violet-300">SkillSwap command centre</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Admin workspace</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">
                Manage members, review skill submissions, and keep the community safe.
              </p>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold hover:bg-white/15 cursor-pointer"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh data
            </button>
          </div>
          <AdminNav />
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <b>Admin panel error:</b> {error}
          </div>
        )}

        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Metric to="/admin/users" icon={<Users size={19} className="text-violet-600 dark:text-violet-400" />} label="Total users" value={metrics?.totalUsers ?? "—"} />
          <Metric to="/admin/skills?status=pending" icon={<Clock3 size={19} className="text-amber-600 dark:text-amber-400" />} label="Pending skills" value={metrics?.pendingSkills ?? "—"} />
          <Metric to="/admin/skills?status=approved" icon={<CheckCircle2 size={19} className="text-emerald-600 dark:text-emerald-400" />} label="Approved skills" value={metrics?.approvedSkills ?? "—"} />
          <Metric to="/admin/skills?featured=true" icon={<Star size={19} className="text-amber-500 fill-amber-500 dark:text-amber-400 dark:fill-amber-400" />} label="Featured This Week" value={metrics?.featuredSkills ?? "—"} highlight />
          <Metric to="/admin/skills?status=rejected" icon={<XCircle size={19} className="text-red-600 dark:text-red-400" />} label="Rejected skills" value={metrics?.rejectedSkills ?? "—"} />
          <Metric to="/admin/users" icon={<Building2 size={19} className="text-violet-600 dark:text-violet-400" />} label="Departments" value={metrics?.departmentCount ?? "—"} />
        </div>

        <section className="mt-7 rounded-3xl border border-violet-100 dark:border-gray-800 bg-white dark:bg-[#181824] p-5 shadow-sm sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-violet-600 dark:text-violet-400">Departments</p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">Approved skills by department</h2>
          {loading ? (
            <p className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">Loading…</p>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {departments.map((department) => (
                <div key={department.name} className="rounded-2xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-[#12121A] p-4">
                  <p className="font-semibold text-gray-900 dark:text-white">{department.name}</p>
                  <p className="mt-1 text-2xl font-bold text-violet-600 dark:text-violet-400">{department.approvedSkillCount}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">approved skills</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function Metric({ icon, label, value, to, highlight }) {
  const content = (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition ${
        highlight
          ? "border-amber-400/60 bg-amber-50/50 dark:bg-[#181824] dark:border-amber-500/50 hover:border-amber-400 dark:hover:border-amber-400"
          : "border-violet-100 dark:border-gray-800 bg-white dark:bg-[#181824] hover:border-violet-300 dark:hover:border-gray-700"
      } ${to ? "hover:shadow-md cursor-pointer" : ""}`}
    >
      {icon}
      <p
        className={`mt-4 text-3xl font-bold ${
          highlight ? "text-amber-500 dark:text-amber-400" : "text-gray-900 dark:text-white"
        }`}
      >
        {value}
      </p>
      <p
        className={`mt-1 text-sm font-medium ${
          highlight ? "text-amber-700/90 dark:text-amber-300/80" : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {label}
      </p>
    </div>
  );

  return to ? <Link to={to}>{content}</Link> : content;
}
