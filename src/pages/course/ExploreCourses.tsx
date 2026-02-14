import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiArrowLeft, 
  FiSearch, 
  FiStar, 
  FiUsers,
  FiTrendingUp,
  FiAward,
  FiFilter
} from "react-icons/fi";
import { 
  MdDiscount, 
  MdMenuBook, 
  MdPlayCircleOutline,
  MdAccessTime,
  MdAttachMoney,
  MdOutlineSignalCellularAlt,
  MdSchool,
  MdLanguage,
  MdOutlineVideoLibrary
} from "react-icons/md";
import { IoMdTime } from "react-icons/io";
import { TbCertificate, TbDeviceLaptop } from "react-icons/tb";
import { HiOutlineLightBulb } from "react-icons/hi";
import { BsBarChartLine } from "react-icons/bs";
import useCourses from "../../hooks/useCourses";
import useCategories from "../../hooks/useCategories";
import { useDebounce } from "../../hooks/useDebounce";
import { formatDuration, toMediaUrl } from "../../utils";
import type { Category } from "../../types/types";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop";

const categoryIcons: Record<string, JSX.Element> = {
  "programming": <TbDeviceLaptop className="w-4 h-4" />,
  "design": <HiOutlineLightBulb className="w-4 h-4" />,
  "business": <BsBarChartLine className="w-4 h-4" />,
  "marketing": <FiTrendingUp className="w-4 h-4" />,
  "language": <MdLanguage className="w-4 h-4" />,
  "science": <TbCertificate className="w-4 h-4" />,
  "default": <MdSchool className="w-4 h-4" />
};

