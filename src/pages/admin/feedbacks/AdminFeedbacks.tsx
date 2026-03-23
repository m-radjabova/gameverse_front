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
  Flower2,
  Heart,
  Sparkles,
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
    {
      label: activeTab === "pending" ? "Pending" : "Approved",
      value: visibleComments.length,
      icon: MessageSquareQuote,
      gradient: "from-pink-400 to-rose-400",
    },
    {
      label: "O'rtacha baho",
      value: averageRating,
      icon: Star,
      gradient: "from-amber-400 to-pink-400",
    },
    {
      label: "O'yinlar",
      value: new Set(visibleComments.map((item) => item.game_key)).size,
      icon: Gamepad2,
      gradient: "from-rose-400 to-amber-400",
    },
  ];

  const tabs = [
    {
      id: "pending" as const,
      label: "Kutilayotgan",
      count: pendingState.comments.length,
      icon: Clock3,
      description: "Tasdiqlashni kutayotgan feedbacklar",
      gradient: "from-amber-400 to-pink-400",
    },
    {
      id: "approved" as const,
      label: "Tasdiqlangan",
      count: approvedState.comments.length,
      icon: ShieldCheck,
      description: "Tasdiqlangan feedbacklar",
      gradient: "from-pink-400 to-rose-400",
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
    <div className="relative space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-xl shadow-2xl border border-white/60">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-200/20 via-rose-200/20 to-amber-200/20" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-rose-300/20 rounded-full blur-3xl" />
        
        <div className="relative p-4 md:p-6">
          {/* Tabs and Search */}
          <div className="mt-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid gap-3 sm:grid-cols-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-pink-100/80 to-rose-100/80 border-pink-200/50 shadow-md"
                        : "bg-white/40 border-white/60 hover:bg-white/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-lg transition-all ${
                        isActive 
                          ? `bg-gradient-to-br ${tab.gradient} text-white shadow-md`
                          : "bg-white/60 text-rose-500"
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isActive 
                          ? "bg-white/60 text-rose-700" 
                          : "bg-white/50 text-rose-600 border border-pink-200/50"
                      }`}>
                        {tab.count}
                      </span>
                    </div>
                    <p className={`mt-4 text-lg font-bold ${
                      isActive ? "text-rose-800" : "text-rose-700"
                    }`}>
                      {tab.label}
                    </p>
                    <p className="mt-1 text-sm text-rose-600/60">{tab.description}</p>
                    
                    {/* Decorative Element */}
                    {isActive && (
                      <div className="absolute bottom-2 right-2 opacity-30">
                        <Flower2 className="h-8 w-8 text-pink-300" strokeWidth={1} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid gap-6 md:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.label}
              className="group relative overflow-hidden rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60 p-6 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 hover:bg-white/60"
            >
              <div className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-md`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-rose-500/70">
                {item.label}
              </p>
              <p className="mt-2 text-4xl font-bold text-rose-800">{item.value}</p>
              
              {/* Decorative Heart */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Heart className="h-5 w-5 text-pink-300" fill="currentColor" />
              </div>
            </article>
          );
        })}
      </section>

      {/* Feedback List */}
      <section className="grid gap-4">
        {loading ? (
          <div className="rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60 px-6 py-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <Sparkles className="h-8 w-8 text-pink-400 animate-pulse" />
              <p className="text-rose-600">Feedbacklar yuklanmoqda...</p>
            </div>
          </div>
        ) : visibleComments.map((item) => (
          <article
            key={item.id}
            className="group relative overflow-hidden rounded-2xl bg-white/40 backdrop-blur-sm border border-white/60 p-5 transition-all duration-300 hover:shadow-md hover:bg-white/60"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${
                  activeTab === "pending" 
                    ? "from-amber-400 to-pink-400" 
                    : "from-pink-400 to-rose-400"
                } shadow-md text-white font-bold text-lg`}>
                  {(item.username || "T").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-rose-800">{item.username || "Teacher"}</h3>
                    <span className="rounded-full bg-white/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-rose-600 border border-pink-200/50">
                      {item.game_key}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                        activeTab === "pending"
                          ? "border-amber-200/60 bg-amber-50/60 text-amber-700"
                          : "border-pink-200/60 bg-pink-50/60 text-pink-700"
                      }`}
                    >
                      {activeTab === "pending" ? "Kutilmoqda" : "Tasdiqlangan"}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-rose-500/60">
                    <span>🌸 Yuborilgan: {formatDate(item.created_at)}</span>
                    {item.approved_at && <span>✅ Tasdiqlangan: {formatDate(item.approved_at)}</span>}
                    {item.approver_username && <span>👤 Admin: {item.approver_username}</span>}
                  </div>
                  <p className="mt-3 max-w-4xl text-sm leading-relaxed text-rose-700/80">
                    "{item.comment}"
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-100 to-pink-100 px-3 py-2 text-sm font-semibold text-amber-700">
                  <Star className="h-4 w-4 fill-current text-amber-500" />
                  {item.rating}.0
                </div>

                {activeTab === "pending" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void handleApprove(item.id)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-400 to-rose-400 px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-md disabled:opacity-60"
                    >
                      <CheckCheck className="h-4 w-4" />
                      {processingId === item.id && pendingState.approving ? "Tasdiqlanmoqda..." : "Tasdiqlash"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleReject(item.id)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-200/60 bg-white/60 px-4 py-2 text-sm font-semibold text-rose-600 transition-all hover:bg-rose-50 disabled:opacity-60"
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
                    <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-100 to-rose-100 px-4 py-2 text-sm font-semibold text-rose-700">
                      <ShieldCheck className="h-4 w-4" />
                      Approved
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleUnapprove(item.id)}
                      disabled={isBusy}
                      className="inline-flex items-center gap-2 rounded-full border border-pink-200/60 bg-white/60 px-4 py-2 text-sm font-semibold text-rose-600 transition-all hover:bg-white/80 disabled:opacity-60"
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

            {/* Decorative Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-pink-200/0 via-pink-200/10 to-rose-200/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </article>
        ))}

        {!loading && visibleComments.length === 0 && (
          <div className="rounded-2xl border border-dashed border-pink-200/60 bg-white/30 px-6 py-12 text-center">
            <Flower2 className="mx-auto h-12 w-12 text-pink-300 mb-3" strokeWidth={1.5} />
            <p className="text-xl font-bold text-rose-700">
              {activeTab === "pending" ? "Kutilayotgan feedback yo'q" : "Tasdiqlangan feedback topilmadi"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}