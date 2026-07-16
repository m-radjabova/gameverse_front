import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { 
  useChangeMyPasswordMutation, 
  useMeQuery, 
  useUpdateMeMutation, 
  useUploadAvatarMutation 
} from "../../hooks/useProfile";
import useContextPro from "../../hooks/useContextPro";
import { toMediaUrl } from "../../utils";
import { formatUserCreatedAt } from "../../utils/userDates";

import { 
  HiOutlineUserCircle, 
  HiOutlinePhotograph,
  HiOutlineClock,
  HiOutlineSparkles
} from "react-icons/hi";

import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiCamera, 
  FiSave, 
  FiCheckCircle, 
  FiAlertCircle,
  FiUpload,
  FiEdit2,
  FiLoader,
  FiCalendar,
  FiHeart,
  FiAtSign,
  FiInfo,
  FiArrowRight
} from "react-icons/fi";
import { 
  MdOutlineBadge,
  MdOutlineVerified,
  MdOutlineEmail,
  MdOutlinePersonOutline,
  MdOutlinePhotoSizeSelectSmall
} from "react-icons/md";
import { GiPlanetCore } from "react-icons/gi";
import { BsStars } from "react-icons/bs";
import ChangePasswordModal from "./ChangePasswordModal";
import useHomeTheme from "../../hooks/useHomeTheme";
import { useNavigate } from "react-router-dom";
import profileLightBackground from "./profile_light_mode.png";
import profileDarkBackground from "./profile_dark_mode.png";

type ProfileForm = {
  username: string;
  email: string;
};

