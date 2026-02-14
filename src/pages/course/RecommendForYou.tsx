import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useCourses from "../../hooks/useCourses";
import useCategories from "../../hooks/useCategories";
import { formatDuration, toMediaUrl } from "../../utils";
import type { Category } from "../../types/types";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import {
  FiClock,
  FiStar,
  FiArrowRight,
  FiArrowLeft,
  FiChevronRight,
} from "react-icons/fi";
import { RiFlashlightFill } from "react-icons/ri";
import { HiOutlineFire } from "react-icons/hi";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { MdDiscount } from "react-icons/md";

function RecommendForYou() {
  const {
    courses,
    loading: coursesLoading,
    isError: coursesError,
  } = useCourses();
  const { categories, loading: categoriesLoading } = useCategories();
  const [categoryMap, setCategoryMap] = useState<Map<string, string>>(
    new Map(),
  );
  const navigate = useNavigate();

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

  const resolveImage = (image?: string | null) => {
    if (!image) {
      return "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop";
    }
    return toMediaUrl(image);
  };

  if (coursesLoading || categoriesLoading) {
    return (
      <div className="rounded-3xl p-6 md:p-10 mt-10 bg-gradient-to-br from-slate-50 via-white to-teal-50/30 shadow-xl border border-slate-100">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-8">
            <div>
              <div className="h-9 bg-slate-200 rounded-lg w-64 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-40" />
            </div>
            <div className="h-11 bg-slate-200 rounded-xl w-36" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm p-5 border border-slate-200 h-[420px]"
              >
                <div className="h-[180px] bg-slate-200 rounded-xl mb-4" />
                <div className="h-4 bg-slate-200 rounded w-20 mb-3" />
                <div className="h-6 bg-slate-200 rounded mb-3" />
                <div className="h-14 bg-slate-100 rounded mb-4" />
                <div className="h-10 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (coursesError) {
    return (
      <div className="rounded-3xl p-6 md:p-10 mt-10 bg-gradient-to-br from-rose-50 via-white to-pink-50/30 shadow-xl border border-rose-100 text-center">
        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-rose-100 to-pink-100 flex items-center justify-center mb-4">
            <HiOutlineFire className="w-8 h-8 text-rose-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Couldn't load courses
          </h3>
          <p className="text-slate-600 mb-4">Please check your connection</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-[1700px] mx-auto px-4 rounded-3xl p-6 md:p-10 mt-10 bg-gradient-to-br from-slate-50 via-white to-teal-50/30 shadow-xl border border-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500">
              <RiFlashlightFill className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              Recommended For You
            </h2>
          </div>
          <p className="text-slate-600 mt-2 max-w-2xl">
            Based on your interests and learning history
          </p>
        </div>

        <button
          onClick={() => navigate("/courses")}
          className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-slate-300/50 transition-all duration-300 hover:scale-[1.02] flex items-center gap-2 group"
        >
          Explore All
          <FiChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Swiper Container */}
      <div className="relative px-2">
        {/* Custom Navigation Buttons */}
        <button className="swiper-prev absolute left-[-16px] top-1/2 z-10 -translate-y-1/2 hidden lg:block">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xl border border-slate-200 hover:border-teal-300 transition-all hover:scale-110 group">
            <FiArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-teal-600" />
          </div>
        </button>

        <button className="swiper-next absolute right-[-16px] top-1/2 z-10 -translate-y-1/2 hidden lg:block">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 shadow-xl transition-all hover:scale-110 group">
            <FiArrowRight className="w-5 h-5 text-white" />
          </div>
        </button>

        {/* Swiper */}
        <Swiper
          className="courses-swiper"
          modules={[Navigation, Pagination, Autoplay]}
          navigation={{ prevEl: ".swiper-prev", nextEl: ".swiper-next" }}
          pagination={{
            clickable: true,
            bulletClass: "swiper-pagination-bullet bg-slate-300 opacity-50",
            bulletActiveClass:
              "swiper-pagination-bullet-active !bg-teal-500 !opacity-100",
          }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop={courses.length > 4}
          spaceBetween={24}
          breakpoints={{
            0: {
              slidesPerView: 1,
              spaceBetween: 16,
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 24,
            },
            1280: {
              slidesPerView: 4,
              spaceBetween: 24,
            },
          }}
        >
          {courses.map((c) => {
            const oldPrice = Math.round(c.price * 1.3);
            const discount = Math.round(
              ((oldPrice - c.price) / oldPrice) * 100,
            );
            const categoryName = getCategoryName(c.category_id);

            return (
              <SwiperSlide key={c.id}>
                <div className="h-full">
                  <div
                    onClick={() => navigate(`/courses/${c.id}`)}
                    className="group bg-white rounded-2xl overflow-hidden border border-slate-200
                    shadow-[0_4px_20px_rgba(0,0,0,0.05)]
                    hover:shadow-[0_20px_50px_rgba(2,132,199,0.12)]
                    hover:border-teal-200 hover:translate-y-[-8px]
                    transition-all duration-500 cursor-pointer
                    h-full flex flex-col"
                  >
                    {/* Image Container */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={resolveImage(c.image)}
                        alt={c.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />

                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm text-slate-800 text-xs font-semibold rounded-full border border-slate-200">
                          {categoryName}
                        </span>
                      </div>

                      {/* Discount Badge */}
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full">
                          <MdDiscount className="w-3 h-3" />
                          {discount}% OFF
                        </div>
                      </div>

                      {/* Gradient Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/90 to-transparent" />
                    </div>

                    {/* Content Container - Fixed height for consistency */}
                    <div className="p-5 flex-1 flex flex-col">
                      {/* Course Info */}
                      <div className="flex items-center justify-between text-sm mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-slate-600">
                            <FiClock className="w-4 h-4" />
                            <span>{formatDuration(c.duration)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-amber-600 font-semibold">
                          <FiStar className="w-4 h-4 fill-amber-400" />
                          <span>{c.rating || 4.5}</span>
                        </div>
                      </div>

                      {/* Title - Fixed height */}
                      <h3 className="font-bold text-slate-900 text-lg mb-3 group-hover:text-teal-700 transition-colors duration-300 line-clamp-2 min-h-[56px]">
                        {c.title}
                      </h3>

                      {/* Description - Fixed height */}
                      <p className="text-sm text-slate-600 mb-5 line-clamp-2 flex-1 min-h-[40px]">
                        {c.description ||
                          "Master essential skills with hands-on projects and expert guidance."}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between mb-5 text-sm text-slate-500">
                        <div className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">
                          {c.level || "Beginner"}
                        </div>
                      </div>

                      {/* Price and Button */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-slate-900">
                            ${c.price}
                          </span>
                          <span className="text-sm text-slate-400 line-through">
                            ${oldPrice}
                          </span>
                        </div>
                        <button className="px-4 py-2 bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 text-sm font-semibold rounded-lg border border-teal-100 hover:bg-teal-100 transition-colors">
                          Enroll Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}

export default RecommendForYou;