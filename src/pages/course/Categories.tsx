import useCategories from "../../hooks/useCategories";
import { toMediaUrl } from "../../utils";

type CategoryApi = {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
};

type UiStyle = {
  iconBg: string;
  iconColor: string;
  hoverGlow: string;
  borderColor: string;
};

const STYLES: UiStyle[] = [
  { 
    iconBg: "bg-gradient-to-br from-teal-50 to-teal-100", 
    iconColor: "text-teal-600",
    hoverGlow: "hover:shadow-[0_20px_60px_-12px_rgba(6,148,162,0.3)]",
    borderColor: "border-teal-100"
  },
  { 
    iconBg: "bg-gradient-to-br from-indigo-50 to-indigo-100", 
    iconColor: "text-indigo-600",
    hoverGlow: "hover:shadow-[0_20px_60px_-12px_rgba(76,81,191,0.3)]",
    borderColor: "border-indigo-100"
  },
  { 
    iconBg: "bg-gradient-to-br from-sky-50 to-sky-100", 
    iconColor: "text-sky-600",
    hoverGlow: "hover:shadow-[0_20px_60px_-12px_rgba(6,182,212,0.3)]",
    borderColor: "border-sky-100"
  },
  { 
    iconBg: "bg-gradient-to-br from-emerald-50 to-emerald-100", 
    iconColor: "text-emerald-600",
    hoverGlow: "hover:shadow-[0_20px_60px_-12px_rgba(16,185,129,0.3)]",
    borderColor: "border-emerald-100"
  },
  { 
    iconBg: "bg-gradient-to-br from-amber-50 to-amber-100", 
    iconColor: "text-amber-600",
    hoverGlow: "hover:shadow-[0_20px_60px_-12px_rgba(251,191,36,0.3)]",
    borderColor: "border-amber-100"
  },
  { 
    iconBg: "bg-gradient-to-br from-rose-50 to-rose-100", 
    iconColor: "text-rose-600",
    hoverGlow: "hover:shadow-[0_20px_60px_-12px_rgba(244,63,94,0.3)]",
    borderColor: "border-rose-100"
  },
  { 
    iconBg: "bg-gradient-to-br from-violet-50 to-violet-100", 
    iconColor: "text-violet-600",
    hoverGlow: "hover:shadow-[0_20px_60px_-12px_rgba(139,92,246,0.3)]",
    borderColor: "border-violet-100"
  },
  { 
    iconBg: "bg-gradient-to-br from-lime-50 to-lime-100", 
    iconColor: "text-lime-600",
    hoverGlow: "hover:shadow-[0_20px_60px_-12px_rgba(132,204,22,0.3)]",
    borderColor: "border-lime-100"
  },
];

function styleFor(id: string): UiStyle {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return STYLES[sum % STYLES.length] ?? STYLES[0];
}

function Categories() {
  const { categories, loading, isError, error } = useCategories();

  return (
    <section className="py-16">
      {/* Header with gradient text */}
      <div className="mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
            Choice favourite course from
          </span>
          <span className="ml-3 bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
            top category
          </span>
        </h2>
        <p className="text-slate-600 max-w-2xl">
          Explore our carefully curated categories and find the perfect course to advance your career
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-7">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_18px_45px_rgba(2,8,23,0.08)] animate-pulse"
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 mb-6"></div>
              <div className="h-6 bg-gradient-to-r from-slate-100 to-slate-200 rounded mb-4 w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded w-full"></div>
                <div className="h-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded w-5/6"></div>
                <div className="h-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded w-4/6"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="max-w-md mx-auto bg-gradient-to-br from-white to-slate-50 rounded-2xl p-8 border border-slate-200 shadow-lg text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Loading Failed</h3>
          <p className="text-slate-600 mb-6">
            {(error as any)?.message || "Unable to load categories. Please try again."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-slate-300 transition-all duration-300"
          >
            Retry Loading
          </button>
        </div>
      )}

      {!loading && !isError && categories && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-7">
          {(categories as CategoryApi[]).map((c, index) => {
            const style = styleFor(c.id);
            
            return (
              <div
                key={c.id}
                className="group relative bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_18px_45px_rgba(2,8,23,0.08)] hover:shadow-[0_22px_55px_rgba(2,8,23,0.12)] transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                {/* Animated background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-transparent ${style.hoverGlow.replace('hover:', 'group-hover:')} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br from-white to-transparent" />
                </div>

                {/* Icon container with subtle shine effect */}
                <div className="relative mb-6">
                  <div className={`w-14 h-14 rounded-xl ${style.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                    {c.icon ? (
                      <img
                        src={toMediaUrl(c.icon)}
                        alt={c.name}
                        className="w-6 h-6 object-contain filter group-hover:drop-shadow-md transition-all duration-300"
                      />
                    ) : (
                      <div className={`w-6 h-6 rounded ${style.iconColor} bg-opacity-20 flex items-center justify-center`}>
                        <span className={`text-xs font-bold ${style.iconColor}`}>
                          {c.name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Icon shine effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Category title with gradient underline on hover */}
                <h3 className="relative text-lg font-extrabold text-slate-900 mb-4 group-hover:text-slate-800 transition-colors duration-300">
                  {c.name}
                  <span className={`absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r ${style.iconColor.replace('text-', 'from-')} ${style.iconColor.replace('text-', 'to-')} group-hover:w-12 transition-all duration-500`}></span>
                </h3>

                {/* Description with subtle hover effect */}
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 min-h-[60px] group-hover:text-slate-700 transition-colors duration-300 relative z-10">
                  {c.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod adipiscing elit, sed do eiusmod"}
                </p>

                {/* Subtle glow border on hover */}
                <div className={`absolute inset-0 rounded-2xl border-2 border-transparent group-hover:${style.borderColor} transition-all duration-500 pointer-events-none`} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Categories;
