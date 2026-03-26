import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Mail,
  Trash2,
  UsersRound,
} from "lucide-react";
import apiClient from "../../../apiClient/apiClient";
import useContextPro from "../../../hooks/useContextPro";
import type { User } from "../../../types/types";
import { getErrorMessage } from "../../../utils/error";
import { formatUserCreatedAt } from "../../../utils/userDates";

function normalizeRoleLabel(roles?: string[]) {
  const normalized = (roles ?? []).map((role) => role.toLowerCase());
  if (normalized.includes("admin")) return "Admin";
  if (normalized.includes("teacher")) return "Teacher";
  return "Teacher";
}

function roleTone(roleLabel: string) {
  if (roleLabel === "Admin") return "border-black/15 bg-black text-white";
  return "border-black/10 bg-black/[0.05] text-black/75";
}

export default function AdminUsers() {
  const {
    state: { user },
  } = useContextPro();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      setError("");
      const res = await apiClient.get<User[]>("/users/");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });
  }, [users]);

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedUsers.slice(start, start + pageSize);
  }, [currentPage, sortedUsers]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white px-6 py-6 text-black shadow-[0_24px_70px_rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
            <UsersRound className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-black/45">Directory</p>
            <h2 className="mt-1 text-2xl font-semibold">Users management</h2>
            <p className="mt-1 text-sm text-black/55">Oxirgi qo'shilgan userlar birinchi ko'rinadi.</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-black/10 bg-black/[0.04] px-4 py-3 text-sm text-black/75">
            {error}
          </div>
        )}
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/52">
          <UsersRound className="h-3.5 w-3.5" />
          Barcha a'zolar
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 animate-pulse">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-white/10" />
                    <div>
                      <div className="h-4 w-40 rounded-full bg-white/10" />
                      <div className="mt-3 h-3 w-56 rounded-full bg-white/10" />
                    </div>
                  </div>
                  <div className="h-10 w-24 rounded-2xl bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedUsers.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-5 py-14 text-center">
            <p className="text-xl font-semibold text-white">Hech qanday a'zo topilmadi</p>
            <p className="mt-2 text-sm text-white/48">Backenddan userlar kelganda shu yerda ko'rinadi.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedUsers.map((item) => {
              const roleLabel = normalizeRoleLabel(item.roles);
              const isSelf = item.id === user?.id;

              return (
                <article
                  key={item.id}
                  className="rounded-[28px] border border-white/10 bg-white px-5 py-5 text-black transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(255,255,255,0.06)]"
                >
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 flex-1 items-start gap-4 text-left">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black text-lg font-semibold text-white">
                        {(item.username || "U").charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-lg font-semibold text-black">{item.username}</p>
                          <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${roleTone(roleLabel)}`}>
                            {roleLabel}
                          </span>
                          {isSelf && (
                            <span className="rounded-full border border-black/10 bg-black/[0.05] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-black/65">
                              Siz
                            </span>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-black/60">
                          <span className="inline-flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5" />
                            {item.email}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatUserCreatedAt(item)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 xl:justify-end">
                      <button
                        type="button"
                        onClick={() => setPendingDeleteUser(item)}
                        disabled={isSelf || deletingId === item.id}
                        className="inline-flex items-center gap-2 rounded-2xl border border-black/10 bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingId === item.id ? "O'chirilmoqda..." : "O'chirish"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {sortedUsers.length > pageSize && (
          <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/45">
              {sortedUsers.length} ta user, {currentPage}/{totalPages} sahifa
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/72 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Birinchi sahifa"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/72 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Oldingi sahifa"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`h-10 min-w-10 rounded-2xl px-3 text-sm font-semibold transition ${
                    currentPage === page
                      ? "bg-white text-black shadow-[0_10px_24px_rgba(255,255,255,0.12)]"
                      : "border border-white/10 bg-white/[0.04] text-white/72 hover:bg-white/[0.08]"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/72 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Keyingi sahifa"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/72 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Oxirgi sahifa"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {pendingDeleteUser && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white p-6 text-black shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-2xl font-semibold">A'zoni o'chirish</h3>
            <p className="mt-2 text-sm leading-7 text-black/65">
              <span className="font-semibold text-black">{pendingDeleteUser.username}</span> a'zosini ro'yxatdan
              o'chirmoqchimisiz? Bu amal qaytarib bo'lmaydi.
            </p>

            <div className="mt-5 rounded-2xl border border-black/10 bg-black/[0.03] p-4 text-sm">
              <p className="flex items-center gap-2 text-black/75">
                <Mail className="h-3.5 w-3.5" />
                <span className="font-medium">Email:</span> {pendingDeleteUser.email}
              </p>
              <p className="mt-2 flex items-center gap-2 text-black/75">
                <UsersRound className="h-3.5 w-3.5" />
                <span className="font-medium">Role:</span> {normalizeRoleLabel(pendingDeleteUser.roles)}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setPendingDeleteUser(null)}
                className="flex-1 rounded-2xl border border-black/10 bg-black/[0.04] px-4 py-3 text-sm font-semibold text-black/75 transition hover:bg-black/[0.08]"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deletingId === pendingDeleteUser.id}
                className="flex-1 rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/90 disabled:opacity-70"
              >
                {deletingId === pendingDeleteUser.id ? "O'chirilmoqda..." : "Ha, o'chirish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
