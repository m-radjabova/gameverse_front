import { useMemo, useState } from "react";
import {
  FaStar,
  FaPlay,
  FaArrowRight,
  FaRegLightbulb,
  FaPaintBrush,
  FaLayerGroup,
  FaUserNinja,
} from "react-icons/fa";
import { GiSparkles, GiOrbit, GiPlanetCore } from "react-icons/gi";
import { MdOutlineTipsAndUpdates } from "react-icons/md";
import howItWorksImage from "../../assets/how_it_works.png";

type Topic = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;

  // Right card content
  titleLines: [string, string, string];
  description: { normal: string; highlight?: string; tail?: string };
};

const topics: Topic[] = [
  {
    id: "Ro'yhatdan o'tish",
    label: "Ro'yhatdan o'tish",
    icon: <FaLayerGroup className="text-xl" />,
    color: "from-[#ffd966] to-[#ffb347]",
    titleLines: ["RO‘YXATDAN", "O‘TING", "BOSHLANG"],
    description: {
      normal:
        "Bir necha soniyada ro‘yxatdan o‘ting va shaxsiy profilingizni yarating.",
      highlight: "Hammasi oson va tez!",
      tail: "Keyin o‘zingizga mos o‘yinni tanlab boshlang.",
    },
  },
  {
    id: "O'yinlardan birini tanlang",
    label: "O'yinlardan birini tanlang",
    icon: <FaPaintBrush className="text-xl" />,
    color: "from-[#ff9acb] to-[#d42d73]",
    titleLines: ["O‘YINNI", "TANLANG", "BOSHLANG"],
    description: {
      normal:
        "Mavzu yoki fan bo‘yicha o‘yinlardan birini tanlang va darajangizga mos mashq qiling.",
      highlight: "Har bir o‘yin — yangi bilim!",
      tail: "Bosqichma-bosqich murakkablashib boradi.",
    },
  },
  {
    id: "Birga o'ynang va o'rgating",
    label: "Birga o'ynang va o'rgating",
    icon: <FaUserNinja className="text-xl" />,
    color: "from-[#63d3da] to-[#2a9d8f]",
    titleLines: ["BIRGA", "O‘YNANG", "O‘RGANING"],
    description: {
      normal:
        "Do‘stlaringiz yoki sinfdoshlaringiz bilan birga o‘ynang — jamoa bo‘lib o‘rganish yanada qiziqarli.",
      highlight: "Birga o‘qish — kuch!",
      tail: "Natijalarni solishtiring va bir-biringizni qo‘llab-quvvatlang.",
    },
  },
  {
    id: "Fikringizni qoldiring",
    label: "Fikringizni qoldiring",
    icon: <FaRegLightbulb className="text-xl" />,
    color: "from-[#f4a261] to-[#e76f51]",
    titleLines: ["FIKR", "BILDIRING", "YAXSHILAYLIK"],
    description: {
      normal:
        "Platforma sizga yoqdimi? Taklif yoki fikringizni qoldiring — biz uni yanada qulay qilamiz.",
      highlight: "Sizning fikringiz muhim!",
      tail: "Har bir mulohaza rivojlanishga yordam beradi.",
    },
  },
];

