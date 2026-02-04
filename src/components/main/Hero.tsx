import Girl from "../../assets/girl.svg";
import asistentn from "../../assets/asistents.svg";
import icon from "../../assets/icon.svg";
import congratulation from "../../assets/congratulation.svg";
import user from "../../assets/user.svg";

function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 overflow-hidden pt-10">
      <div className="mx-auto max-w-7xl px-6 pt-14 pb-18">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="text-white animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              <span className="text-orange-400 inline-block animate-bounce-light">Studying</span> Online is now
              <br />
              much easier
            </h1>

            <p className="mt-6 max-w-md text-white/80 leading-relaxed opacity-0 animate-fade-in-up" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
              TOTC is an interesting platform that will teach you in more an
              interactive way
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-6 opacity-0 animate-fade-in-up" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
              <button className="h-12 px-8 rounded-full bg-white/20 text-white font-semibold hover:bg-white/40 transition-all duration-300 hover-lift border border-white/30 backdrop-blur-sm hover:shadow-lg hover:shadow-orange-300/30">
                Join for free
              </button>

              <button className="flex items-center gap-3 text-white/90 hover:text-white transition-all duration-300 font-medium group hover-lift">
                <span className="grid place-items-center h-12 w-12 rounded-full bg-white group-hover:shadow-lg group-hover:shadow-orange-300/50 transition-all duration-300 animate-pulse-slow">
                  {/* play icon */}
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-teal-600 group-hover:scale-110 transition-transform duration-300"
                  >
                    <path
                      d="M8.5 6.5V17.5L18 12L8.5 6.5Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                Watch how it works
              </button>
            </div>
          </div>

          {/* Right */}
          <div className="relative flex justify-center lg:justify-end animate-slide-in-right">
            {/* Wrapper: hamma absolute shunga nisbatan ishlaydi */}
            <div className="relative w-[360px] md:w-[500px] lg:w-[560px] h-[420px] md:h-[520px]">
              {/* Girl */}
              <img
                src={Girl}
                alt="student"
                className="absolute right-0 bottom-0 w-[300px] md:w-[420px] lg:w-[460px] drop-shadow-2xl hover:drop-shadow-[0_20px_40px_rgba(255,165,0,0.3)] transition-all duration-500 hover:scale-105 animate-float"
              />

              {/* Assisted student (top-left card) */}
              <img
                src={asistentn}
                alt="assisted"
                className="absolute left-0 top-16 md:top-20 w-44 md:w-52 hover-lift hover:shadow-xl transition-all duration-300 rounded-2xl hover:scale-110 cursor-pointer"
                style={{ animationDelay: "0.5s" }}
              />

              {/* Small icon (top-right small square) */}
              <img
                src={icon}
                alt="icon"
                className="absolute right-6 md:right-10 top-24 md:top-28 w-12 md:w-14 hover:scale-125 transition-transform duration-300 animate-pulse-slow cursor-pointer"
              />

              {/* Congratulation (right-middle card) */}
              <img
                src={congratulation}
                alt="congratulation"
                className="absolute right-0 md:right-2 top-48 md:top-56 w-56 md:w-64 hover-lift hover:shadow-2xl transition-all duration-300 rounded-2xl hover:scale-110 cursor-pointer"
                style={{ animationDelay: "1s" }}
              />

              {/* User class (bottom-left card) */}
              <img
                src={user}
                alt="user"
                className="absolute left-10 md:left-14 bottom-6 md:bottom-10 w-64 md:w-72 hover-lift hover:shadow-2xl transition-all duration-300 rounded-2xl hover:scale-110 cursor-pointer"
                style={{ animationDelay: "0.8s" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg
          viewBox="0 0 1440 140"
          className="w-full h-[110px] md:h-[140px]"
          preserveAspectRatio="none"
        >
          <path
            d="M0,90 C240,140 480,140 720,95 C960,50 1200,50 1440,95 L1440,140 L0,140 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    </section>
  );
}

export default Hero;
