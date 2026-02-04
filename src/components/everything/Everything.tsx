import confident from "../../assets/confident.svg";

function Everything() {
  return (
    <section className="bg-gradient-to-b from-white to-cyan-50 py-24 animate-fade-in-up">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10">
          
          {/* Left content */}
          <div className="animate-slide-in-left">
            <h2 className="text-[36px] leading-tight font-bold text-[#2F327D] hover:text-teal-600 transition-colors duration-300">
              Everything you can do in a physical classroom,{" "}
              <span className="text-[#49BBBD]">you can do with TOTC</span>
            </h2>

            <p className="mt-6 text-[24px] leading-8  text-[#696984] ">
              TOTC’s school management software helps traditional and online
              schools manage scheduling, attendance, payments and virtual
              classrooms all in one secure cloud-based system.
            </p>

            <button className="mt-6 text-[22px] font-medium text-[#696984] underline underline-offset-4 hover:text-[#49BBBD] hover:drop-shadow-lg transition-all duration-300">
              Learn more
            </button>
          </div>

          {/* Right image */}
          <div className="relative flex justify-center animate-slide-in-right">
            {/* Decorative shapes */}
            <div className="absolute -top-4 -left-2 h-16 w-16 rounded-lg bg-[#29B9E7] animate-float"></div>
            <div className="absolute -bottom-4 -right-3 h-20 w-20 rounded-lg bg-[#49BBBD] animate-pulse-slow"></div>

            {/* Image card */}
            <div className="relative overflow-hidden rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:shadow-2xl hover:scale-105 transition-all duration-500 group">
              <img
                src={confident}
                alt="classroom"
                className="h-[330px] w-[590px] object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center group-hover:bg-black/20 transition-all duration-300">
                <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg hover:shadow-xl hover:scale-125 transition-all duration-300 hover-lift hover-shine">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="#49BBBD"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Everything;