function HowItWorksSection() {
  const [activeId, setActiveId] = useState<string>(topics[0].id);

  const activeIndex = useMemo(
    () => topics.findIndex((t) => t.id === activeId),
    [activeId]
  );

  const activeTopic = topics[activeIndex] ?? topics[0];
  const nextTopic = topics[(activeIndex + 1) % topics.length];

  return (
    <section
      className={`
        relative min-h-screen overflow-hidden bg-gradient-to-b from-[#efefef] to-[#e5e5e5] py-16 lg:py-24`}
    >
      {/* Pink Background Band */}
      <div className="absolute inset-x-0 top-0 h-[100vh] lg:h-[120vh] bg-gradient-to-r from-[#d42d73] to-[#c2185b]">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 animate-pulse">
            <GiSparkles className="text-6xl text-white/20" />
          </div>
          <div className="absolute right-40 bottom-10 animate-bounce">
            <GiOrbit className="text-7xl text-white/10" />
          </div>
        </div>
      </div>

      <div className="relative z-20 mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative text-center lg:text-left mb-12 lg:mb-16">
          <div
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-5 py-2 rounded-full mb-6 border border-white/30"
            data-aos="fade-up"
          >
            <FaPlay className="text-white text-xs" />
            <span className="text-xs font-black tracking-[0.3em] text-white">
              BILIM SARGUZASHTI BOSHLANDI
            </span>
          </div>

          <h2 className="font-bebas text-5xl sm:text-5xl lg:text-7xl text-white leading-none">
            <span
              className="block transform hover:scale-105 transition-transform duration-300"
              data-aos="fade-right"
              data-aos-delay="100"
            >
              PLATFORMA QANDAY
            </span>
            <span
              className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ffd966] to-[#ffb347] drop-shadow-[0_4px_0_rgba(0,0,0,0.3)]"
              data-aos="fade-left"
              data-aos-delay="180"
            >
              ISHLAYDI?
            </span>
          </h2>

          <div className="absolute -bottom-8 left-0 w-32 h-1 bg-gradient-to-r from-[#ffd966] to-transparent rounded-full hidden lg:block" />
        </div>

        {/* Main Content Grid */}
        <div className=" relative grid gap-8 lg:grid-cols-[380px_1fr] lg:gap-12">
          {/* Left Sidebar Menu */}
          <div className="relative z-30" data-aos="fade-right" data-aos-delay="260">
            <div className="relative transform hover:-translate-y-2 transition-transform duration-500">
              <div className="absolute -inset-4 bg-black/20 rounded-[32px] blur-2xl" />

              <div className="relative rounded-[32px] bg-gradient-to-br from-[#e22b73] to-[#c2185b] p-8 shadow-[0_30px_40px_rgba(0,0,0,0.3)] overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_70%)]" />

                <div className="relative flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <FaPlay className="text-white text-sm" />
                  </div>
                  <span className="text-white/60 text-xs font-bold tracking-wider">
                    BOSQICHNI TANLANG
                  </span>
                </div>

                <div className="relative space-y-4">
                  {topics.map((topic) => {
                    const isActive = topic.id === activeId;

                    return (
                      <button
                        key={topic.id}
                        onClick={() => setActiveId(topic.id)}
                        type="button"
                        className={`
                          group relative w-full overflow-hidden rounded-2xl transition-all duration-500 text-left
                          ${isActive
                            ? "shadow-[0_10px_0_rgba(0,0,0,0.2)]"
                            : "hover:shadow-[0_8px_0_rgba(0,0,0,0.1)]"}
                        `}
                      >
                        <div
                          className={`
                            absolute inset-0 bg-gradient-to-r ${topic.color}
                            ${isActive ? "opacity-100" : "opacity-40 group-hover:opacity-60"}
                            transition-opacity duration-300
                          `}
                        />

                        <div
                          className={`
                            relative flex items-center gap-4 px-6 py-5
                            ${isActive ? "border-2 border-white" : "border-2 border-transparent"}
                            rounded-2xl
                          `}
                        >
                          <div
                            className={`
                              w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center
                              transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300
                              ${isActive ? "bg-white/30" : ""}
                            `}
                          >
                            <span className="text-2xl text-white">{topic.icon}</span>
                          </div>

                          <span
                            className={`
                              font-bebas text-2xl tracking-wide
                              ${isActive ? "text-white" : "text-white/80"}
                            `}
                          >
                            {topic.label}
                          </span>

                          {isActive && (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="absolute -bottom-10 -right-10 opacity-20">
                  <GiPlanetCore className="text-8xl text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Card */}
          <div className="relative z-20" data-aos="fade-left" data-aos-delay="340">
            <div className="relative transform group hover:-translate-y-2 transition-transform duration-500">
              <div className="absolute -inset-4 bg-black/20 rounded-[32px] blur-2xl" />

              <div className="relative rounded-[32px] bg-white shadow-[0_30px_40px_rgba(0,0,0,0.2)] overflow-visible">
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: `radial-gradient(circle at 20px 20px, #d42d73 2px, transparent 0)`,
                    backgroundSize: "40px 40px",
                  }}
                />

                <div className="relative p-8 lg:p-10 lg:pr-[480px]">
                  {/* Rating */}
                  <div className="inline-flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-full mb-6">
                    <FaStar className="text-[#ffd966] text-xl" />
                    <span className="font-black text-gray-800">4.9</span>
                    <span className="text-xs text-gray-500">(1,2 ming baho)</span>
                  </div>

                  {/* Dynamic Title */}
                  <h3 className="font-bebas text-5xl sm:text-6xl lg:text-7xl text-[#191919] leading-none mb-6">
                    <span className="block transform group-hover:translate-x-2 transition-transform duration-300">
                      {activeTopic.titleLines[0]}
                    </span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#d42d73] to-[#c2185b]">
                      {activeTopic.titleLines[1]}
                    </span>
                    <span className="block">{activeTopic.titleLines[2]}</span>
                  </h3>

                  {/* Dynamic Description */}
                  <div className="max-w-xl space-y-4">
                    <p className="font-['Inter'] text-sm font-semibold text-gray-600 leading-relaxed">
                      {activeTopic.description.normal}
                      {activeTopic.description.highlight && (
                        <span className="block text-[#d42d73] font-black">
                          {activeTopic.description.highlight}
                        </span>
                      )}
                      {activeTopic.description.tail && (
                        <span className="block">{activeTopic.description.tail}</span>
                      )}
                    </p>
                  </div>

                  <div className="absolute right-[520px] top-20 animate-pulse">
                    <GiSparkles className="text-4xl text-[#ffd966] opacity-40" />
                  </div>
                </div>

                {/* Bottom Yellow Bar */}
                <div className="relative bg-gradient-to-r from-[#ffd966] to-[#ffb347] py-6 px-8 lg:px-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-sm">
                        <MdOutlineTipsAndUpdates className="text-2xl text-[#1a1a1a]" />
                      </div>
                      <div>
                        <div className="font-['Bebas_Neue'] text-xl text-[#1a1a1a]">
                          KEYINGI BOSQICH
                        </div>
                        <div className="text-xs text-[#1a1a1a]/70">{nextTopic.label}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveId(nextTopic.id)}
                      className="group/btn relative z-40 bottom-5 overflow-hidden rounded-full bg-[#1a1a1a] px-8 py-4 text-white font-black tracking-wider shadow-[0_8px_0_rgba(0,0,0,0.3)] transition-all hover:translate-y-1 hover:shadow-[0_6px_0_rgba(0,0,0,0.3)] active:translate-y-2 active:shadow-[0_4px_0_rgba(0,0,0,0.3)] lg:translate-x-6 lg:translate-y-6"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        Batafsil
                        <FaArrowRight className="text-sm group-hover/btn:translate-x-2 transition-transform" />
                      </span>
                      <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
                    </button>
                  </div>
                </div>

                {/* Character Image */}
                <div className="pointer-events-none absolute -bottom-1 right-0 z-20 lg:-bottom-3 lg:right-6">
                  <div className="relative group/image">
                    <div className="absolute -inset-4 bg-gradient-to-r from-[#ffd966] to-[#ffb347] rounded-full blur-2xl opacity-30 group-hover/image:opacity-50 transition-opacity" />
                    <img
                      src={howItWorksImage}
                      alt="How it works character"
                      className="relative z-10 w-[320px] lg:w-[420px] select-none object-contain drop-shadow-[0_30px_25px_rgba(0,0,0,0.3)] transform group-hover/image:scale-105 group-hover/image:-translate-y-2 transition-all duration-500"
                      draggable={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Dots */}
        <div
          className="relative mt-16 flex justify-center items-center gap-4"
          data-aos="fade-up"
          data-aos-delay="420"
        >
          <button
            type="button"
            onClick={() =>
              setActiveId(
                topics[(activeIndex - 1 + topics.length) % topics.length].id
              )
            }
            className="w-10 h-10 rounded-full bg-gradient-to-r from-[#ffd966] to-[#ffb347] flex items-center justify-center shadow-[0_6px_0_rgba(200,100,0,0.5)] hover:translate-y-1 hover:shadow-[0_4px_0_rgba(200,100,0,0.5)] transition-all"
          >
            <FaArrowRight className="text-white transform rotate-180" />
          </button>

          <div className="flex gap-3">
            {topics.map((t, i) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveId(t.id)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "bg-gradient-to-r from-[#d42d73] to-[#c2185b] scale-125 shadow-lg"
                    : "bg-gray-400 hover:bg-gray-500"
                }`}
                aria-label={`Go to ${t.label}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setActiveId(nextTopic.id)}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-[#ffd966] to-[#ffb347] flex items-center justify-center shadow-[0_6px_0_rgba(200,100,0,0.5)] hover:translate-y-1 hover:shadow-[0_4px_0_rgba(200,100,0,0.5)] transition-all"
          >
            <FaArrowRight className="text-white" />
          </button>
        </div>

        {/* Background Decorations */}
        <div className="absolute left-[40%] top-[300px] -z-10">
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 border-4 border-[#ffd966]/20 rounded-full animate-spin-slow" />
            <div className="absolute inset-8 border-2 border-[#d42d73]/20 rounded-full animate-spin-slower" />
          </div>
        </div>

        <svg
          className="pointer-events-none absolute bottom-0 right-0 w-[420px] opacity-20"
          viewBox="0 0 420 260"
          fill="none"
        >
          <path
            d="M120 210c-50 0-88-30-88-70 0-36 31-66 72-70 13-34 48-59 89-59 48 0 88 32 96 76 50 3 90 36 90 76 0 42-44 77-98 77H120z"
            stroke="#d42d73"
            strokeWidth="4"
          />
        </svg>
      </div>
    </section>
  );
}

export default HowItWorksSection;
