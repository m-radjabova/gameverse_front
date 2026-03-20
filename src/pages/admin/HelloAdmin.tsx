import { useEffect, useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaEnvelope,
  FaExclamationTriangle,
  FaSearch,
  FaTrash,
  FaUserShield,
  FaUsers,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import apiClient from "../../apiClient/apiClient";
import useContextPro from "../../hooks/useContextPro";
import type { User } from "../../types/types";
import { getErrorMessage } from "../../utils/error";
import { formatUserCreatedAt } from "../../utils/userDates";
import { FcRefresh } from "react-icons/fc";

function normalizeRoleLabel(roles?: string[]) {
  const normalized = (roles ?? []).map((role) => role.toLowerCase());
  if (normalized.includes("admin")) return "Admin";
  if (normalized.includes("teacher")) return "Teacher";
  return "Teacher";
}

export default function HelloAdmin() {
  const navigate = useNavigate();
  const {
    state: { user },
  } = useContextPro();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const loadUsers = async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "initial") {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      setError("");
      const res = await apiClient.get<User[]>("/users/");
      setUsers(Array.isArray(res.data) ? res.data : []);
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

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;

    return users.filter((item) => {
      const roleLabel = normalizeRoleLabel(item.roles).toLowerCase();
      return (
        item.username?.toLowerCase().includes(query) ||
        item.email?.toLowerCase().includes(query) ||
        roleLabel.includes(query)
      );
    });
  }, [search, users]);

  const adminCount = useMemo(
    () => users.filter((item) => item.roles?.some((role) => role.toLowerCase() === "admin")).length,
    [users]
  );

  const teacherCount = useMemo(
    () => users.filter((item) => item.roles?.some((role) => role.toLowerCase() === "teacher")).length,
    [users]
  );

  const handleDelete = async () => {
    if (!pendingDeleteUser?.id || deletingId || pendingDeleteUser.id === user?.id) return;
    try {
      setDeletingId(pendingDeleteUser.id);
      await apiClient.delete(`/users/${pendingDeleteUser.id}`);
      setUsers((prev) => prev.filter((item) => item.id !== pendingDeleteUser.id));
      setPendingDeleteUser(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(15,23,42,0.9),rgba(49,46,129,0.55))] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.28em] text-cyan-200">
                <FaUserShield />
                Admin Panel
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                <FaArrowLeft />
                Bosh sahifa
              </button>
              <button
                type="button"
                onClick={() => void loadUsers("refresh")}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:brightness-110 disabled:opacity-70"
              >
                <FcRefresh className={isRefreshing ? "animate-spin" : ""} />
                Yangilash
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/12 text-cyan-300">
              <FaUsers />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/45">Jami foydalanuvchi</p>
            <p className="mt-2 text-3xl font-black text-white">{users.length}</p>
          </div>

          <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-fuchsia-400/12 text-fuchsia-300">
              <FaUserShield />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/45">Adminlar</p>
            <p className="mt-2 text-3xl font-black text-white">{adminCount}</p>
          </div>

          <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/12 text-amber-300">
              <FaCalendarAlt />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/45">Teacherlar</p>
            <p className="mt-2 text-3xl font-black text-white">{teacherCount}</p>
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl md:p-5">
          <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-black text-white">Users ro'yxati</h2>
              <p className="mt-1 text-sm text-white/50">
                Kim qachon ro'yxatdan o'tganini va rolini shu yerda ko'rasiz.
              </p>
            </div>

            <label className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <FaSearch className="text-white/45" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Username, email yoki role bo'yicha qidiring..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
              />
            </label>
          </div>

          {error ? (
            <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[0, 1, 2, 3].map((item) => (
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
                Qidiruvni o'zgartirib ko'ring yoki foydalanuvchilarni yangilang.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((item) => {
                const roleLabel = normalizeRoleLabel(item.roles);
                const isSelf = item.id === user?.id;

                return (
                  <article
                    key={item.id}
                    className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 transition hover:border-white/15 hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))]"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-lg font-black text-slate-950">
                          {(item.username || "U").charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-lg font-black text-white">{item.username}</p>
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] ${
                                roleLabel === "Admin"
                                  ? "bg-fuchsia-400/15 text-fuchsia-200"
                                  : roleLabel === "Teacher"
                                    ? "bg-amber-400/15 text-amber-200"
                                    : "bg-emerald-400/15 text-emerald-200"
                              }`}
                            >
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
                      </div>

                      <div className="flex items-center justify-end gap-3">
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
        </section>
      </div>

      {pendingDeleteUser ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(30,41,59,0.92))] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.38)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.3rem] bg-rose-500/15 text-rose-200">
              <FaExclamationTriangle className="text-2xl" />
            </div>
            <h3 className="mt-4 text-2xl font-black text-white">Userni o'chirish</h3>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Siz rostdan ham <span className="font-bold text-white">{pendingDeleteUser.username}</span> userini
              o'chirmoqchimisiz? Bu amal qaytarib bo'lmaydi.
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
                Yo'q
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deletingId === pendingDeleteUser.id}
                className="flex-1 rounded-2xl bg-gradient-to-r from-rose-500 to-red-500 px-4 py-3 text-sm font-black text-white transition hover:brightness-110 disabled:opacity-70"
              >
                {deletingId === pendingDeleteUser.id ? "O'chirilmoqda..." : "Ha"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
