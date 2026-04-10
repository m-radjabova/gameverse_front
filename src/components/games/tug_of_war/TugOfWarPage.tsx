import {
  FaBolt,
  FaCalculator,
  FaClock,
  FaGamepad,
  FaGripLines,
  FaPeopleCarryBox,
  FaTrophy,
  FaUsers,
} from "react-icons/fa6";
import { GiRopeCoil, GiStrongMan } from "react-icons/gi";
import GameFeedbackPanel from "../shared/GameFeedbackPanel";
import GamePagePlayButton from "../shared/GamePagePlayButton";
import tugOfWarPreview from "../../../assets/tug_of_war_img.png";

function TugOfWarPage() {
  const gameStats = [
    { icon: FaUsers, label: "O'YINCHILAR", value: "2 jamoa", color: "from-blue-400 to-cyan-400" },
    { icon: FaClock, label: "DAVOMIYLIK", value: "4-6 min", color: "from-orange-400 to-amber-400" },
    { icon: FaCalculator, label: "MISOLLAR", value: "Tezkor arifmetika", color: "from-indigo-400 to-blue-500" },
    { icon: FaTrophy, label: "MAQSAD", value: "Arqonni tortib yutish", color: "from-rose-400 to-orange-500" },
  ];

  const features = [
    {
      icon: GiRopeCoil,
      title: "Real tug arena",
      desc: "Markazdagi arqon har bir to'g'ri javob bilan bir tomonga siljiydi va kuchlar muvozanati ko'rinib turadi.",
      color: "from-amber-400 to-orange-500",
      stats: "Live rope meter",
    },
    {
      icon: FaGamepad,
      title: "Ikki panelda bir vaqtning o'zida",
      desc: "Har ikki jamoa o'z keypad panelida parallel javob beradi, shu sabab o'yin juda dinamik bo'ladi.",
      color: "from-blue-400 to-indigo-500",
      stats: "Dual keypad",
    },
    {
      icon: FaBolt,
      title: "Tezlik va aniqlik",
      desc: "Faqat to'g'ri javob emas, barqaror ketma-ket javoblar ham ustunlik beradi va bosimni oshiradi.",
      color: "from-rose-400 to-red-500",
      stats: "Momentum system",
    },
  ];

  const rounds = [
    { label: "Oson start", detail: "Qo'shish va ayirish", icon: FaCalculator, color: "from-emerald-400 to-lime-400" },
    { label: "O'rta bosqich", detail: "Ko'paytirish va bo'lish", icon: FaGripLines, color: "from-sky-400 to-blue-500" },
    { label: "Final sprint", detail: "Aralash misollar", icon: GiStrongMan, color: "from-orange-400 to-rose-500" },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#0b1020] via-[#16213d] to-[#3a1f1a]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -right-24 bottom-20 h-96 w-96 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.16),transparent_30%),radial-gradient(circle_at_bottom,rgba(249,115,22,0.12),transparent_28%)]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(226,232,240,0.16) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-4 py-6 md:px-6 md:py-8 lg:px-8 xl:px-10">
        <div className="relative mb-8 overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/55 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl md:p-8 lg:p-10">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-transparent to-orange-500/10" />

          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-slate-100 shadow-sm">
                <FaPeopleCarryBox className="text-cyan-300" />
                <span className="text-sm font-black tracking-[0.22em] text-slate-100">TUG OF WAR ARENA</span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-white md:text-5xl lg:text-6xl">
                Arqonni tortib,
                <br />
                <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-orange-300 bg-clip-text text-transparent">
                  jamoa bilan yuting
                </span>
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-slate-300 md:text-lg">
                Ikki jamoa matematik savollarga parallel javob beradi. Har to'g'ri javob arqonni o'z tomoningizga
                tortadi, natijada haqiqiy musobaqadek kuch, tezlik va fokus birlashadi.
              </p>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {gameStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-white/8 p-4 shadow-[0_16px_32px_rgba(2,6,23,0.25)] backdrop-blur-sm"
                  >
                    <div className={`mb-2 inline-flex rounded-xl bg-gradient-to-r ${stat.color} p-2.5 text-white shadow-lg`}>
                      <stat.icon className="text-lg" />
                    </div>
                    <p className="text-xs font-bold tracking-[0.18em] text-slate-400">{stat.label}</p>
                    <p className="text-sm font-black text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              <GamePagePlayButton
                to="/games/tug-of-war/play"
                colorClassName="from-blue-500 via-slate-700 to-orange-500"
                className="pt-2"
              />
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-r from-cyan-500/20 to-orange-500/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/60 p-3 shadow-2xl">
                <img
                  src={tugOfWarPreview}
                  alt="Tug of War preview"
                  className="h-[320px] w-full rounded-[24px] object-cover md:h-[420px] lg:h-[520px]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-[28px] border border-white/10 bg-slate-950/55 p-6 shadow-[0_16px_40px_rgba(2,6,23,0.3)] backdrop-blur-sm"
            >
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r ${feature.color} text-white shadow-xl`}>
                <feature.icon className="text-xl" />
              </div>
              <h3 className="mb-2 text-xl font-black text-white">{feature.title}</h3>
              <p className="mb-4 text-sm leading-6 text-slate-300">{feature.desc}</p>
              <span className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">{feature.stats}</span>
            </div>
          ))}
        </div>

        <div className="mb-8 rounded-[32px] border border-white/10 bg-slate-950/55 p-6 shadow-[0_18px_48px_rgba(2,6,23,0.3)] backdrop-blur-sm md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-orange-500 p-3 text-white shadow-lg">
              <GiStrongMan className="text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">O'yin oqimi</h2>
              <p className="text-sm text-slate-400">Bosqichlar boshqa game page'lar kabi aniq va ko'rinarli qilindi.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {rounds.map((item) => (
              <div
                key={item.label}
                className="rounded-3xl border border-white/10 bg-white/6 p-5"
              >
                <div className={`mb-4 inline-flex rounded-2xl bg-gradient-to-r ${item.color} p-3 text-white shadow-md`}>
                  <item.icon className="text-lg" />
                </div>
                <h3 className="text-lg font-black text-white">{item.label}</h3>
                <p className="mt-2 text-sm text-slate-300">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <GameFeedbackPanel gameKey="tug-of-war" />
      </div>
    </div>
  );
}

export default TugOfWarPage;
