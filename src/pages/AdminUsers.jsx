import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Ban,
  CheckCircle2,
  Eye,
  FolderTree,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import AdminNav from "../components/AdminNav";
import AdminUserDetailModal from "../components/AdminUserDetailModal";
import { authFetch } from "../lib/authFetch";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [detailUserId, setDetailUserId] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'active' | 'banned' | 'departments'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' (#1 -> #N) | 'desc' (#N -> #1) | 'name'

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await authFetch("/api/admin/users");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Users could not load.");

      let allUsersList = [];
      if (Array.isArray(data.users) && data.users.length > 0) {
        allUsersList = data.users;
      } else {
        const fromDepts = (data.departments || []).flatMap((d) => d.users || []);
        const fromUnassigned = data.unassigned || [];
        allUsersList = [...fromDepts, ...fromUnassigned];
      }

      setUsers(allUsersList);
      setDepartments(data.departments || []);
      setUnassigned(data.unassigned || []);
    } catch (loadError) {
      setError(loadError.message || "Admin API connection failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function applyUserUpdate(updated) {
    setUsers((current) =>
      current.map((user) => (user.id === updated.id ? { ...user, ...updated } : user))
    );
    setDepartments((current) =>
      current.map((dept) => ({
        ...dept,
        users: dept.users.map((user) => (user.id === updated.id ? { ...user, ...updated } : user)),
      }))
    );
    setUnassigned((current) =>
      current.map((user) => (user.id === updated.id ? { ...user, ...updated } : user))
    );
  }

  async function toggleBan(user, e) {
    if (e) e.stopPropagation();
    const nextBanned = !user.banned;
    const confirmMsg = nextBanned
      ? `Ban ${user.name} (#${user.sequenceId})?\n\n• They will be automatically logged out within 4-5 seconds.\n• They will be blocked from logging in with ${user.email}.`
      : `Unban ${user.name} (#${user.sequenceId})?\n\n• Their account will be restored to Active status immediately.`;

    if (!window.confirm(confirmMsg)) return;

    setBusyId(user.id);
    try {
      const response = await authFetch(`/api/admin/users/${user.id}/ban`, {
        method: "PATCH",
        body: JSON.stringify({ banned: nextBanned }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not update ban status.");
      applyUserUpdate(data.user);
    } catch (banError) {
      setError(banError.message || "Could not update ban status.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteUser(user, e) {
    if (e) e.stopPropagation();
    if (
      !window.confirm(
        `Permanently delete user ${user.name} (#${user.sequenceId})?\n\nThis will also remove all their submitted skills. This ID will never be reused for future users.`
      )
    ) {
      return;
    }
    setBusyId(user.id);
    try {
      const response = await authFetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not delete user.");
      setUsers((current) => current.filter((u) => u.id !== user.id));
      setDepartments((current) =>
        current.map((dept) => ({
          ...dept,
          users: dept.users.filter((u) => u.id !== user.id),
        }))
      );
      setUnassigned((current) => current.filter((u) => u.id !== user.id));
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete user.");
    } finally {
      setBusyId(null);
    }
  }

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    let list = [...users];

    // Tab filter
    if (activeTab === "active") list = list.filter((u) => !u.banned);
    else if (activeTab === "banned") list = list.filter((u) => u.banned);

    // Search query
    const q = search.trim().toLowerCase();
    if (q) {
      const cleanQ = q.replace(/^#/, "");
      list = list.filter(
        (u) =>
          String(u.sequenceId) === cleanQ ||
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.location?.toLowerCase().includes(q) ||
          u.department?.toLowerCase().includes(q) ||
          u.taughtSkill?.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortOrder === "asc") {
      list.sort((a, b) => (a.sequenceId || 0) - (b.sequenceId || 0));
    } else if (sortOrder === "desc") {
      list.sort((a, b) => (b.sequenceId || 0) - (a.sequenceId || 0));
    } else if (sortOrder === "name") {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    return list;
  }, [users, activeTab, search, sortOrder]);

  const activeCount = users.filter((u) => !u.banned).length;
  const bannedCount = users.filter((u) => u.banned).length;
  const nonEmptyDepartments = departments.filter((dept) => dept.users.length > 0);

  return (
    <main className="min-h-screen bg-[var(--jb-bg)] dark:bg-[#07070D] px-4 py-10 sm:px-7 transition-colors duration-300">
      <section className="mx-auto max-w-7xl">
        {/* Top Header Card */}
        <div className="overflow-hidden rounded-3xl bg-linear-to-br from-[#170f24] via-[#211438] to-violet-900 px-6 py-9 text-white shadow-xl sm:px-10">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-violet-300">
            SkillSwap User Management
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Registered Members Directory
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
                Manage all {users.length} members with unique sequential IDs (#1, #2...). Review profile
                details, monitor activity, or manage ban suspensions.
              </p>
            </div>
            <button
              type="button"
              onClick={loadUsers}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold transition hover:bg-white/15"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh Directory
            </button>
          </div>
          <AdminNav />
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-violet-100 bg-white p-4.5 shadow-xs">
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-gray-500">
              <Users size={15} className="text-violet-600" /> Total Users
            </div>
            <p className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">{users.length}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-4.5 shadow-xs">
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-emerald-600">
              <UserCheck size={15} /> Active Members
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-700 sm:text-3xl">{activeCount}</p>
          </div>
          <div className="rounded-2xl border border-red-100 bg-white p-4.5 shadow-xs">
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-red-600">
              <ShieldAlert size={15} /> Banned Users
            </div>
            <p className="mt-2 text-2xl font-bold text-red-600 sm:text-3xl">{bannedCount}</p>
          </div>
          <div className="rounded-2xl border border-purple-100 bg-white p-4.5 shadow-xs">
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-purple-600">
              <FolderTree size={15} /> Departments
            </div>
            <p className="mt-2 text-2xl font-bold text-purple-900 sm:text-3xl">{departments.length}</p>
          </div>
        </div>

        {/* Filter Tabs & Search Controls */}
        <div className="mt-7 flex flex-col gap-4 rounded-3xl border border-violet-100 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "all"
                  ? "bg-violet-700 text-white shadow-xs"
                  : "bg-slate-100 text-gray-700 hover:bg-slate-200"
              }`}
            >
              All Users ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "active"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-gray-700 hover:bg-slate-200"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("banned")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "banned"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-slate-100 text-gray-700 hover:bg-slate-200"
              }`}
            >
              Banned ({bannedCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("departments")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "departments"
                  ? "bg-purple-700 text-white shadow-xs"
                  : "bg-slate-100 text-gray-700 hover:bg-slate-200"
              }`}
            >
              By Department
            </button>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by #ID, name, email..."
                className="w-full rounded-xl border border-gray-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-violet-600 focus:bg-white"
              />
            </div>
            {activeTab !== "departments" && (
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="rounded-xl border border-gray-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-violet-600"
              >
                <option value="asc">Sort: #1 → Newest</option>
                <option value="desc">Sort: Newest → #1</option>
                <option value="name">Sort: Name (A-Z)</option>
              </select>
            )}
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <p className="mt-12 text-center text-sm text-gray-500">Loading directory members…</p>
        ) : activeTab === "departments" ? (
          /* Departmental Grouping View */
          <div className="mt-7 space-y-7">
            {nonEmptyDepartments.map((department) => (
              <section
                key={department.name}
                className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm sm:p-7"
              >
                <div className="flex items-center gap-2">
                  <FolderTree size={18} className="text-violet-600" />
                  <h2 className="text-xl font-bold text-gray-900">{department.name}</h2>
                  <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">
                    {department.users.length} members
                  </span>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {department.users.map((user) => (
                    <UserRowCard
                      key={user.id}
                      user={user}
                      busy={busyId === user.id}
                      onView={() => setDetailUserId(user.id)}
                      onDelete={(e) => deleteUser(user, e)}
                      onToggleBan={(e) => toggleBan(user, e)}
                    />
                  ))}
                </div>
              </section>
            ))}

            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-gray-400" />
                <h2 className="text-xl font-bold text-gray-900">Unassigned Members</h2>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
                  {unassigned.length}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Registered members who haven't had a taught skill approved yet.
              </p>
              {unassigned.length === 0 ? (
                <p className="mt-4 text-xs text-gray-400">No unassigned members.</p>
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {unassigned.map((user) => (
                    <UserRowCard
                      key={user.id}
                      user={user}
                      busy={busyId === user.id}
                      onView={() => setDetailUserId(user.id)}
                      onDelete={(e) => deleteUser(user, e)}
                      onToggleBan={(e) => toggleBan(user, e)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          /* Master User List Cards */
          <div className="mt-7">
            {filteredUsers.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
                <Users size={32} className="mx-auto text-gray-300 mb-2" />
                <p className="text-sm font-semibold text-gray-700">No users match your criteria.</p>
                <p className="text-xs text-gray-400 mt-1">Try clearing your search query or filters.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredUsers.map((user) => (
                  <UserRowCard
                    key={user.id}
                    user={user}
                    busy={busyId === user.id}
                    onView={() => setDetailUserId(user.id)}
                    onDelete={(e) => deleteUser(user, e)}
                    onToggleBan={(e) => toggleBan(user, e)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* User Full Detail Modal */}
      <AdminUserDetailModal
        userId={detailUserId}
        onClose={() => setDetailUserId(null)}
        onBanChanged={applyUserUpdate}
      />
    </main>
  );
}

function UserRowCard({ user, onView, onDelete, onToggleBan, busy }) {
  const isBanned = !!user.banned;

  return (
    <article
      onClick={onView}
      className={`group relative cursor-pointer rounded-2xl border bg-white p-5 shadow-xs transition-all hover:shadow-md ${
        isBanned
          ? "border-red-200 bg-red-50/30 hover:border-red-300"
          : "border-gray-100 hover:border-violet-200"
      }`}
    >
      {/* Top Bar: Sequential ID and Status */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-lg bg-violet-100 px-2.5 py-1 text-xs font-black text-violet-800">
          #{user.sequenceId ?? "—"}
        </span>
        <div className="flex items-center gap-1.5">
          {user.role === "ADMIN" && (
            <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-black text-purple-700">
              ADMIN
            </span>
          )}
          {isBanned ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-700">
              <XCircle size={12} /> Banned
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
              <CheckCircle2 size={12} /> Active
            </span>
          )}
        </div>
      </div>

      {/* User Info with Avatar */}
      <div className="mt-4 flex items-start gap-3.5">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="h-12 w-12 rounded-xl object-cover border border-violet-100 shrink-0 shadow-xs"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-lg font-bold text-violet-700 shadow-xs">
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-gray-900 group-hover:text-violet-700">
            {user.name}
          </h3>
          <p className="truncate text-xs text-gray-500">{user.email}</p>
          {user.location && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
              <MapPin size={11} className="shrink-0" /> {user.location}
            </p>
          )}
        </div>
      </div>

      {/* Department & Joined info */}
      <div className="mt-3.5 flex items-center justify-between border-t border-gray-100 pt-2.5 text-[11px] text-gray-500">
        <span className="truncate">
          {user.taughtSkill ? (
            <strong className="text-violet-700">Teaches: {user.taughtSkill}</strong>
          ) : (
            <span className="text-gray-400">{user.department || "Unassigned"}</span>
          )}
        </span>
        <span className="shrink-0 text-gray-400">
          Joined {new Date(user.joinedAt).toLocaleDateString()}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex items-center gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onView}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-violet-200 bg-violet-50/50 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-100"
        >
          <Eye size={13} /> View Info
        </button>

        {user.role !== "ADMIN" && (
          <button
            type="button"
            onClick={onToggleBan}
            disabled={busy}
            className={`inline-flex flex-1 items-center justify-center gap-1 rounded-xl border py-2 text-xs font-bold transition disabled:opacity-50 ${
              isBanned
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
            }`}
          >
            {isBanned ? <ShieldCheck size={13} /> : <Ban size={13} />}
            {isBanned ? "Unban" : "Ban User"}
          </button>
        )}

        {user.role !== "ADMIN" && (
          <button
            type="button"
            onClick={onDelete}
            disabled={busy}
            title="Delete User"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 p-2 text-gray-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </article>
  );
}
