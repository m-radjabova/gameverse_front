import news1 from "../../assets/news1.svg";
import news2 from "../../assets/news2.svg";
import news3 from "../../assets/news3.svg";
import news4 from "../../assets/news4.svg";

function LatestNews() {
  return (
    <section className="w-full bg-gradient-to-b from-white to-cyan-50 py-16 animate-fade-in-up">
      <div className="mx-auto max-w-7xl px-4">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl hover:text-teal-600 transition-colors duration-300">
            Lastest News and Resources
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            See the developments that have occurred to TOTC in the world
          </p>
        </div>

        {/* Grid */}
        <div className="mt-12 grid gap-10 lg:grid-cols-12">
          {/* LEFT big card */}
          <article className="lg:col-span-6">
            <div className="group overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover-lift">
              <div className="relative overflow-hidden">
                <img
                  src={news1}
                  alt="news"
                  className="h-[300px] w-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* badge */}
                <span className="absolute -bottom-4 left-6 rounded-full bg-teal-500 px-5 py-2 text-xs font-semibold text-white shadow-md group-hover:animate-bounce-light transition-all duration-300">
                  NEWS
                </span>
              </div>

              <div className="px-6 pb-7 pt-8">
                <h3 className="text-[26px] font-extrabold leading-snug text-slate-900 sm:text-xl group-hover:text-teal-600 transition-colors duration-300">
                  Class adds $30 million to its balance sheet for a Zoom-friendly
                  edtech solution
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base group-hover:text-slate-900 transition-colors duration-300">
                  Class, launched less than a year ago by Blackboard co-founder
                  Michael Chasen, integrates exclusively...
                </p>

                <button className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition-all duration-300 group-hover:text-teal-600 group-hover:translate-x-1">
                  Read more
                  <span className="text-lg">→</span>
                </button>
              </div>
            </div>
          </article>

          {/* RIGHT list cards */}
          <div className="space-y-5 lg:col-span-6">
            {/* Card 1 */}
            <article className="group flex gap-4 rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl">
                <img
                  src={news2}
                  alt="press release"
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-2 left-2 rounded-full bg-teal-500 px-3 py-1 text-[10px] font-bold text-white shadow">
                  PRESS RELEASE
                </span>
              </div>

              <div className="flex-1">
                <h3 className="text-[20px] font-extrabold leading-8 text-slate-900 group-hover:text-teal-600">
                  Class Technologies Inc. Closes $30 Million Series A Financing
                  to Meet High Demand
                </h3>
                <p className="mt-1 text-[18px] leading-8 text-slate-500">
                  Class Technologies Inc., the company that created Class,...
                </p>
              </div>
            </article>

            {/* Card 2 */}
            <article className="group flex gap-4 rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl">
                <img
                  src={news3}
                  alt="news"
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-2 left-2 rounded-full bg-teal-500 px-3 py-1 text-[10px] font-bold text-white shadow">
                  NEWS
                </span>
              </div>

              <div className="flex-1">
                <h3 className="text-[20px] font-extrabold leading-8 text-slate-900 group-hover:text-teal-600">
                  Zoom’s earliest investors are betting millions on a better
                  Zoom for schools
                </h3>
                <p className="mt-1 text-[18px] leading-5 text-slate-500 ">
                  Zoom was never created to be a consumer product. Nonetheless,
                  the...
                </p>
              </div>
            </article>

            {/* Card 3 */}
            <article className="group flex gap-4 rounded-2xl bg-white p-4 shadow-md ring-1 ring-slate-100 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl">
                <img
                  src={news4}
                  alt="news"
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-2 left-2 rounded-full bg-teal-500 px-3 py-1 text-[10px] font-bold text-white shadow">
                  NEWS
                </span>
              </div>

              <div className="flex-1">
                <h3 className="text-[20px] font-extrabold leading-8 text-slate-900 group-hover:text-teal-600">
                  Former Blackboard CEO Raises $16M to Bring LMS Features to
                  Zoom Classrooms
                </h3>
                <p className="mt-1 text-[18px] leading-5 text-slate-500">
                  This year, investors have reaped big financial returns from
                  betting on Zoom...
                </p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LatestNews;