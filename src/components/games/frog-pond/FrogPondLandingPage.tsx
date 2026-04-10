import {
  FaBolt,
  FaBookOpen,
  FaClock,
  FaFlagCheckered,
  FaFrog,
  FaLeaf,
  FaRobot,
  FaUsers,
} from "react-icons/fa6";
import { GiLilyPads, GiPathDistance } from "react-icons/gi";
import GameFeedbackPanel from "../shared/GameFeedbackPanel";
import GameLeaderboardPanel from "../shared/GameLeaderboardPanel";
import GamePagePlayButton from "../shared/GamePagePlayButton";
import frogPondPreview from "../../../assets/frog_pond_image.png";

function FrogPondLandingPage() {
  const gameStats = [
    { icon: FaUsers, label: "O'YINCHILAR", value: "1-2 o'yinchi", color: "from-emerald-400 to-teal-400" },
    { icon: FaClock, label: "DAVOMIYLIK", value: "8-12 min", color: "from-amber-300 to-yellow-400" },
    { icon: FaBookOpen, label: "SAVOLLAR", value: "3 bosqich", color: "from-sky-400 to-blue-500" },
    { icon: FaRobot, label: "REJIM", value: "AI bilan", color: "from-rose-400 to-pink-500" },
  ];

  const features = [
    {
      icon: GiLilyPads,
      title: "Nilufar yo'li",
      desc: "Har to'g'ri javob qurbaqani keyingi bargga olib chiqadi.",
      color: "from-emerald-400 to-lime-400",
      stats: "7 daraja",
    },
    {
      icon: FaRobot,
      title: "AI qurbaqa",
      desc: "Yakka, jamoaviy yoki AI bilan bellashuv rejimini tanlang.",
      color: "from-sky-400 to-cyan-500",
      stats: "3 rejim",
    },
    {
      icon: FaBolt,
      title: "Tez qaror",
      desc: "Savollarga vaqt tugamasidan javob bering va suvga tushib ketmang.",
      color: "from-amber-300 to-orange-400",
      stats: "20 soniya",
    },
  ];

  const flow = [
    { label: "Rejim tanlash", detail: "Solo, ikki qurbaqa yoki AI raqib", icon: FaFrog, color: "from-emerald-400 to-teal-400" },
    { label: "Bargga sakrash", detail: "Tanlangan nilufar savolni ochadi", icon: FaLeaf, color: "from-lime-300 to-yellow-300" },
    { label: "Marraga yetish", detail: "3 bosqichni yakunlab g'olib bo'ling", icon: FaFlagCheckered, color: "from-rose-400 to-orange-400" },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#062b35] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(10,104,92,0.92),rgba(11,42,61,0.96)_48%,rgba(75,50,20,0.9))]" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-4 py-6 md:px-6 md:py-8 lg:px-8 xl:px-10">
        <div className="mb-8 grid gap-8 border border-white/10 bg-black/18 p-6 shadow-[0_30px_80px_rgba(2,18,24,0.35)] backdrop-blur-xl md:p-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:p-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 border border-emerald-200/20 bg-emerald-300/12 px-4 py-2 text-slate-100 shadow-sm">
              <GiLilyPads className="text-emerald-200" />
              <span className="text-sm font-black tracking-[0.22em] text-slate-100">FROG POND QUIZ</span>
            </div>

            <h1 className="text-4xl font-black leading-tight text-white md:text-5xl lg:text-6xl">
              Nilufardan nilufarga
              <br />
              <span className="text-[#f8f871]">sakrab g'alaba qiling</span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-emerald-50/85 md:text-lg">
              Qurbaqani barglar bo'ylab olib boring. Har bir sakrash savol bilan ochiladi, to'g'ri javob esa sizni
              marraga yaqinlashtiradi.
            </p>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {gameStats.map((stat) => (
                <div
                  key={stat.label}
                  className="border border-white/10 bg-white/8 p-4 shadow-[0_16px_32px_rgba(2,18,24,0.24)] backdrop-blur-sm"
                >
                  <div className={`mb-2 inline-flex bg-gradient-to-r ${stat.color} p-2.5 text-white shadow-lg`}>
                    <stat.icon className="text-lg" />
                  </div>
                  <p className="text-xs font-bold tracking-[0.18em] text-emerald-50/55">{stat.label}</p>
                  <p className="text-sm font-black text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            <GamePagePlayButton
              to="/games/frog-pond/play"
              colorClassName="from-emerald-500 via-sky-500 to-yellow-400"
              className="pt-2"
            />
          </div>

          <div className="relative overflow-hidden border border-white/10 bg-[#05242d]/70 p-3 shadow-2xl">
            <img
              src={frogPondPreview}
              alt="Frog Pond preview"
              className="h-[320px] w-full object-cover md:h-[430px] lg:h-[540px]"
            />
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="border border-white/10 bg-black/18 p-6 shadow-[0_16px_40px_rgba(2,18,24,0.28)] backdrop-blur-sm"
            >
              <div className={`mb-5 flex h-14 w-14 items-center justify-center bg-gradient-to-r ${feature.color} text-white shadow-xl`}>
                <feature.icon className="text-xl" />
              </div>
              <h3 className="mb-2 text-xl font-black text-white">{feature.title}</h3>
              <p className="mb-4 text-sm leading-6 text-emerald-50/78">{feature.desc}</p>
              <span className="text-xs font-black uppercase tracking-[0.22em] text-emerald-50/50">{feature.stats}</span>
            </div>
          ))}
        </div>

        <div className="mb-8 border border-white/10 bg-black/18 p-6 shadow-[0_18px_48px_rgba(2,18,24,0.28)] backdrop-blur-sm md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="bg-gradient-to-r from-emerald-500 to-yellow-400 p-3 text-white shadow-lg">
              <GiPathDistance className="text-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">O'yin oqimi</h2>
              <p className="text-sm text-emerald-50/60">Rejim tanlang, bargga sakrang va savollardan o'ting.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {flow.map((item) => (
              <div key={item.label} className="border border-white/10 bg-white/7 p-5">
                <div className={`mb-4 inline-flex bg-gradient-to-r ${item.color} p-3 text-white shadow-md`}>
                  <item.icon className="text-lg" />
                </div>
                <h3 className="text-lg font-black text-white">{item.label}</h3>
                <p className="mt-2 text-sm text-emerald-50/75">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <GameLeaderboardPanel gameKey="frog-pond" title="Sakra, qurbaqa! Reytingi" />

        <GameFeedbackPanel gameKey="frog-pond" />
      </div>
    </div>
  );
}

export default FrogPondLandingPage;
