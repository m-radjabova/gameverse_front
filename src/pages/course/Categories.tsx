import useCategories from "../../hooks/useCategories";
import { toMediaUrl } from "../../utils";

import {
  FiCode,
  FiTrendingUp,
  FiCamera,
  FiMusic,
  FiHeart,
  FiBook,
  FiChevronRight,
  FiLoader
} from "react-icons/fi";
import {
  MdOutlineDesignServices,
  MdOutlineScience,
  MdOutlineBusinessCenter
} from "react-icons/md";
import { HiOutlineSparkles } from "react-icons/hi2";

type UiStyle = {
  iconBg: string;
  iconColor: string;
  cardBg: string;
  borderColor: string;
  gradient: string;
  statsColor: string;
};

const STYLES: UiStyle[] = [
  { 
    iconBg: "bg-gradient-to-br from-teal-500/10 to-emerald-500/20", 
    iconColor: "text-teal-600",
    cardBg: "from-teal-50/30 via-white to-emerald-50/20",
    borderColor: "border-teal-100",
    gradient: "from-teal-500 to-emerald-500",
    statsColor: "text-teal-600"
  },
  { 
    iconBg: "bg-gradient-to-br from-indigo-500/10 to-purple-500/20", 
    iconColor: "text-indigo-600",
    cardBg: "from-indigo-50/30 via-white to-purple-50/20",
    borderColor: "border-indigo-100",
    gradient: "from-indigo-500 to-purple-500",
    statsColor: "text-indigo-600"
  },
  { 
    iconBg: "bg-gradient-to-br from-sky-500/10 to-cyan-500/20", 
    iconColor: "text-sky-600",
    cardBg: "from-sky-50/30 via-white to-cyan-50/20",
    borderColor: "border-sky-100",
    gradient: "from-sky-500 to-cyan-500",
    statsColor: "text-sky-600"
  },
  { 
    iconBg: "bg-gradient-to-br from-emerald-500/10 to-green-500/20", 
    iconColor: "text-emerald-600",
    cardBg: "from-emerald-50/30 via-white to-green-50/20",
    borderColor: "border-emerald-100",
    gradient: "from-emerald-500 to-green-500",
    statsColor: "text-emerald-600"
  },
  { 
    iconBg: "bg-gradient-to-br from-amber-500/10 to-orange-500/20", 
    iconColor: "text-amber-600",
    cardBg: "from-amber-50/30 via-white to-orange-50/20",
    borderColor: "border-amber-100",
    gradient: "from-amber-500 to-orange-500",
    statsColor: "text-amber-600"
  },
  { 
    iconBg: "bg-gradient-to-br from-rose-500/10 to-pink-500/20", 
    iconColor: "text-rose-600",
    cardBg: "from-rose-50/30 via-white to-pink-50/20",
    borderColor: "border-rose-100",
    gradient: "from-rose-500 to-pink-500",
    statsColor: "text-rose-600"
  },
  { 
    iconBg: "bg-gradient-to-br from-violet-500/10 to-purple-500/20", 
    iconColor: "text-violet-600",
    cardBg: "from-violet-50/30 via-white to-purple-50/20",
    borderColor: "border-violet-100",
    gradient: "from-violet-500 to-purple-500",
    statsColor: "text-violet-600"
  },
  { 
    iconBg: "bg-gradient-to-br from-lime-500/10 to-green-500/20", 
    iconColor: "text-lime-600",
    cardBg: "from-lime-50/30 via-white to-green-50/20",
    borderColor: "border-lime-100",
    gradient: "from-lime-500 to-green-500",
    statsColor: "text-lime-600"
  },
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'programming': <FiCode className="w-6 h-6" />,
  'business': <FiTrendingUp className="w-6 h-6" />,
  'design': <MdOutlineDesignServices className="w-6 h-6" />,
  'photography': <FiCamera className="w-6 h-6" />,
  'music': <FiMusic className="w-6 h-6" />,
  'health': <FiHeart className="w-6 h-6" />,
  'science': <MdOutlineScience className="w-6 h-6" />,
  'marketing': <MdOutlineBusinessCenter className="w-6 h-6" />,
  'default': <FiBook className="w-6 h-6" />
};

function getCategoryIcon(name: string): React.ReactNode {
  const lowerName = name.toLowerCase();
  for (const key in CATEGORY_ICONS) {
    if (lowerName.includes(key)) {
      return CATEGORY_ICONS[key];
    }
  }
  return CATEGORY_ICONS.default;
}

function styleFor(id: string): UiStyle {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return STYLES[sum % STYLES.length] ?? STYLES[0];
}

function Categories() {
  const { categories, loading, isError } = useCategories();

  return (
    <section className="py-10 bg-gradient-to-b from-slate-50 via-white to-emerald-50/30">
      <div className="mx-auto max-w-[1700px] px-4">
        {/* Header with stats */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 mb-6">
            <HiOutlineSparkles className="w-4 h-4 text-teal-600" />
            <span className="text-sm font-semibold text-teal-700">Explore Categories</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              Discover Your
            </span>
            <span className="ml-3 bg-gradient-to-r from-teal-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
              Perfect Course
            </span>
          </h1>
          
          <p className="text-lg text-slate-600 max-w-2xl mb-8">
            Browse through our expertly curated categories and find the ideal learning path
            to advance your career and skills
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 h-full">
                  <div className="w-16 h-16 rounded-xl bg-slate-200 mb-4"></div>
                  <div className="h-6 bg-slate-200 rounded mb-3 w-3/4"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-slate-100 rounded w-full"></div>
                    <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                    <div className="h-3 bg-slate-100 rounded w-4/6"></div>
                  </div>
                  <div className="h-8 bg-slate-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="max-w-lg mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                <FiLoader className="w-6 h-6 text-white animate-spin" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Unable to Load Categories</h3>
            <p className="text-slate-600 mb-6">
              "There was an issue loading the categories. Please try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-semibold rounded-xl hover:shadow-xl transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Categories Grid */}
        {!loading && !isError && categories.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((c) => {
                const style = styleFor(c.id);
                const iconElement = c.icon ? (
                  <img
                    src={toMediaUrl(c.icon)}
                    alt={c.name}
                    className="w-6 h-6 object-contain"
                  />
                ) : getCategoryIcon(c.name);

                return (
                  <div
                    key={c.id}
                    className="group relative bg-gradient-to-br from-white to-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-teal-200 transition-all duration-500 hover:-translate-y-2"
                  >
                    {/* Category icon */}
                    <div className={`w-16 h-16 rounded-xl ${style.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <div className={style.iconColor}>
                        {iconElement}
                      </div>
                    </div>

                    {/* Category info */}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors">
                        {c.name}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-2 min-h-[40px]">
                        {c.description || "Explore comprehensive courses and master new skills"}
                      </p>
                    </div>

                    {/* Stats and action */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <FiTrendingUp className="w-3 h-3" />
                          Trending
                        </span>
                      </div>
                      <button className={`flex items-center justify-center w-8 h-8 rounded-full ${style.iconBg} ${style.iconColor} hover:scale-110 transition-transform`}>
                        <FiChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Hover effect gradient */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${style.cardBg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && !isError && (!categories || categories.length === 0) && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center">
              <FiBook className="w-12 h-12 text-teal-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No Categories Available</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Categories will be available soon. Check back later to explore our learning paths.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default Categories;