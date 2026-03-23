import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Filter,
  Mail,
  Trash2,
  Flower2,
  UsersRound,
  Sparkles,
} from "lucide-react";
import apiClient from "../../../apiClient/apiClient";
import useContextPro from "../../../hooks/useContextPro";
import type { User } from "../../../types/types";
import { getErrorMessage } from "../../../utils/error";
import { formatUserCreatedAt } from "../../../utils/userDates";

type RoleFilter = "all" | "admin" | "teacher";

function normalizeRoleLabel(roles?: string[]) {
  const normalized = (roles ?? []).map((role) => role.toLowerCase());
  if (normalized.includes("admin")) return "Admin";
  if (normalized.includes("teacher")) return "Teacher";
  return "Teacher";
}

function roleTone(roleLabel: string) {
  if (roleLabel === "Admin") return "bg-pink-400/15 text-pink-600 border-pink-200/50";
  if (roleLabel === "Teacher") return "bg-amber-400/15 text-amber-600 border-amber-200/50";
  return "bg-rose-400/15 text-rose-600 border-rose-200/50";
}

function roleBadgeColor(roleLabel: string) {
  if (roleLabel === "Admin") return "from-pink-400 to-rose-400";
  if (roleLabel === "Teacher") return "from-amber-400 to-pink-400";
  return "from-rose-400 to-amber-400";
}

export default function AdminUsers() {
  const {
    state: { user },
  } = useContextPro();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      setError("");
      const res = await apiClient.get<User[]>("/users/");
      const nextUsers = Array.isArray(res.data) ? res.data : [];
      setUsers(nextUsers);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      const roleLabel = normalizeRoleLabel(item.roles);
      const roleMatches = roleFilter === "all" ? true : roleLabel.toLowerCase() === roleFilter;
      return roleMatches;
    });
  }, [roleFilter, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [currentPage, filteredUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter]);

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

  const roleOptions: { id: RoleFilter; label: string }[] = [
    { id: "all", label: "Barcha a'zolar" },
    { id: "admin", label: "Adminlar" },
    { id: "teacher", label: "Teacherlar" },
  ];

  return (
    <div className="relative space-y-8">
      {/* Filter Section */}
      <section className="relative">
        <div className="rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60 p-6 shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-rose-400 shadow-md">
                <UsersRound className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="mt-0.5 text-sm text-rose-600/60">
                  Users
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {roleOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setRoleFilter(option.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    roleFilter === option.id
                      ? "bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-md"
                      : "bg-white/50 text-rose-600 hover:bg-white/70 border border-pink-200/50"
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-rose-200/60 bg-rose-50/80 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
        </div>
      </section>

      {/* Users List Section */}
      <section>
        <div className="rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60 p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between gap-3">
           <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-2 text-xs font-semibold text-rose-600 border border-pink-200/50">
              <Sparkles className="h-3 w-3" />
              {roleOptions.find((option) => option.id === roleFilter)?.label}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3, 4].map((item) => (
                <div key={item} className="rounded-xl border border-pink-200/50 bg-white/30 p-4 animate-pulse">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-pink-200/50" />
                      <div>
                        <div className="h-4 w-40 rounded-full bg-pink-200/50" />
                        <div className="mt-2 h-3 w-56 rounded-full bg-pink-200/50" />
                      </div>
                    </div>
                    <div className="h-10 w-24 rounded-xl bg-pink-200/50" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-pink-200/60 bg-white/30 px-5 py-12 text-center">
              <Flower2 className="mx-auto h-12 w-12 text-pink-300 mb-3" strokeWidth={1.5} />
              <p className="text-lg font-bold text-rose-700">Hech qanday a'zo topilmadi</p>
              <p className="mt-2 text-sm text-rose-500/60">
                Filtrni o'zgartirib ko'ring yoki yangi a'zolar qo'shilishini kuting.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedUsers.map((item) => {
                const roleLabel = normalizeRoleLabel(item.roles);
                const isSelf = item.id === user?.id;
                const badgeGradient = roleBadgeColor(roleLabel);

                return (
                  <article
                    key={item.id}
                    className="group relative overflow-hidden rounded-xl border border-pink-200/50 bg-white/40 p-4 transition-all duration-300 hover:shadow-md hover:bg-white/60"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex min-w-0 flex-1 items-start gap-4 text-left">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${badgeGradient} shadow-md text-white font-bold text-lg`}>
                          {(item.username || "U").charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-lg font-bold text-rose-800">{item.username}</p>
                            <span
                              className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${roleTone(roleLabel)}`}
                            >
                              {roleLabel}
                            </span>
                            {isSelf && (
                              <span className="rounded-full bg-gradient-to-r from-pink-200 to-rose-200 px-3 py-1 text-[10px] font-semibold text-rose-700">
                                Siz
                              </span>
                            )}
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-rose-600/70">
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
                          className="inline-flex items-center gap-2 rounded-xl border border-rose-200/60 bg-white/60 px-4 py-2.5 text-sm font-semibold text-rose-600 transition-all hover:bg-rose-50 hover:border-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingId === item.id ? "O'chirilmoqda..." : "O'chirish"}
                        </button>
                      </div>
                    </div>

                    {/* Decorative Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-200/0 via-pink-200/10 to-rose-200/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </article>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {filteredUsers.length > pageSize && (
            <div className="mt-6 flex flex-col gap-3 border-t border-pink-200/50 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-full border border-pink-200/50 bg-white/50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Oldingi
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-9 w-9 rounded-full text-sm font-semibold transition-all ${
                      currentPage === page
                        ? "bg-gradient-to-r from-pink-400 to-rose-400 text-white shadow-md"
                        : "border border-pink-200/50 bg-white/50 text-rose-600 hover:bg-white/70"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-full border border-pink-200/50 bg-white/50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Keyingi
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {pendingDeleteUser && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-rose-950/40 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-xl border border-pink-200/60 p-6 shadow-2xl">
            {/* Decorative Flower */}
            <div className="absolute -top-3 -right-3">
              <Flower2 className="h-10 w-10 text-pink-300/50" strokeWidth={1.5} />
            </div>
            
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-pink-400 shadow-md">
              <Trash2 className="h-7 w-7 text-white" />
            </div>
            <h3 className="mt-4 text-2xl font-bold text-rose-800">A'zoni o'chirish</h3>
            <p className="mt-2 text-sm leading-relaxed text-rose-600/70">
              <span className="font-bold text-rose-800">{pendingDeleteUser.username}</span> a'zosini
              gulistondan butunlay o'chirmoqchimisiz? Bu amal qaytarib bo'lmaydi.
            </p>

            <div className="mt-5 rounded-xl border border-pink-200/50 bg-pink-50/50 p-4 text-sm">
              <p className="flex items-center gap-2 text-rose-700">
                <Mail className="h-3.5 w-3.5" />
                <span className="font-medium">Email:</span> {pendingDeleteUser.email}
              </p>
              <p className="mt-2 flex items-center gap-2 text-rose-700">
                <UsersRound className="h-3.5 w-3.5" />
                <span className="font-medium">Role:</span> {normalizeRoleLabel(pendingDeleteUser.roles)}
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setPendingDeleteUser(null)}
                className="flex-1 rounded-xl border border-pink-200/60 bg-white/60 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-white/80"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deletingId === pendingDeleteUser.id}
                className="flex-1 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white transition-all hover:shadow-md disabled:opacity-70"
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