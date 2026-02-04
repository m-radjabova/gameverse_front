import React from "react";
import { FaArrowRight, FaGlobe, FaUser } from "react-icons/fa";

type CourseItem = { label: string; color: string };

const courseItems: CourseItem[] = [
  { label: "Ut Sed Eros", color: "bg-orange-500" },
  { label: "Curabitur Egestas", color: "bg-rose-400" },
  { label: "Quisque Conseq...", color: "bg-amber-800" },
  { label: "Cras Convallis", color: "bg-yellow-400" },
  { label: "Vestibulum Fauci...", color: "bg-purple-400" },
  { label: "Ut Sed Eros", color: "bg-sky-500" },
  { label: "Vestibulum Faucibu", color: "bg-emerald-500" },
];

const SectionHeader = ({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
}) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-2">
      <Icon className="text-slate-600 transition-transform duration-300 group-hover:scale-125" size={18} />
      <h3 className="text-[#2F327D] font-semibold text-[15px]">
        {title}
      </h3>
    </div>

    <button className="flex items-center gap-2 text-cyan-500 text-[13px] font-semibold hover:opacity-80 hover:text-cyan-600 hover-lift transition-all duration-300">
      SEE ALL <FaArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  </div>
);

const PillCard = ({ item }: { item: CourseItem }) => {
  return (
    <div className="relative shrink-0 rotate-[-12deg] hover-scale cursor-pointer group">
      {/* outer soft bg */}
      <div className="h-[180px] w-[90px] rounded-[32px] bg-gradient-to-b from-green-50 to-emerald-50 flex items-center justify-center shadow-sm group-hover:shadow-lg transition-all duration-300">
        <div
          className={`h-[160px] w-[70px] rounded-[28px] border-[5px] border-white shadow-lg ${item.color} flex items-center justify-center group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}
        >
          <span className="text-white text-[11px] font-bold whitespace-nowrap -rotate-90 tracking-wide group-hover:scale-110 transition-transform duration-300">
            {item.label}
          </span>
        </div>
      </div>

      {/* shelf shadow */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[50px] h-[8px] bg-slate-300/50 rounded-full blur-sm group-hover:shadow-lg transition-all duration-300" />
    </div>
  );
};

const FeaturedCard = ({
  borderColor,
  imageSrc,
}: {
  borderColor: string;
  imageSrc?: string;
}) => {
  return (
    <div
      className={[
        "flex items-center gap-4 bg-white rounded-2xl p-5",
        "shadow-[0_18px_40px_rgba(15,23,42,0.08)] border-2",
        borderColor,
        "w-[360px] shrink-0 hover-lift hover:shadow-2xl transition-all duration-300 cursor-pointer group",
      ].join(" ")}
    >
      <div className="h-[100px] w-[130px] rounded-xl overflow-hidden bg-slate-100 shrink-0 relative group-hover:scale-105 transition-transform duration-300">
        {imageSrc ? (
          <img src={imageSrc} alt="Course" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-orange-400 font-bold text-xl mb-1">LOREM</div>
              <div className="text-orange-400 font-bold text-xl">IPSUM</div>
              <div className="text-slate-400 text-xs mt-2">Lorem ipsum dolor sit amet</div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1">
        <h4 className="font-bold text-[#2F327D] text-[15px] leading-snug mb-2 group-hover:text-cyan-600 transition-colors duration-300">
          Integer id Orc Sed
          <br />
          Ante Tincidunt
        </h4>

        <p className="text-[#696984] text-[12px] leading-[17px] mb-3 group-hover:text-[#2F327D] transition-colors duration-300">
          Cras convallis lacus orci, tristique tincidunt magna fringilla at faucibus vel.
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="text-yellow-400 text-[13px]">★★★★★</div>
          <span className="font-bold text-[#2F327D] text-[14px]">$ 450</span>
        </div>

        <button className="w-full py-2 border-2 border-cyan-400 text-cyan-500 rounded-lg text-[12px] font-bold hover:bg-cyan-50 hover:border-cyan-500 hover:text-cyan-600 hover:shadow-md transition-all duration-300 hover-lift">
          EXPLORE
        </button>
      </div>
    </div>
  );
};

const Shelf = ({ widthClass }: { widthClass: string }) => (
  <div className={`absolute left-0 top-[92px] h-[50px] ${widthClass} rounded-2xl bg-slate-200/40`} />
);

const CourseRow = ({
  title,
  layout,
  borderColor,
}: {
  title: string;
  layout: "end" | "middle" | "start";
  borderColor: string;
}) => {
  return (
    <div className="mb-10">
      <SectionHeader icon={FaGlobe} title={title} />

      <div className="relative">
        {/* shelf bg */}
        {layout === "end" && <Shelf widthClass="w-[75%]" />}
        {layout === "middle" && <Shelf widthClass="w-[70%]" />}
        {layout === "start" && <Shelf widthClass="w-[80%]" />}

        <div className="relative flex items-center gap-4 overflow-x-auto pb-8 no-scrollbar">
          {/* START */}
          {layout === "start" && (
            <div className="-translate-y-1">
              <FeaturedCard borderColor={borderColor} />
            </div>
          )}

          {/* MIDDLE */}
          {layout === "middle" && (
            <>
              {courseItems.slice(0, 4).map((it, idx) => (
                <PillCard key={idx} item={it} />
              ))}

              <div className="-translate-y-1">
                <FeaturedCard borderColor={borderColor} />
              </div>

              {courseItems.slice(4, 7).map((it, idx) => (
                <PillCard key={`m-${idx}`} item={it} />
              ))}
            </>
          )}

          {/* END */}
          {layout === "end" && (
            <>
              {courseItems.map((it, idx) => (
                <PillCard key={idx} item={it} />
              ))}
              <div className="-translate-y-1">
                <FeaturedCard borderColor={borderColor} />
              </div>
            </>
          )}

          {/* START remaining pills */}
          {layout === "start" &&
            courseItems.map((it, idx) => <PillCard key={idx} item={it} />)}
        </div>
      </div>
    </div>
  );
};

const Courses: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-[#EFF5FB] to-white py-12 animate-fade-in-up">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden">
          {/* content */}
          <div className="relative">
            {/* Title */}
            <div className="mb-10">
              <h2 className="text-[#2F327D] text-[32px] font-bold mb-2">
                Explore Course
              </h2>
              <p className="text-[#696984] text-[14px]">
                Ut sed eros finibus, placerat orci id, dapibus.
              </p>
            </div>

            <CourseRow title="Lorem Ipsum" layout="end" borderColor="border-cyan-200" />
            <CourseRow title="Quisque a Consequat" layout="middle" borderColor="border-rose-200" />

            {/* third section */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <FaUser className="text-slate-600 transition-transform duration-300 hover:scale-125" size={16} />
                  <h3 className="text-[#2F327D] font-semibold text-[15px]">
                    Aenean Facilisis
                  </h3>
                </div>
                <button className="flex items-center gap-2 text-cyan-500 text-[13px] font-semibold hover:opacity-80 hover:text-cyan-600 hover-lift transition-all duration-300">
                  SEE ALL <FaArrowRight size={14} className="transition-transform duration-300 hover:translate-x-1" />
                </button>
              </div>

              <div className="relative">
                <div className="absolute left-[20%] top-[92px] h-[50px] w-[75%] rounded-2xl bg-slate-200/40" />

                <div className="relative flex items-center gap-4 overflow-x-auto pb-8 no-scrollbar">
                  <div className="-translate-y-1">
                    <FeaturedCard borderColor="border-cyan-200" />
                  </div>

                  {courseItems.map((it, idx) => (
                    <PillCard key={idx} item={it} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Courses;