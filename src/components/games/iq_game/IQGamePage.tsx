import { FaBrain, FaClock, FaCrown, FaPuzzlePiece, FaUsers } from "react-icons/fa";
import { GiBrain } from "react-icons/gi";
import GameFeedbackPanel from "../shared/GameFeedbackPanel";
import GamePagePlayButton from "../shared/GamePagePlayButton";
import IQTestImage from "../../../assets/iq_test_image.png";

function IQGamePage() {
  const gameStats = [
    { icon: FaClock, label: "DAVOMIYLIK", value: "5-10 daqiqa", color: "from-sky-400 to-cyan-400" },
    { icon: GiBrain, label: "TUR", value: "Rasmli IQ test", color: "from-cyan-400 to-blue-500" },
    { icon: FaUsers, label: "O'YINCHILAR", value: "1-2 o'yinchi", color: "from-blue-500 to-violet-500" },
    { icon: FaCrown, label: "NATIJA", value: "IQ 70-160", color: "from-violet-500 to-fuchsia-500" },
  ];

  const features = [
    {
      icon: FaPuzzlePiece,
      title: "Rasmli savollar",
      desc: "Asosiy savol ham, variantlar ham rasm ko'rinishida chiqadi.",
      color: "from-sky-400 to-cyan-400",
      stats: "50 ta dataset",
    },
    {
      icon: FaUsers,
      title: "1 yoki 2 o'yinchi",
      desc: "Start tugmasidan mode tanlanadi va o'yin play sahifada boshlanadi.",
      color: "from-cyan-400 to-blue-500",
      stats: "Auto mode select",
    },
    {
      icon: FaBrain,
      title: "IQ baholash",
      desc: "Finalda to'g'ri javoblar soni, accuracy va taxminiy IQ ko'rsatiladi.",
      color: "from-blue-500 to-violet-500",
      stats: "Live score",
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#04131f] via-[#0a2540] to-[#21104d] [&_button]:cursor-pointer">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full bg-violet-500/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 2px 2px, rgba(125,211,252,0.12) 2px, transparent 0)",
            backgroundSize: "42px 42px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[2000px] px-4 py-6 md:px-6 md:py-8 lg:px-8 xl:px-10">
        <div className="group relative mb-8 overflow-hidden rounded-3xl border border-sky-400/20 bg-gradient-to-br from-sky-900/30 via-slate-900/40 to-violet-900/30 p-6 backdrop-blur-xl shadow-2xl md:p-8 lg:p-10">
          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-2xl border border-sky-400/25 bg-sky-500/10 px-4 py-2">
                <GiBrain className="text-cyan-300" />
                <span className="text-sm font-black tracking-[0.22em] text-cyan-100">IQ BATTLE ARENA</span>
              </div>

              <h1 className="text-4xl font-black md:text-5xl lg:text-6xl">
                <span className="bg-gradient-to-r from-cyan-100 via-sky-200 to-violet-200 bg-clip-text text-transparent">
                  Rasmli IQ
                </span>
                <br />
                <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent">
                  challenge
                </span>
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-slate-200/80 md:text-lg">
                Quiz Battle uslubidagi IQ o'yini. Start tugmasi bosilganda 1 yoki 2 o'yinchi tanlanadi,
                keyin o'yin alohida play sahifada boshlanadi. Savollar va variantlar to'liq rasmli formatda ishlaydi.
              </p>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {gameStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="relative overflow-hidden rounded-xl border border-sky-400/15 bg-slate-950/35 p-4 backdrop-blur-sm"
                  >
                    <div className={`mb-2 inline-flex rounded-lg bg-gradient-to-r ${stat.color} p-2.5`}>
                      <stat.icon className="text-lg text-white" />
                    </div>
                    <p className="text-xs font-bold text-slate-400">{stat.label}</p>
                    <p className="text-sm font-black text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              <GamePagePlayButton
                to="/games/iq-game/play"
                colorClassName="from-sky-500 via-cyan-500 to-violet-500"
                className="pt-2"
                modeSelectionEnabled
              />
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-sky-500/20 via-cyan-500/20 to-violet-500/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-2xl border-2 border-sky-400/25 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-t from-[#04131f] via-transparent to-transparent z-10" />
                <img src={IQTestImage} alt="IQ game preview" className="h-[360px] w-full object-cover md:h-[440px] lg:h-[520px]" />
                <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                  <div className="inline-flex items-center gap-3 rounded-2xl border border-sky-300/20 bg-black/40 px-4 py-2 backdrop-blur-md">
                    <FaBrain className="text-cyan-300" />
                    <span className="text-sm font-black text-white">VISUAL IQ GAME</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/35 p-6 backdrop-blur-sm"
            >
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} text-white shadow-xl`}>
                <feature.icon className="text-xl" />
              </div>
              <h3 className="mb-2 text-xl font-black text-white">{feature.title}</h3>
              <p className="mb-4 text-sm text-slate-300">{feature.desc}</p>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200/80">{feature.stats}</span>
            </div>
          ))}
        </div>

        <GameFeedbackPanel gameKey="iq-game" />
      </div>
    </div>
  );
}

export default IQGamePage;
