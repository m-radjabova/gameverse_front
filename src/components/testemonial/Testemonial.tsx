import { FaStar } from "react-icons/fa";
import testimonal from "../../assets/testimonial.svg";

function Testemonial() {
  return (
    <section className="w-full bg-gradient-to-br from-white via-cyan-50 to-white py-14 animate-fade-in-up">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* LEFT */}
          <div className="space-y-5">
            <div className="flex items-center gap-3 group">
              <span className="h-[1px] w-10 bg-slate-900 group-hover:w-16 transition-all duration-300"></span>

              <p className="text-sm font-semibold tracking-[0.25em] group-hover:text-teal-600 transition-colors duration-300">
                TESTIMONIAL
              </p>
            </div>


            <h1 className="text-[70px] text-slate-900 hover:text-teal-600 transition-colors duration-300">
              What They Say?
            </h1>

            <p className="max-w-lg text-[26px] leading-8 text-slate-600 hover:text-slate-900 transition-colors duration-300">
              TOTC has got more than <span className="font-semibold text-teal-600">100k</span>{" "}
              positive ratings from our users around the world.
            </p>

            <p className="max-w-lg text-[26px] leading-8 text-slate-600 hover:text-slate-900 transition-colors duration-300">
              Some of the students and teachers were greatly helped by the Skilline.
            </p>

            <p className="max-w-lg text-[26px] leading-8 text-slate-600 hover:text-slate-900 transition-colors duration-300">
              Are you too? Please give your assessment
            </p>

            <button className="inline-flex items-center justify-center rounded-full text-[#49BBBD] border-2 border-[#49BBBD] px-6 py-3 text-[20px] font-semibold shadow-md transition-all duration-300 active:scale-[0.98] hover:bg-[#49BBBD] hover:text-white hover:shadow-lg hover-lift hover-shine">
              Write your assessment
            </button>
          </div>

          {/* RIGHT */}
          <div className="relative flex items-center justify-center animate-slide-in-right">
            {/* image container */}
            <div className="relative w-full max-w-md group">
              {/* soft background blob */}
              <div className="absolute -left-6 -top-6 h-28 w-28 rounded-full bg-orange-100 blur-2xl animate-float" />
              <div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full bg-sky-100 blur-2xl animate-pulse-slow" />

              <div className="rounded-3xl bg-slate-50 p-6 shadow-lg group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
                <img
                  src={testimonal}
                  alt="testimonial"
                  className="w-full object-contain group-hover:drop-shadow-lg transition-all duration-300"
                />
              </div>

              {/* Overlay Card */}
              <div className="absolute -bottom-8 -right-1/2 border-l-4 border-orange-400 pl-4 -translate-x-1/2 rounded-2xl  bg-white p-5 shadow-xl sm:w-[85%] hover-lift hover:shadow-2xl transition-all duration-300 group">
                <p className="text-sm leading-6 text-slate-600 border-l-2 pl-4 border-gray-200 group-hover:text-slate-900 transition-colors duration-300">
                  “Thank you so much for your help. It's exactly what I've been
                  looking for. You won't regret it. It really saves me time and
                  effort. TOTC is exactly what our business has been lacking.”
                </p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900 group-hover:text-teal-600 transition-colors duration-300">Gloria Rose</p>
                  </div>

                  <div className="mt-1">
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400 hover:scale-125 transition-transform duration-300" />
                    <FaStar className="text-yellow-400 hover:scale-125 transition-transform duration-300" />
                    <FaStar className="text-yellow-400 hover:scale-125 transition-transform duration-300" />
                    <FaStar className="text-yellow-400 hover:scale-125 transition-transform duration-300" />
                    <FaStar className="text-yellow-400 hover:scale-125 transition-transform duration-300" />
                    </div>
                    <p className="text-xs mt-1 text-slate-500 group-hover:text-teal-600 transition-colors duration-300">12 reviews at Yelp</p>
                  </div>
                </div>
              </div>
              {/* end overlay */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testemonial;
