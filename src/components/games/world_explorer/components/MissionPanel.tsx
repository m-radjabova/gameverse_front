import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Country, ExploreFeedback } from "../types";

type MissionPanelProps = {
  selectedCountry: Country | null;
  feedback: ExploreFeedback | null;
  completedMissionIds: string[];
  onClose: () => void;
};

export default function MissionPanel({
  selectedCountry,
  feedback,
  completedMissionIds,
  onClose,
}: MissionPanelProps) {
  const [openDetail, setOpenDetail] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const isCompleted = selectedCountry
    ? completedMissionIds.includes(selectedCountry.id)
    : false;
  const statusMessage = isCompleted
    ? "Bu davlat allaqachon o'rganilgan. Xohlasangiz, boshqa nuqtani tanlab yana davom etishingiz mumkin."
    : null;

  useEffect(() => {
    setOpenDetail(selectedCountry?.details[0]?.label ?? null);
    setImageFailed(false);
  }, [selectedCountry]);

  const detailMap = new Map(selectedCountry?.details.map((detail) => [detail.label, detail.value]) ?? []);
  const snapshotCards = [
    { label: "Poytaxt", value: detailMap.get("Poytaxt") ?? detailMap.get("Poytaxt markazi") ?? "Ma'lumot yo'q" },
    { label: "Aholisi", value: detailMap.get("Aholisi") ?? "Ma'lumot yo'q" },
    { label: "Valyutasi", value: detailMap.get("Valyutasi") ?? "Ma'lumot yo'q" },
    { label: "Mintaqa", value: detailMap.get("Mintaqa") ?? "Ma'lumot yo'q" },
  ];
  const visualHighlights = [
    { label: "Ko'rish shart", value: detailMap.get("Ko'rish shart") },
    { label: "Mashhur joylari", value: detailMap.get("Mashhur joylari") },
    { label: "Mashhur taomlari", value: detailMap.get("Mashhur taomlari") },
    { label: "Bayramlari", value: detailMap.get("Bayramlari") },
    { label: "Sporti", value: detailMap.get("Sporti") },
    { label: "Tabiati", value: detailMap.get("Tabiati") },
    { label: "Iqtisodiyoti", value: detailMap.get("Iqtisodiyoti") },
    { label: "O'quvchi fakt", value: detailMap.get("O'quvchi fakt") },
  ].filter((item) => Boolean(item.value));
  const remainingDetails = selectedCountry?.details.filter(
    (detail) => ![
      "Poytaxt",
      "Poytaxt markazi",
      "Aholisi",
      "Valyutasi",
      "Mintaqa",
      "Ko'rish shart",
      "Mashhur joylari",
      "Mashhur taomlari",
      "Bayramlari",
      "Sporti",
      "Tabiati",
      "Iqtisodiyoti",
      "O'quvchi fakt",
    ].includes(detail.label),
  ) ?? [];

  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 z-20 flex w-full items-start justify-end p-4 md:p-6">
      <AnimatePresence mode="wait">
        {selectedCountry ? (
          <motion.aside
            key={selectedCountry.id}
            animate={{ opacity: 1, x: 0 }}
            className="pointer-events-auto flex h-[calc(100vh-2rem)] w-full max-w-md flex-col overflow-hidden rounded-[30px] border border-white/12 bg-slate-950/70 text-slate-100 shadow-[0_24px_80px_rgba(15,23,42,0.45)] backdrop-blur-2xl md:h-[calc(100vh-3rem)]"
            exit={{ opacity: 0, x: 32 }}
            initial={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5 md:px-6">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200/75">
                  Davlat ma'lumoti
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
                  <span className="mr-3 text-[1.1em]">{selectedCountry.flag}</span>
                  {selectedCountry.name}
                </h2>
              </div>
              <button
                className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-200 transition hover:bg-white/10"
                onClick={onClose}
                type="button"
              >
                Yopish
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6">
              <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/5">
                {imageFailed ? (
                  <div className="relative flex h-52 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(103,232,249,0.16),_transparent_55%)]" />
                    <div className="relative flex flex-col items-center gap-3 px-6 text-center">
                      <span className="text-5xl">{selectedCountry.flag}</span>
                      <p className="text-lg font-semibold text-white">{selectedCountry.name}</p>
                      <p className="text-sm text-slate-300">{selectedCountry.imageCaption}</p>
                    </div>
                  </div>
                ) : (
                  <img
                    alt={`${selectedCountry.name} - ${selectedCountry.imageCaption}`}
                    className="h-52 w-full object-cover"
                    loading="lazy"
                    onError={() => setImageFailed(true)}
                    referrerPolicy="no-referrer"
                    src={selectedCountry.imageUrl}
                  />
                )}
                <div className="border-t border-white/10 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/75">
                    Mashhur jihati
                  </p>
                  <p className="mt-2 text-sm font-medium text-white">{selectedCountry.famousFor}</p>
                  <p className="mt-2 text-xs text-slate-400">{selectedCountry.imageCaption}</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {snapshotCards.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-[20px] border border-white/10 bg-white/6 p-4 shadow-[0_18px_48px_rgba(15,23,42,0.18)]"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                      {card.label}
                    </p>
                    <p className="mt-2 text-sm font-medium leading-6 text-white">{card.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[24px] border border-cyan-200/10 bg-white/6 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Qisqacha
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  {selectedCountry.summary}
                </p>
              </div>

              <div className="mt-5">
                <p className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-400">
                  Rasmli bo'limlar
                </p>
                <div className="grid gap-3">
                  {visualHighlights.map((detail) => (
                    <div
                      key={detail.label}
                      className="relative overflow-hidden rounded-[22px] border border-white/10 bg-slate-900/70"
                    >
                      <img
                        alt={`${selectedCountry.name} ${detail.label}`}
                        className="absolute inset-0 h-full w-full object-cover opacity-20"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                        referrerPolicy="no-referrer"
                        src={selectedCountry.imageUrl}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-950/72 to-cyan-950/55" />
                      <div className="relative px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200/75">
                          {detail.label}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-100">{detail.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-400">
                  Qo'shimcha ma'lumot
                </p>
                <div className="grid gap-3">
                  {remainingDetails.map((detail) => (
                    <button
                      key={detail.label}
                      className={`rounded-[20px] border px-4 py-3 text-left transition ${
                        openDetail === detail.label
                          ? "border-cyan-300/35 bg-cyan-300/10"
                          : "border-white/10 bg-white/5"
                      }`}
                      onClick={() =>
                        setOpenDetail((current) => (current === detail.label ? null : detail.label))
                      }
                      type="button"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                          {detail.label}
                        </p>
                        <span className="text-lg leading-none text-slate-400">
                          {openDetail === detail.label ? "−" : "+"}
                        </span>
                      </div>
                      <AnimatePresence initial={false}>
                        {openDetail === detail.label && (
                          <motion.p
                            animate={{ opacity: 1, height: "auto" }}
                            className="overflow-hidden text-sm leading-6 text-slate-200"
                            exit={{ opacity: 0, height: 0 }}
                            initial={{ opacity: 0, height: 0 }}
                          >
                            <span className="block pt-2">{detail.value}</span>
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {feedback && (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-5 rounded-[22px] border p-4 text-sm ${
                      feedback.kind === "new"
                        ? "border-emerald-400/30 bg-emerald-400/12 text-emerald-100"
                        : "border-cyan-300/25 bg-cyan-300/10 text-cyan-50"
                    }`}
                    exit={{ opacity: 0, y: 8 }}
                    initial={{ opacity: 0, y: 10 }}
                  >
                    {feedback.message}
                  </motion.div>
                )}
              </AnimatePresence>

              {statusMessage && (
                <div className="mt-5 rounded-[22px] border border-cyan-300/15 bg-cyan-300/10 p-4 text-sm text-cyan-50">
                  {statusMessage}
                </div>
              )}
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
