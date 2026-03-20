import { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaEnvelope,
  FaEye,
  FaFilter,
  FaTrash,
  FaUserGraduate,
  FaUserShield,
  FaUsers,
  FaXmark,
} from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import apiClient from "../../apiClient/apiClient";
import useContextPro from "../../hooks/useContextPro";
import type { User } from "../../types/types";
import { getErrorMessage } from "../../utils/error";
import { formatUserCreatedAt } from "../../utils/userDates";
import { FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaSearch, FaShieldAlt } from "react-icons/fa";
import { FcRefresh } from "react-icons/fc";

type RoleFilter = "all" | "admin" | "teacher" ;

function normalizeRoleLabel(roles?: string[]) {
  const normalized = (roles ?? []).map((role) => role.toLowerCase());
  if (normalized.includes("admin")) return "Admin";
  if (normalized.includes("teacher")) return "Teacher";
  return "Teacher";
}

function roleTone(roleLabel: string) {
  if (roleLabel === "Admin") return "bg-fuchsia-400/15 text-fuchsia-200 border-fuchsia-300/15";
  if (roleLabel === "Teacher") return "bg-amber-400/15 text-amber-200 border-amber-300/15";
  return "bg-emerald-400/15 text-emerald-200 border-emerald-300/15";
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
    state: { user },
  } = useContextPro();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [error, setError] = useState("");

  const loadUsers = async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "initial") setIsLoading(true);
    else setIsRefreshing(true);

    try {
      setError("");
      const res = await apiClient.get<User[]>("/users/");
      const nextUsers = Array.isArray(res.data) ? res.data : [];
      setUsers(nextUsers);
      setSelectedUser((prev) => {
        if (!prev) return nextUsers[0] ?? null;
        return nextUsers.find((item) => item.id === prev.id) ?? nextUsers[0] ?? null;
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const adminCount = useMemo(
    () => users.filter((item) => item.roles?.some((role) => role.toLowerCase() === "admin")).length,
    [users]
  );
  const teacherCount = useMemo(
    () => users.filter((item) => item.roles?.some((role) => role.toLowerCase() === "teacher")).length,
    [users]
  );

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((item) => {
      const roleLabel = normalizeRoleLabel(item.roles);
      const roleMatches =
        roleFilter === "all" ? true : roleLabel.toLowerCase() === roleFilter;
      const queryMatches = !query
        ? true
        : item.username?.toLowerCase().includes(query) ||
          item.email?.toLowerCase().includes(query) ||
          roleLabel.toLowerCase().includes(query);
      return roleMatches && queryMatches;
    });
  }, [roleFilter, search, users]);

  const handleDelete = async () => {
    if (!pendingDeleteUser?.id || deletingId || pendingDeleteUser.id === user?.id) return;
    try {
      setDeletingId(pendingDeleteUser.id);
      await apiClient.delete(`/users/${pendingDeleteUser.id}`);
      setUsers((prev) => prev.filter((item) => item.id !== pendingDeleteUser.id));
      setSelectedUser((prev) => (prev?.id === pendingDeleteUser.id ? null : prev));
      setPendingDeleteUser(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  const statCards = [
    {
      label: "Jami foydalanuvchi",
      value: users.length,
      icon: FaUsers,
      accent: "from-cyan-400 to-blue-500",
      note: "Platformadagi barcha akkauntlar",
    },
    {
      label: "Adminlar",
      value: adminCount,
      icon: FaUserShield,
      accent: "from-fuchsia-400 to-violet-500",
      note: "Tizimni boshqarish huquqiga ega",
    },
    {
      label: "Teacherlar",
      value: teacherCount,
      icon: FaUserGraduate,
      accent: "from-amber-300 to-orange-500",
      note: "Savol va o'yinlarni boshqaradi",
    }
  ];

  const roleOptions: { id: RoleFilter; label: string }[] = [
    { id: "all", label: "Barchasi" },
    { id: "admin", label: "Admin" },
    { id: "teacher", label: "Teacher" }
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#312e81_0%,#111827_45%,#020617_100%)] text-white">
      <div className="mx-auto grid min-h-screen max-w-[1700px] gap-6 px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(30,41,59,0.72))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-cyan-400 to-blue-500 text-slate-950 shadow-lg">
              <FaShieldAlt className="text-xl" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-cyan-200/70">
                Control
              </p>
              <h1 className="mt-1 text-2xl font-black text-white">Admin</h1>
            </div>
          </div>

          <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/40">Hozirgi admin</p>
            <p className="mt-2 truncate text-lg font-black text-white">{user?.username || "Admin"}</p>
            <p className="mt-1 text-sm text-white/55">{user?.email}</p>
            <div className="mt-3 inline-flex rounded-full border border-fuchsia-300/15 bg-fuchsia-400/15 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-fuchsia-200">
              {normalizeRoleLabel(user?.roles)}
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-[1.3rem] border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-left"
            >
              <span>
                <p className="text-sm font-black text-white">Foydalanuvchilar</p>
                <p className="mt-1 text-xs text-cyan-100/70">List, filter, delete</p>
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white">
                {users.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex w-full items-center gap-3 rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/80 transition hover:bg-white/10"
            >
              <FaArrowLeft />
              Bosh sahifa
            </button>

            <button
              type="button"
              onClick={() => void loadUsers("refresh")}
              disabled={isRefreshing}
              className="flex w-full items-center gap-3 rounded-[1.3rem] bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:brightness-110 disabled:opacity-70"
            >
              <FcRefresh className={isRefreshing ? "animate-spin" : ""} />
              Yangilash
            </button>
          </div>

          <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/40">Tezkor filtr</p>
            <div className="mt-3 space-y-2">
              {roleOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setRoleFilter(option.id)}
                  className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-bold transition ${
                    roleFilter === option.id
                      ? "bg-white/15 text-white"
                      : "bg-black/10 text-white/65 hover:bg-white/8"
                  }`}
                >
                  {option.label}
                  {roleFilter === option.id ? <FaCheckCircle className="text-cyan-300" /> : null}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="space-y-6">
          <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(15,23,42,0.9),rgba(49,46,129,0.55))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <div className="">
              <div >
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.28em] text-cyan-200">
                  <FaUserShield />
                  Admin Dashboard
                </div>
              </div>

              <div className="flex w-full mt-4 items-center gap-3 rounded-[1.4rem] border border-white/10 bg-black/20 px-4 py-3">
                <FaSearch className="text-white/45" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Username, email yoki role bo'yicha qidiring..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                />
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-black text-white/60">
                  {filteredUsers.length} ta
                </span>
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.15)]"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-slate-950`}>
                  <card.icon />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/40">{card.label}</p>
                <p className="mt-2 text-3xl font-black text-white">{card.value}</p>
                <p className="mt-2 text-sm text-white/55">{card.note}</p>
              </div>
            ))}
          </section>

          {error ? (
            <div className="rounded-[1.4rem] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <section className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl md:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black text-white">Users ro'yxati</h3>
                  <p className="mt-1 text-sm text-white/50">
                    Kim qachon ro'yxatdan o'tganini, rolini va emailini ko'rish mumkin.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/15 px-3 py-2 text-xs font-bold text-white/65">
                  <FaFilter />
                  {roleOptions.find((option) => option.id === roleFilter)?.label}
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-3 animate-pulse">
                  {[0, 1, 2, 3, 4].map((item) => (
                    <div key={item} className="rounded-[1.5rem] border border-white/8 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-white/10" />
                          <div>
                            <div className="h-4 w-40 rounded-full bg-white/10" />
                            <div className="mt-2 h-3 w-56 rounded-full bg-white/10" />
                          </div>
                        </div>
                        <div className="h-10 w-24 rounded-2xl bg-white/10" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/5 px-5 py-10 text-center">
                  <p className="text-lg font-black text-white">Hech narsa topilmadi</p>
                  <p className="mt-2 text-sm text-white/45">
                    Qidiruvni yoki rol filtrini o'zgartirib ko'ring.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map((item) => {
                    const roleLabel = normalizeRoleLabel(item.roles);
                    const isSelf = item.id === user?.id;
                    const isSelected = selectedUser?.id === item.id;

                    return (
                      <article
                        key={item.id}
                        className={`rounded-[1.5rem] border p-4 transition ${
                          isSelected
                            ? "border-cyan-300/30 bg-[linear-gradient(90deg,rgba(34,211,238,0.12),rgba(255,255,255,0.04))]"
                            : "border-white/10 bg-[linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] hover:border-white/15"
                        }`}
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <button
                            type="button"
                            onClick={() => setSelectedUser(item)}
                            className="flex min-w-0 flex-1 items-start gap-4 text-left"
                          >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-lg font-black text-slate-950">
                              {(item.username || "U").charAt(0).toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-lg font-black text-white">{item.username}</p>
                                <span className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] ${roleTone(roleLabel)}`}>
                                  {roleLabel}
                                </span>
                                {isSelf ? (
                                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-white/70">
                                    Siz
                                  </span>
                                ) : null}
                              </div>

                              <div className="mt-2 flex flex-col gap-2 text-sm text-white/55 sm:flex-row sm:flex-wrap sm:items-center">
                                <span className="inline-flex items-center gap-2">
                                  <FaEnvelope className="text-[12px]" />
                                  {item.email}
                                </span>
                                <span className="hidden text-white/20 sm:inline">•</span>
                                <span className="inline-flex items-center gap-2">
                                  <FaCalendarAlt className="text-[12px]" />
                                  {formatUserCreatedAt(item)}
                                </span>
                              </div>
                            </div>
                          </button>

                          <div className="flex items-center justify-end gap-3">
                            <button
                              type="button"
                              onClick={() => setSelectedUser(item)}
                              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/80 transition hover:bg-white/10"
                            >
                              <FaEye />
                              Ko'rish
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDeleteUser(item)}
                              disabled={isSelf || deletingId === item.id}
                              className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-bold text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <FaTrash />
                              {deletingId === item.id ? "O'chirilmoqda..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            <aside className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/40">Detail panel</p>
                  <h3 className="mt-2 text-xl font-black text-white">User ma'lumoti</h3>
                </div>
                {selectedUser ? (
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10"
                  >
                    <FaXmark />
                  </button>
                ) : null}
              </div>

              {selectedUser ? (
                <div className="space-y-4">
                  <div className="rounded-[1.6rem] border border-white/10 bg-black/15 p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-gradient-to-br from-cyan-400 to-blue-500 text-2xl font-black text-slate-950">
                        {(selectedUser.username || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xl font-black text-white">{selectedUser.username}</p>
                        <p className="mt-1 truncate text-sm text-white/55">{selectedUser.email}</p>
                        <span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] ${roleTone(normalizeRoleLabel(selectedUser.roles))}`}>
                          {normalizeRoleLabel(selectedUser.roles)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-[1.6rem] border border-white/10 bg-black/15 p-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">User ID</p>
                      <p className="mt-2 break-all text-sm text-white/80">{selectedUser.id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">Ro'yxatdan o'tgan vaqt</p>
                      <p className="mt-2 text-sm text-white/80">{formatUserCreatedAt(selectedUser)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/40">Backend roles</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(selectedUser.roles ?? []).map((role) => (
                          <span
                            key={role}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/75"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.6rem] border border-rose-400/15 bg-rose-500/10 p-4">
                    <p className="text-sm font-black text-white">Xavfli amal</p>
                    <p className="mt-2 text-sm text-rose-100/70">
                      Userni o'chirishdan oldin email va role’ni qayta tekshiring.
                    </p>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteUser(selectedUser)}
                      disabled={selectedUser.id === user?.id || deletingId === selectedUser.id}
                      className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-rose-300/20 bg-rose-500/15 px-4 py-3 text-sm font-bold text-rose-100 transition hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FaTrash />
                      {deletingId === selectedUser.id ? "O'chirilmoqda..." : "Delete user"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-[1.6rem] border border-dashed border-white/10 bg-white/5 px-5 py-10 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-white/5 text-cyan-300">
                    <FaEye className="text-2xl" />
                  </div>
                  <p className="mt-4 text-lg font-black text-white">User tanlang</p>
                  <p className="mt-2 text-sm text-white/45">
                    Ro'yxatdan bitta foydalanuvchini bossangiz detail panel shu yerda ochiladi.
                  </p>
                </div>
              )}
            </aside>
          </section>
        </main>
      </div>

      {pendingDeleteUser ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(30,41,59,0.92))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.38)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.3rem] bg-rose-500/15 text-rose-200">
              <FaExclamationTriangle className="text-2xl" />
            </div>
            <h3 className="mt-4 text-2xl font-black text-white">Userni o'chirish</h3>
            <p className="mt-2 text-sm leading-6 text-white/60">
              <span className="font-bold text-white">{pendingDeleteUser.username}</span> foydalanuvchisini
              butunlay o'chirmoqchimisiz? Bu amal qaytarib bo'lmaydi.
            </p>

            <div className="mt-5 rounded-[1.3rem] border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              <p>
                <span className="text-white/40">Email:</span> {pendingDeleteUser.email}
              </p>
              <p className="mt-2">
                <span className="text-white/40">Role:</span> {normalizeRoleLabel(pendingDeleteUser.roles)}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setPendingDeleteUser(null)}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/80 transition hover:bg-white/10"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deletingId === pendingDeleteUser.id}
                className="flex-1 rounded-2xl bg-gradient-to-r from-rose-500 to-red-500 px-4 py-3 text-sm font-black text-white transition hover:brightness-110 disabled:opacity-70"
              >
                {deletingId === pendingDeleteUser.id ? "O'chirilmoqda..." : "Ha, delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