function ExploreCourses() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const debouncedQuery = useDebounce(query, 400);

  const activeCategoryId =
    selectedCategoryId !== "all" ? selectedCategoryId : undefined;
  const activeLevel = selectedLevel !== "all" ? selectedLevel : undefined;
  const {
    courses,
    loading: coursesLoading,
    isError: coursesError,
  } = useCourses({
    categoryId: activeCategoryId,
    level: activeLevel,
    search: debouncedQuery,
  });
  const {
    categories,
    loading: categoriesLoading,
    isError: categoriesError,
  } = useCategories();

  const [categoryMap, setCategoryMap] = useState<Map<string, string>>(
      new Map(),
    );
    
    useEffect(() => {
      if (!categories?.length) return;
      const map = new Map<string, string>();
      categories.forEach((cat: Category) => map.set(String(cat.id), cat.name));
      setCategoryMap(map);
    }, [categories]);

  const getCategoryName = (categoryId: string | number | undefined) => {
    if (categoryId === undefined || categoryId === null) return "General";
    return categoryMap.get(String(categoryId)) || "General";
  };

  const getCategoryIcon = (categoryName: string) => {
    const key = categoryName.toLowerCase();
    return categoryIcons[key] || categoryIcons.default;
  };

  const filteredCourses = courses;

  const isLoading = coursesLoading || categoriesLoading;
  const hasError = coursesError || categoriesError;

  return (
    <section className="mx-auto max-w-[1700px] space-y-8 px-4 py-8 md:px-6">
      {/* Header Section - Chiroyli gradient fon */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-cyan-900 to-emerald-900 p-8 md:p-12">
        {/* Background decorative elements */}
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-gradient-to-br from-cyan-400/30 to-emerald-400/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-400/30 to-teal-400/30 blur-3xl" />
        
        <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-white border border-white/20">
                <FiAward className="text-amber-400" />
                Premium Courses
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-white border border-white/20">
                <FiUsers className="text-cyan-400" />
                10K+ Students
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              Explore <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">Courses</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-300">
              Discover thousands of courses taught by expert instructors. 
              Learn at your own pace and earn certificates.
            </p>
            
            {/* Stats */}
            <div className="mt-6 flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                  <MdOutlineVideoLibrary className="text-cyan-400" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{courses.length}+</p>
                  <p className="text-xs text-slate-400">Online Courses</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                  <TbCertificate className="text-emerald-400" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">15+</p>
                  <p className="text-xs text-slate-400">Certificates</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                  <FiUsers className="text-amber-400" size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">50+</p>
                  <p className="text-xs text-slate-400">Expert Tutors</p>
                </div>
              </div>
            </div>
          </div>
          
          <button
            type="button"
            onClick={() => navigate("/courses")}
            className="group inline-flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm px-5 py-3 text-sm font-semibold text-white border border-white/20 hover:bg-white/20 transition-all"
          >
            <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Search and Filters Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for courses, skills, or topics..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-base text-slate-800 placeholder-slate-400 focus:border-cyan-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-cyan-100 transition-all"
            />
          </div>
          
          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 transition-all lg:hidden"
          >
            <FiFilter size={18} />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>

        {/* Filters */}
        <div className={`mt-5 space-y-5 ${!showFilters && 'hidden lg:block'}`}>
          {/* Categories */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MdMenuBook className="text-cyan-600" />
              Categories
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategoryId("all")}
                className={`group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                  selectedCategoryId === "all"
                    ? "bg-gradient-to-r from-cyan-600 to-emerald-600 text-white shadow-lg shadow-cyan-200"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                }`}
              >
                <MdSchool className={selectedCategoryId === "all" ? "text-white" : "text-slate-400 group-hover:text-cyan-600"} size={16} />
                All Categories
              </button>
              {categories.map((category) => {
                const id = String(category.id);
                const icon = getCategoryIcon(category.name);
                
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedCategoryId(id)}
                    className={`group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                      selectedCategoryId === id
                        ? "bg-gradient-to-r from-cyan-600 to-emerald-600 text-white shadow-lg shadow-cyan-200"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
                    }`}
                  >
                    <span className={selectedCategoryId === id ? "text-white" : "text-slate-400 group-hover:text-cyan-600"}>
                      {icon}
                    </span>
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level Filter */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MdOutlineSignalCellularAlt className="text-emerald-600" />
              Difficulty Level
            </h3>
            <div className="flex flex-wrap gap-2">
              {["all", "beginner", "intermediate", "advanced"].map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold capitalize transition-all ${
                    selectedLevel === level
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-200"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-slate-200 border-t-cyan-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <MdSchool className="h-8 w-8 text-cyan-600" />
            </div>
          </div>
        </div>
      )}

      {hasError && (
        <div className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-600 mb-4">
            <FiTrendingUp size={24} />
          </div>
          <h3 className="text-lg font-semibold text-rose-800">Failed to load courses</h3>
          <p className="text-sm text-rose-600 mt-1">Please try again later</p>
        </div>
      )}

      {!isLoading && !hasError && (
        <>
          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Found <span className="font-bold text-slate-900">{filteredCourses.length}</span> courses
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <MdAccessTime size={16} />
              Last updated: Today
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 text-slate-400 mb-4">
                <FiSearch size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">No courses found</h3>
              <p className="text-slate-500 mt-2">Try adjusting your search or filter criteria</p>
              <button
                onClick={() => {
                  setQuery("");
                  setSelectedCategoryId("all");
                  setSelectedLevel("all");
                }}
                className="mt-4 rounded-full bg-gradient-to-r from-cyan-600 to-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:shadow-lg hover:shadow-cyan-200 transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredCourses.map((course) => {
                const oldPrice = Math.round(course.price * 1.3);
                const discount = Math.round(((oldPrice - course.price) / oldPrice) * 100);
                const categoryName = getCategoryName(course.category_id);
                
                return (
                  <article
                    key={course.id}
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200
                      shadow-[0_4px_20px_rgba(0,0,0,0.05)]
                      hover:shadow-[0_20px_40px_rgba(2,132,199,0.12)]
                      hover:border-cyan-200 hover:-translate-y-2
                      transition-all duration-500 cursor-pointer
                      h-full flex flex-col"
                  >
                    {/* Image Container */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={course.image ? toMediaUrl(course.image) : FALLBACK_IMAGE}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />

                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm text-slate-800 text-xs font-semibold rounded-full border border-slate-200">
                          {getCategoryIcon(categoryName)}
                          {categoryName}
                        </span>
                      </div>

                      {/* Discount Badge */}
                      {discount > 0 && (
                        <div className="absolute top-4 right-4">
                          <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-lg">
                            <MdDiscount className="w-3 h-3" />
                            {discount}% OFF
                          </div>
                        </div>
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/90 to-transparent" />
                    </div>

                    {/* Content Container */}
                    <div className="p-5 flex-1 flex flex-col">
                      {/* Course Stats */}
                      <div className="flex items-center justify-between text-sm mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-slate-500">
                            <IoMdTime className="w-4 h-4" />
                            <span>{formatDuration(course.duration)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-500">
                            <MdPlayCircleOutline className="w-4 h-4" />
                            <span>12 lessons</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-amber-600 font-semibold">
                          <FiStar className="w-4 h-4 fill-amber-400" />
                          <span>{course.rating || "4.5"}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-slate-900 text-lg mb-3 group-hover:text-cyan-700 transition-colors duration-300 line-clamp-2 min-h-[56px]">
                        {course.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2 flex-1">
                        {course.description || "Master essential skills with hands-on projects and expert guidance in this comprehensive course."}
                      </p>

                      {/* Level Badge */}
                      <div className="mb-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full
                          ${course.level === 'beginner' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                            course.level === 'intermediate' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                            'bg-rose-50 text-rose-700 border border-rose-200'}`}
                        >
                          <MdOutlineSignalCellularAlt size={12} />
                          {course.level || "Beginner"}
                        </span>
                      </div>

                      {/* Price and Button */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-slate-900">
                              ${course.price}
                            </span>
                            <span className="text-sm text-slate-400 line-through">
                              ${oldPrice}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                            <MdAttachMoney size={10} />
                            Save ${oldPrice - course.price}
                          </p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/courses/${course.id}/enroll`);
                          }}
                          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-200 hover:-translate-y-0.5 transition-all"
                        >
                          Enroll Now
                        </button>
                      </div>

                      {/* Popular Badge */}
                      {course.rating && Number(course.rating) >= 4.5 && (
                        <div className="absolute bottom-20 left-5">
                          <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                            <FiTrendingUp size={10} />
                            Popular
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default ExploreCourses;
