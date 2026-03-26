import { useMemo, useState } from "react";
import {
  CheckCheck,
  Clock3,
  Gamepad2,
  History,
  MessageSquareQuote,
  ShieldCheck,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  useAdminApprovedGameFeedback,
  useAdminPendingGameFeedback,
} from "../../../hooks/useGameFeedback";
import type { AdminGameComment } from "../../../types/types";

type ModerationTab = "pending" | "approved";

function formatDate(value?: string) {
  if (!value) return "No date";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("uz-UZ");
}

function filterComments(comments: AdminGameComment[], query: string) {
  const value = query.trim().toLowerCase();
  if (!value) return comments;

  return comments.filter((item) =>
    [
      item.username,
      item.game_key,
      item.comment,
      item.approver_username,
      item.created_at,
      item.approved_at,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(value),
  );
}

export default function AdminFeedbacks() {
  const [query] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ModerationTab>("pending");
  const pendingState = useAdminPendingGameFeedback();
  const approvedState = useAdminApprovedGameFeedback();

  const pendingComments = useMemo(
    () => filterComments(pendingState.comments, query),
    [pendingState.comments, query],
  );
  const approvedComments = useMemo(
    () => filterComments(approvedState.comments, query),
    [approvedState.comments, query],
  );

  const visibleComments = activeTab === "pending" ? pendingComments : approvedComments;
  const loading = activeTab === "pending" ? pendingState.loading : approvedState.loading;
  const isBusy = pendingState.approving || pendingState.rejecting || approvedState.unapproving;

  const averageRating = (
    visibleComments.reduce((sum, item) => sum + item.rating, 0) / Math.max(visibleComments.length, 1)
  ).toFixed(1);

  const stats = [
    { label: activeTab === "pending" ? "Pending" : "Approved", value: visibleComments.length, icon: MessageSquareQuote },
    { label: "O'rtacha baho", value: averageRating, icon: Star },
    { label: "O'yinlar", value: new Set(visibleComments.map((item) => item.game_key)).size, icon: Gamepad2 },
  ];

  const tabs = [
    {
      id: "pending" as const,
      label: "Kutilayotgan",
      count: pendingState.comments.length,
      icon: Clock3,
      description: "Tasdiqlashni kutayotgan feedbacklar",
    },
    {
      id: "approved" as const,
      label: "Tasdiqlangan",
      count: approvedState.comments.length,
      icon: ShieldCheck,
      description: "Tasdiqlangan feedbacklar",
    },
  ];

  const handleApprove = async (feedbackId: string) => {
    setProcessingId(feedbackId);
    try {
      await pendingState.approve(feedbackId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (feedbackId: string) => {
    setProcessingId(feedbackId);
    try {
      await pendingState.reject(feedbackId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnapprove = async (feedbackId: string) => {
    setProcessingId(feedbackId);
    try {
      await approvedState.unapprove(feedbackId);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white px-6 py-6 text-black shadow-[0_24px_70px_rgba(255,255,255,0.08)]">
        <div className="grid gap-3 sm:grid-cols-2 xl:max-w-3xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-[24px] border p-4 text-left transition ${
                  isActive
                    ? "border-black bg-black text-white"
                    : "border-black/10 bg-black/[0.03] text-black hover:bg-black/[0.06]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isActive ? "bg-white text-black" : "bg-black text-white"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isActive ? "bg-white/12 text-white" : "border border-black/10 bg-white text-black/75"}`}>
                    {tab.count}
                  </span>
                </div>
                <p className="mt-4 text-lg font-semibold">{tab.label}</p>
                <p className={`mt-1 text-sm ${isActive ? "text-white/62" : "text-black/58"}`}>{tab.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.label}
              className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-black">
                <Icon className="h-6 w-6" />
              </div>
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/42">{item.label}</p>
              <p className="mt-3 text-4xl font-semibold text-white">{item.value}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4">
        {loading ? (
          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] px-6 py-14 text-center">
            <p className="text-sm font-medium text-white/58">Feedbacklar yuklanmoqda...</p>
          </div>
        ) : visibleComments.map((item) => (
          <article
            key={item.id}
            className="rounded-[28px] border border-white/10 bg-white px-5 py-5 text-black transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(255,255,255,0.06)]"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-lg font-semibold text-white">
                  {(item.username || "T").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{item.username || "Teacher"}</h3>
                    <span className="rounded-full border border-black/10 bg-black/[0.05] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-black/72">
                      {item.game_key}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${
                        activeTab === "pending"
                          ? "border border-black/10 bg-black text-white"
                          : "border border-black/10 bg-black/[0.06] text-black/75"
                      }`}
                    >
                      {activeTab === "pending" ? "Kutilmoqda" : "Tasdiqlangan"}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-black/50">
                    <span>Yuborilgan: {formatDate(item.created_at)}</span>
                    {item.approved_at && <span>Tasdiqlangan: {formatDate(item.approved_at)}</span>}
                    {item.approver_username && <span>Admin: {item.approver_username}</span>}
                  </div>

                  <p className="mt-3 max-w-4xl text-sm leading-7 text-black/70">"{item.comment}"</p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.04] px-3 py-2 text-sm font-semibold text-black/75">
                  <Star className="h-4 w-4 fill-current text-black" />
                  {item.rating}.0
                </div>

                {activeTab === "pending" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void handleApprove(item.id)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-black/88 disabled:opacity-60"
                    >
                      <CheckCheck className="h-4 w-4" />
                      {processingId === item.id && pendingState.approving ? "Tasdiqlanmoqda..." : "Tasdiqlash"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleReject(item.id)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.04] px-4 py-2 text-sm font-semibold text-black/75 transition hover:bg-black/[0.08] disabled:opacity-60"
                    >
                      {processingId === item.id && pendingState.rejecting ? (
                        <Trash2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      {processingId === item.id && pendingState.rejecting ? "Rad etilmoqda..." : "Rad etish"}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-semibold text-white">
                      <ShieldCheck className="h-4 w-4" />
                      Approved
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleUnapprove(item.id)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.04] px-4 py-2 text-sm font-semibold text-black/75 transition hover:bg-black/[0.08] disabled:opacity-60"
                    >
                      <History className="h-4 w-4" />
                      {processingId === item.id && approvedState.unapproving
                        ? "Qaytarilmoqda..."
                        : "Kutilayotganlar safiga"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </article>
        ))}

        {!loading && visibleComments.length === 0 && (
          <div className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.03] px-6 py-14 text-center">
            <p className="text-xl font-semibold text-white">
              {activeTab === "pending" ? "Kutilayotgan feedback yo'q" : "Tasdiqlangan feedback topilmadi"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