function Profile() {
  const navigate = useNavigate();
  const isDarkMode = useHomeTheme();
  const profileBackground = isDarkMode ? profileDarkBackground : profileLightBackground;
  const panelSurfaceClass = "relative overflow-hidden rounded-lg border border-[var(--panel-border)] bg-[var(--panel-surface)]/90 p-6 shadow-[0_16px_36px_rgba(55,80,130,0.12)] backdrop-blur-xl md:p-8";
  const { dispatch } = useContextPro();
  const meQuery = useMeQuery(true);
  const user = meQuery.data;

  const updateMe = useUpdateMeMutation();
  const uploadAvatar = useUploadAvatarMutation();
  const changePassword = useChangeMyPasswordMutation();

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [hasAvatarError, setHasAvatarError] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);

  // Re-initialize AOS for footer animations when profile page loads
  useEffect(() => {
    import("aos").then((AOS) => {
      AOS.init({ duration: 900 });
      setTimeout(() => AOS.refresh(), 100);
    });
  }, []);

  const { 
    register, 
    handleSubmit, 
    reset,
    formState: { errors, isDirty }
  } = useForm<ProfileForm>({
    defaultValues: {
      username: "",
      email: ""
    }
  });

  useEffect(() => {
    if (!user) return;
    
    reset({
      username: user.username ?? "",
      email: user.email ?? "",
    });

    dispatch({ type: "SET_USER", payload: user });
  }, [user, dispatch, reset]);

  const avatarSrc = useMemo(() => toMediaUrl(user?.avatar), [user?.avatar]);
  const userDisplayName = user?.username?.trim() || "Foydalanuvchi";
  const userInitial = userDisplayName.charAt(0).toUpperCase();

  useEffect(() => {
    setHasAvatarError(false);
  }, [avatarSrc]);

  const handleSave = async (data: ProfileForm) => {
    setSuccess("");
    setError("");

    try {
      await updateMe.mutateAsync({
        username: data.username.trim(),
        email: data.email.trim(),
      });

      setSuccess("Profil muvaffaqiyatli yangilandi!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Profilni yangilashda xatolik yuz berdi.");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Fayl hajmi 5MB dan kichik bo'lishi kerak");
      return;
    }

    setSuccess("");
    setError("");
    setIsUploadingAvatar(true);

    try {
      await uploadAvatar.mutateAsync(file);
      setSuccess("Rasm muvaffaqiyatli yangilandi!");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Rasmni yuklashda xatolik yuz berdi.");
    } finally {
      e.target.value = "";
      setIsUploadingAvatar(false);
    }
  };

  if (meQuery.isLoading) {
    return (
      <section
        data-home-theme={isDarkMode ? "dark" : "light"}
        className="profile-theme min-h-screen bg-[image:var(--panel-page-bg)] bg-[var(--panel-page-base)] py-12"
        style={{ backgroundImage: `url(${profileBackground})`, backgroundPosition: "center", backgroundSize: "cover", backgroundAttachment: "fixed" }}
      >
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-center h-[80vh]">
            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--panel-accent)] rounded-full blur-3xl opacity-20 animate-pulse" />
                <div className="relative w-28 h-28 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-[var(--panel-accent)] opacity-30 animate-spin" style={{ animationDuration: '8s' }} />
                  <div className="absolute inset-2 rounded-full border-2 border-dashed border-[var(--panel-accent-strong)] opacity-20 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <GiPlanetCore className="w-14 h-14 text-[var(--panel-accent)] animate-pulse" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-light text-[var(--panel-text)] mb-2">Profil yuklanmoqda</h3>
              <p className="text-[var(--panel-text-soft)]">Iltimos, biroz kuting...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (meQuery.isError || !user) {
    return (
      <section
        data-home-theme={isDarkMode ? "dark" : "light"}
        className="profile-theme min-h-screen bg-[image:var(--panel-page-bg)] bg-[var(--panel-page-base)] py-12"
        style={{ backgroundImage: `url(${profileBackground})`, backgroundPosition: "center", backgroundSize: "cover", backgroundAttachment: "fixed" }}
      >
        <div className="mx-auto max-w-6xl px-4">
          <div className="group relative rounded-3xl border border-[var(--panel-border)] bg-[var(--panel-surface)] backdrop-blur-sm p-8 shadow-xl hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[var(--panel-accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative text-center py-16">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-[var(--panel-accent)] rounded-full blur-2xl opacity-30 animate-pulse" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[var(--panel-accent)]/20 to-[var(--panel-accent-strong)]/10 flex items-center justify-center">
                  <FiAlertCircle className="w-10 h-10 text-[var(--panel-accent)]" />
                </div>
              </div>
              <h2 className="text-2xl font-light text-[var(--panel-text)] mb-3">Autentifikatsiya talab qilinadi</h2>
              <p className="text-[var(--panel-text-soft)] mb-8 max-w-md mx-auto leading-relaxed">
                Profil ma'lumotlarini ko'rish va tahrirlash uchun tizimga kiring.
              </p>
              <button 
                onClick={() => navigate('/login')}
                className="group/btn inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--panel-accent)] to-[var(--panel-accent-strong)] px-7 py-3.5 text-sm font-medium text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <HiOutlineUserCircle className="w-5 h-5" />
                <span>Kirish sahifasiga o'tish</span>
                <FiArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      data-home-theme={isDarkMode ? "dark" : "light"}
      className="profile-theme relative isolate min-h-screen bg-[var(--panel-page-base)] bg-cover bg-center bg-fixed bg-no-repeat py-8 md:py-12"
      style={{ backgroundImage: `url(${profileBackground})` }}
    >
      <div
        className={`pointer-events-none absolute inset-0 ${isDarkMode ? "bg-slate-950/20" : "bg-white/60"}`}
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto mt-16 max-w-7xl px-4 sm:px-6 md:mt-20">
        
        {/* ===== HEADER SECTION ===== */}
        <div className="mb-10 md:mb-12 animate-[fadeIn_0.6s_ease-out]">
          <div className="inline-flex flex-col">
            <div className="flex items-baseline gap-4 flex-wrap">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[var(--panel-text)] tracking-tight">
                Profil sozlamalari
              </h1>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 bg-gradient-to-r from-[var(--panel-accent)] to-[var(--panel-accent-strong)] text-white rounded-full shadow-lg shadow-[var(--panel-accent)]/20">
                <BsStars className="w-3 h-3" />
                SHAXSIY
              </span>
            </div>
            
            <div className="mt-5 relative">
              <div className="flex items-center gap-3">
                <div className="w-8 h-px bg-gradient-to-r from-[var(--panel-accent)] to-transparent shrink-0" />
                <p className="text-[var(--panel-text-soft)] text-sm sm:text-base">
                  Shaxsiy ma'lumotlaringiz va hisob sozlamalarini yangilang
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
          
          {/* ===== LEFT COLUMN ===== */}
          <div className="lg:col-span-1 space-y-6 lg:space-y-8">
            
            {/* --- Profile Card --- */}
            <div className={`${panelSurfaceClass} animate-[fadeIn_0.6s_ease-out_0.1s_both]`}>
              <div className="relative">
                <div className="mb-6 h-1 w-16 rounded-full" style={{ backgroundImage: "var(--home-accent-gradient)" }} />
                
                <div className="relative flex flex-col items-center text-center mt-2">
                  
                  {/* Avatar with animated ring */}
                  <div 
                    className="relative group/avatar mb-5"
                    onMouseEnter={() => setAvatarHover(true)}
                    onMouseLeave={() => setAvatarHover(false)}
                  >
                    <div className={`absolute -inset-2 rounded-full border border-dashed border-[var(--panel-accent)]/45 transition-transform duration-500 ${avatarHover ? 'rotate-12 scale-105' : ''}`} />
                    
                    {avatarSrc && !hasAvatarError ? (
                      <div className="relative">
                        <img
                          src={avatarSrc}
                          alt={userDisplayName}
                          className={`relative h-28 w-28 sm:h-32 sm:w-32 rounded-full border-[3px] border-white/80 object-cover shadow-xl transition-all duration-500 ${avatarHover ? 'scale-105' : 'scale-100'}`}
                          onError={() => setHasAvatarError(true)}
                        />
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent transition-opacity duration-300 ${avatarHover ? 'opacity-100' : 'opacity-0'}`} />
                      </div>
                    ) : (
                      <div className="relative flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-full border-[3px] border-white/80 bg-gradient-to-br from-[var(--panel-accent)]/20 via-[var(--panel-accent)]/10 to-[var(--panel-accent-strong)]/20 text-4xl sm:text-5xl font-semibold text-[var(--panel-text)] shadow-xl transition-all duration-500">
                        {userInitial}
                      </div>
                    )}
                    
                    {/* Camera button */}
                    <label className="absolute -bottom-1 -right-1 cursor-pointer z-10">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-[var(--panel-accent)] rounded-full blur-md transition-opacity duration-300 ${avatarHover ? 'opacity-60' : 'opacity-0'}`} />
                        <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-[var(--panel-accent)] to-[var(--panel-accent-strong)] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                          {isUploadingAvatar ? (
                            <FiLoader className="w-4 h-4 animate-spin" />
                          ) : (
                            <FiCamera className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploadAvatar.isPending || isUploadingAvatar}
                      />
                    </label>
                  </div>

                  {/* User Info */}
                  <div className="mb-5">
                    <h1 className="text-2xl sm:text-3xl font-medium text-[var(--panel-text)] mb-1.5">
                      {userDisplayName}
                    </h1>
                    <div className="flex items-center justify-center gap-1.5 text-sm text-[var(--panel-text-soft)]">
                      <FiMail className="text-[var(--panel-accent)] text-xs shrink-0" />
                      <span className="truncate max-w-[200px]">{user.email}</span>
                    </div>
                  </div>

                  {/* Role Badges */}
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--panel-accent)]/10 px-4 py-1.5 text-xs font-medium text-[var(--panel-accent)] border border-[var(--panel-border)]">
                      <MdOutlineBadge className="w-3.5 h-3.5" />
                      {(user.roles && user.roles.length ? user.roles.join(", ") : "foydalanuvchi")}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20">
                      <MdOutlineVerified className="w-3.5 h-3.5" />
                      Tasdiqlangan
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="w-full space-y-3">
                    <button
                      type="button"
                      onClick={() => setPasswordOpen(true)}
                      className="group/btn flex items-center justify-center gap-2.5 w-full rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface)]/50 backdrop-blur-sm px-4 py-3.5 text-sm font-medium text-[var(--panel-text)] transition-all duration-300 hover:bg-gradient-to-r hover:from-[var(--panel-accent)] hover:to-[var(--panel-accent-strong)] hover:text-white hover:border-transparent hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <FiLock className="w-4 h-4 group-hover/btn:text-white transition-colors" />
                      <span>Parolni o'zgartirish</span>
                      <FiArrowRight className="w-3.5 h-3.5 ml-auto opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* --- Account Stats Card --- */}
            <div className={`${panelSurfaceClass} animate-[fadeIn_0.6s_ease-out_0.2s_both]`}>
              <div className="relative">
                <h3 className="text-sm font-semibold text-[var(--panel-text)] mb-5 flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[var(--panel-accent)]/10">
                    <HiOutlineClock className="w-4 h-4 text-[var(--panel-accent)]" />
                  </div>
                  Hisob haqida
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--panel-accent)]/5 border border-[var(--panel-border)]/50 hover:bg-[var(--panel-accent)]/10 transition-colors duration-300">
                    <span className="text-xs text-[var(--panel-text-soft)]">Ro'yxatdan o'tgan</span>
                    <span className="text-xs font-medium text-[var(--panel-text)] flex items-center gap-1.5">
                      <FiCalendar className="w-3 h-3 text-[var(--panel-accent)]" />
                      {formatUserCreatedAt(user)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--panel-accent)]/5 border border-[var(--panel-border)]/50 hover:bg-[var(--panel-accent)]/10 transition-colors duration-300">
                    <span className="text-xs text-[var(--panel-text-soft)]">Holat</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20">
                      <FiCheckCircle className="w-3 h-3" />
                      Faol
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--panel-accent)]/5 border border-[var(--panel-border)]/50 hover:bg-[var(--panel-accent)]/10 transition-colors duration-300">
                    <span className="text-xs text-[var(--panel-text-soft)]">Hisob turi</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--panel-accent)]/10 px-3 py-1 text-[10px] font-semibold text-[var(--panel-accent)] border border-[var(--panel-border)]">
                      <HiOutlineSparkles className="w-3 h-3" />
                      Premium
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            
            {/* --- Edit Profile Form --- */}
            <div className={`${panelSurfaceClass} animate-[fadeIn_0.6s_ease-out_0.15s_both]`}>
              <div className="relative">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-light text-[var(--panel-text)]">Profilni tahrirlash</h2>
                    <p className="text-[var(--panel-text-soft)] text-sm mt-1.5 max-w-md">
                      Shaxsiy ma'lumotlaringiz va email manzilingizni yangilang
                    </p>
                  </div>
                  <div className="hidden sm:flex w-12 h-12 rounded-xl bg-[var(--panel-accent)]/10 items-center justify-center shrink-0">
                    <FiEdit2 className="w-5 h-5 text-[var(--panel-accent)]" />
                  </div>
                </div>

                <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
                  
                  {/* Username Field */}
                  <div className="group/field">
                    <label className="mb-2.5 flex items-center gap-2 text-xs font-semibold text-[var(--panel-text)] uppercase tracking-wider">
                      <FiUser className="w-3.5 h-3.5 text-[var(--panel-accent)]" />
                      Foydalanuvchi nomi
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
                        <MdOutlinePersonOutline className="w-4 h-4 text-[var(--panel-text-soft)] group-focus-within/field:text-[var(--panel-accent)] transition-colors duration-300" />
                      </div>
                      <input
                        type="text"
                        {...register("username", {
                          required: "Foydalanuvchi nomi majburiy",
                          minLength: {
                            value: 3,
                            message: "Kamida 3 ta belgi"
                          }
                        })}
                        className={`w-full rounded-xl border ${errors.username ? 'border-rose-300 dark:border-rose-500/50' : 'border-[var(--panel-border)]'} bg-[var(--panel-surface)]/50 px-4 py-3.5 pl-11 text-sm text-[var(--panel-text)] placeholder:text-[var(--panel-text-soft)]/50 outline-none focus:border-[var(--panel-accent)] focus:shadow-[0_0_0_3px_var(--panel-focus-ring)] transition-all duration-300`}
                        placeholder="Foydalanuvchi nomingiz"
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        <FiEdit2 className="w-3.5 h-3.5 text-[var(--panel-text-soft)]/30" />
                      </div>
                    </div>
                    {errors.username && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400">
                        <FiAlertCircle className="w-3 h-3 shrink-0" />
                        {errors.username.message}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="group/field">
                    <label className="mb-2.5 flex items-center gap-2 text-xs font-semibold text-[var(--panel-text)] uppercase tracking-wider">
                      <FiMail className="w-3.5 h-3.5 text-[var(--panel-accent)]" />
                      Email manzil
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
                        <MdOutlineEmail className="w-4 h-4 text-[var(--panel-text-soft)] group-focus-within/field:text-[var(--panel-accent)] transition-colors duration-300" />
                      </div>
                      <input
                        type="email"
                        {...register("email", {
                          required: "Email talab qilinadi",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Noto'g'ri email format"
                          }
                        })}
                        className={`w-full rounded-xl border ${errors.email ? 'border-rose-300 dark:border-rose-500/50' : 'border-[var(--panel-border)]'} bg-[var(--panel-surface)]/50 px-4 py-3.5 pl-11 text-sm text-[var(--panel-text)] placeholder:text-[var(--panel-text-soft)]/50 outline-none focus:border-[var(--panel-accent)] focus:shadow-[0_0_0_3px_var(--panel-focus-ring)] transition-all duration-300`}
                        placeholder="email@example.com"
                      />
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        <FiAtSign className="w-3.5 h-3.5 text-[var(--panel-text-soft)]/30" />
                      </div>
                    </div>
                    {errors.email && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400">
                        <FiAlertCircle className="w-3 h-3 shrink-0" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Messages */}
                  {success && (
                    <div className="group/msg rounded-xl border border-emerald-200/50 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 p-4 animate-[fadeIn_0.3s_ease-out]">
                      <div className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-emerald-500/10">
                          <FiCheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-emerald-800 dark:text-emerald-300">{success}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {error && (
                    <div className="group/msg rounded-xl border border-rose-200/50 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/5 p-4 animate-[fadeIn_0.3s_ease-out]">
                      <div className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-rose-500/10">
                          <FiAlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-rose-800 dark:text-rose-300">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="pt-6 border-t border-[var(--panel-border)]">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <button
                        type="submit"
                        disabled={updateMe.isPending || !isDirty}
                        className="group/btn inline-flex items-center justify-center gap-2.5 rounded-lg bg-gradient-to-r from-[var(--panel-accent)] to-[var(--panel-accent-strong)] px-6 py-3.5 text-sm font-medium text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                      >
                        {updateMe.isPending ? (
                          <>
                            <FiLoader className="w-4 h-4 animate-spin" />
                            Saqlanmoqda...
                          </>
                        ) : (
                          <>
                            <FiSave className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            O'zgarishlarni saqlash
                          </>
                        )}
                      </button>
                      
                      {!isDirty && (
                        <p className="text-xs text-[var(--panel-text-soft)] flex items-center gap-1.5">
                          <FiInfo className="w-3 h-3 shrink-0" />
                          Saqlash uchun o'zgarish yo'q
                        </p>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* --- Image Settings Panel --- */}
            <div className={`${panelSurfaceClass} animate-[fadeIn_0.6s_ease-out_0.25s_both]`}>
              <div className="relative">
                <h3 className="text-sm font-semibold text-[var(--panel-text)] mb-6 flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-[var(--panel-accent)]/10">
                    <HiOutlinePhotograph className="w-4 h-4 text-[var(--panel-accent)]" />
                  </div>
                  Rasm sozlamalari
                </h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-5 rounded-xl border border-[var(--panel-border)] bg-[var(--panel-surface)]/50 hover:bg-[var(--panel-accent)]/5 transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-[var(--panel-accent)]/10">
                        <MdOutlinePhotoSizeSelectSmall className="w-4 h-4 text-[var(--panel-accent)]" />
                      </div>
                      <h4 className="text-xs font-semibold text-[var(--panel-text)] uppercase tracking-wider">Yuklash talablari</h4>
                    </div>
                    <ul className="space-y-3 text-xs text-[var(--panel-text-soft)]">
                      <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--panel-accent)] mt-1.5 shrink-0" />
                        <span>Maksimal fayl hajmi: <strong className="text-[var(--panel-text)]">5MB</strong></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--panel-accent)] mt-1.5 shrink-0" />
                        <span>Tavsiya etiladi: <strong className="text-[var(--panel-text)]">Kvadrat rasm</strong></span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--panel-accent)] mt-1.5 shrink-0" />
                        <span>Formatlar: <strong className="text-[var(--panel-text)]">JPG, PNG, WebP</strong></span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-5 rounded-xl border border-[var(--panel-border)] bg-gradient-to-br from-[var(--panel-accent)]/10 via-[var(--panel-accent)]/5 to-[var(--panel-accent-strong)]/10 hover:from-[var(--panel-accent)]/15 hover:via-[var(--panel-accent)]/8 hover:to-[var(--panel-accent-strong)]/15 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-white/60 dark:bg-white/10">
                        <FiUpload className="w-4 h-4 text-[var(--panel-accent)]" />
                      </div>
                      <h4 className="text-xs font-semibold text-[var(--panel-text)] uppercase tracking-wider">Tezkor yuklash</h4>
                    </div>
                    <p className="text-xs text-[var(--panel-text-soft)] mb-5 leading-relaxed">
                      Profil rasmingizni tezda o'zgartirish uchun rasmingiz ustidagi kamera ikonkasini bosing.
                    </p>
                    <label className="group/btn inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[var(--panel-accent)] to-[var(--panel-accent-strong)] px-5 py-2.5 text-xs font-medium text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                      <FiUpload className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                      Rasm tanlash
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploadAvatar.isPending || isUploadingAvatar}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* --- Footer --- */}
            <div className="flex items-center justify-center gap-2 text-xs text-[var(--panel-text-soft)]/60 animate-[fadeIn_0.6s_ease-out_0.35s_both]">
              <span>Profil</span>
              <FiHeart className="text-[var(--panel-accent)] text-xs animate-pulse" />
              <span>bilan yaratildi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={passwordOpen}
        loading={changePassword.isPending}
        onClose={() => setPasswordOpen(false)}
        onSubmit={async (data) => {
          setSuccess("");
          setError("");
          try {
            await changePassword.mutateAsync(data);
            setSuccess("Parol muvaffaqiyatli yangilandi!");
            setPasswordOpen(false);
          } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Parolni o'zgartirishda xatolik yuz berdi.");
          }
        }}
      />

      {/* ===== KEYFRAMES ===== */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}

export default Profile;
