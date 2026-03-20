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
  FiHeart
} from "react-icons/fi";
import { 
  MdOutlineBadge,
  MdOutlineVerified
} from "react-icons/md";
import { GiCherry, GiFlowerTwirl, GiPlanetCore } from "react-icons/gi";
import ChangePasswordModal from "./ChangePasswordModal";

type ProfileForm = {
  username: string;
  email: string;
};

function Profile() {
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
      <section className="min-h-screen bg-gradient-to-br from-[#fff9f8] via-[#fff1f0] to-[#fae6df] py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-center h-[80vh]">
            <div className="text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#e07c8e] rounded-full blur-3xl opacity-20 animate-pulse-soft" />
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <GiPlanetCore className="w-24 h-24 text-[#e07c8e] animate-spin-slow" />
                </div>
              </div>
              <h3 className="text-xl font-light text-[#7b4f53] mb-2">Profil yuklanmoqda</h3>
              <p className="text-[#8f6d70]">Iltimos, biroz kuting...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (meQuery.isError || !user) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-[#fff9f8] via-[#fff1f0] to-[#fae6df] py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl border border-[#f0d9d6] bg-white/70 backdrop-blur-sm p-8 shadow-xl">
            <div className="text-center py-16">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-[#e07c8e] rounded-full blur-xl opacity-30" />
                <FiAlertCircle className="relative w-16 h-16 text-[#e07c8e]" />
              </div>
              <h2 className="text-2xl font-light text-[#7b4f53] mb-2">Autentifikatsiya talab qilinadi</h2>
              <p className="text-[#8f6d70] mb-6 max-w-md mx-auto">
                Profil ma'lumotlarini ko'rish va tahrirlash uchun tizimga kiring.
              </p>
              <button 
                onClick={() => window.location.href = '/login'}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e07c8e] to-[#a66466] px-6 py-3 text-sm font-medium text-white shadow-lg hover:-translate-y-1 transition-all"
              >
                <HiOutlineUserCircle className="w-5 h-5" />
                Kirish sahifasiga o'tish
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen  bg-gradient-to-br from-[#fff9f8] via-[#fff1f0] to-[#fae6df] py-10">
      
      {/* Minimal Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-[5%] top-[10%] h-72 w-72 rounded-full bg-[#f6d4da]/20 blur-3xl animate-float-soft" />
        <div className="absolute right-[8%] bottom-[15%] h-80 w-80 rounded-full bg-[#fbe5dd]/20 blur-3xl animate-float-slow" />
        <GiCherry className="absolute left-[12%] top-[20%] text-6xl text-[#e07c8e]/10 animate-petal-float" />
        <GiFlowerTwirl className="absolute right-[15%] top-[40%] text-7xl text-[#a66466]/10 animate-float-soft" />
      </div>

      <div className="mx-auto mt-20 max-w-8xl px-4 relative z-10">
        
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex flex-col">
            <div className="flex items-baseline gap-3">
              <h1 className="text-4xl font-light text-[#7b4f53] tracking-tight">
                Profil sozlamalari
              </h1>
              <span className="text-[10px] font-medium px-2 py-1 bg-gradient-to-r from-[#e07c8e] to-[#a66466] text-white rounded-full shadow-sm">
                SHAXSIY
              </span>
            </div>
            
            <div className="mt-4 relative">
              <p className="text-[#8f6d70] text-base pl-8 relative z-10">
                Shaxsiy ma'lumotlaringiz va hisob sozlamalarini yangilang
              </p>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-px bg-gradient-to-r from-[#e07c8e] to-transparent" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* Left Panel - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Profile Card */}
            <div className="rounded-3xl border border-[#f0d9d6] bg-white/70 backdrop-blur-sm p-6 shadow-xl">
              <div className="relative">
                
                {/* Decorative top gradient */}
                <div className="absolute -top-6 -left-6 -right-6 h-24 bg-gradient-to-r from-[#fceae8] to-[#ffe1de] rounded-t-3xl opacity-50" />
                
                <div className="relative flex flex-col items-center text-center mt-4">
                  
                  {/* Avatar Upload */}
                  <div className="relative group mb-4">
                    <div className="absolute -inset-2 bg-gradient-to-r from-[#e07c8e] to-[#a66466] rounded-full opacity-0 group-hover:opacity-30 blur-lg transition-opacity" />
                    
                    {avatarSrc && !hasAvatarError ? (
                      <img
                        src={avatarSrc}
                        alt={userDisplayName}
                        className="relative h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg"
                        onError={() => setHasAvatarError(true)}
                      />
                    ) : (
                      <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-[#fceae8] via-[#f4cdd1] to-[#e07c8e] text-4xl font-semibold text-[#7b4f53] shadow-lg">
                        {userInitial}
                      </div>
                    )}
                    
                    <label className="absolute bottom-2 right-2 cursor-pointer">
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#e07c8e] rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity" />
                        <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-r from-[#e07c8e] to-[#a66466] text-white shadow-lg hover:-translate-y-1 transition-all">
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
                  <div className="mb-4">
                    <h1 className="text-2xl font-medium text-[#7b4f53] mb-1">
                      {userDisplayName}
                    </h1>
                    <div className="flex items-center justify-center gap-1 text-sm text-[#8f6d70]">
                      <FiMail className="text-[#e07c8e] text-xs" />
                      {user.email}
                    </div>
                  </div>

                  {/* Role Badges */}
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fceae8] px-4 py-1.5 text-xs font-medium text-[#e07c8e] border border-[#f0d9d6]">
                      <MdOutlineBadge className="w-3.5 h-3.5" />
                      {(user.roles && user.roles.length ? user.roles.join(", ") : "foydalanuvchi")}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-600 border border-emerald-200">
                      <MdOutlineVerified className="w-3.5 h-3.5" />
                      Tasdiqlangan
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="w-full space-y-3">
                    <button
                      type="button"
                      onClick={() => setPasswordOpen(true)}
                      className="flex items-center justify-center gap-2 w-full rounded-xl border border-[#f0d9d6] bg-white/50 backdrop-blur-sm px-4 py-3 text-sm font-medium text-[#7b4f53] transition-all hover:bg-gradient-to-r hover:from-[#e07c8e] hover:to-[#a66466] hover:text-white hover:border-transparent hover:-translate-y-1 hover:shadow-lg group"
                    >
                      <FiLock className="w-4 h-4 group-hover:text-white transition-colors" />
                      Parolni o'zgartirish
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Account Stats Card */}
            <div className="rounded-3xl border border-[#f0d9d6] bg-white/70 backdrop-blur-sm p-6 shadow-xl">
              <h3 className="text-sm font-medium text-[#7b4f53] mb-4 flex items-center gap-2">
                <HiOutlineClock className="w-4 h-4 text-[#e07c8e]" />
                Hisob haqida
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#fceae8]/50">
                  <span className="text-xs text-[#8f6d70]">Ro'yxatdan o'tgan</span>
                  <span className="text-xs font-medium text-[#7b4f53] flex items-center gap-1">
                    <FiCalendar className="w-3 h-3 text-[#e07c8e]" />
                    {formatUserCreatedAt(user)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#fceae8]/50">
                  <span className="text-xs text-[#8f6d70]">Holat</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-medium text-emerald-600">
                    <FiCheckCircle className="w-3 h-3" />
                    Faol
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#fceae8]/50">
                  <span className="text-xs text-[#8f6d70]">Hisob turi</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fceae8] px-3 py-1 text-[10px] font-medium text-[#e07c8e]">
                    <HiOutlineSparkles className="w-3 h-3" />
                    Premium
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Edit Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Edit Profile Form */}
            <div className="rounded-3xl border border-[#f0d9d6] bg-white/70 backdrop-blur-sm p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-light text-[#7b4f53]">Profilni tahrirlash</h2>
                  <p className="text-[#8f6d70] text-sm mt-1">
                    Shaxsiy ma'lumotlaringiz va email manzilingizni yangilang
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#fceae8] flex items-center justify-center">
                  <FiEdit2 className="w-5 h-5 text-[#e07c8e]" />
                </div>
              </div>

              <form onSubmit={handleSubmit(handleSave)} className="space-y-5">
                
                {/* Username Field */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-medium text-[#7b4f53]">
                    <FiUser className="w-3.5 h-3.5 text-[#e07c8e]" />
                    Foydalanuvchi nomi
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register("username", {
                        required: "Foydalanuvchi nomi majburiy",
                        minLength: {
                          value: 3,
                          message: "Kamida 3 ta belgi"
                        }
                      })}
                      className={`w-full rounded-xl border ${errors.username ? 'border-rose-300' : 'border-[#f0d9d6]'} bg-white/80 px-4 py-3 pl-10 text-sm text-[#7b4f53] placeholder:text-[#b38b8d] outline-none focus:border-[#e07c8e] focus:shadow-[0_0_0_3px_rgba(224,124,142,0.1)] transition-all`}
                      placeholder="Foydalanuvchi nomingiz"
                    />
                    <HiOutlineUserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b38b8d]" />
                  </div>
                  {errors.username && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                      <FiAlertCircle className="w-3 h-3" />
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-medium text-[#7b4f53]">
                    <FiMail className="w-3.5 h-3.5 text-[#e07c8e]" />
                    Email manzil
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      {...register("email", {
                        required: "Email talab qilinadi",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Noto'g'ri email format"
                        }
                      })}
                      className={`w-full rounded-xl border ${errors.email ? 'border-rose-300' : 'border-[#f0d9d6]'} bg-white/80 px-4 py-3 pl-10 text-sm text-[#7b4f53] placeholder:text-[#b38b8d] outline-none focus:border-[#e07c8e] focus:shadow-[0_0_0_3px_rgba(224,124,142,0.1)] transition-all`}
                      placeholder="email@example.com"
                    />
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b38b8d]" />
                  </div>
                  {errors.email && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                      <FiAlertCircle className="w-3 h-3" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Messages */}
                {success && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                    <div className="flex items-start gap-2">
                      <FiCheckCircle className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-emerald-800">{success}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
                    <div className="flex items-start gap-2">
                      <FiAlertCircle className="w-4 h-4 text-rose-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-rose-800">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="pt-4 border-t border-[#f0d9d6]">
                  <button
                    type="submit"
                    disabled={updateMe.isPending || !isDirty}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#e07c8e] to-[#a66466] px-6 py-3 text-sm font-medium text-white shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {updateMe.isPending ? (
                      <>
                        <FiLoader className="w-4 h-4 animate-spin" />
                        Saqlanmoqda...
                      </>
                    ) : (
                      <>
                        <FiSave className="w-4 h-4" />
                        O'zgarishlarni saqlash
                      </>
                    )}
                  </button>
                  
                  {!isDirty && (
                    <p className="mt-3 text-xs text-[#b38b8d] flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" />
                      Saqlash uchun o'zgarish yo'q
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Image Settings Panel */}
            <div className="rounded-3xl border border-[#f0d9d6] bg-white/70 backdrop-blur-sm p-6 shadow-xl">
              <h3 className="text-sm font-medium text-[#7b4f53] mb-4 flex items-center gap-2">
                <HiOutlinePhotograph className="w-4 h-4 text-[#e07c8e]" />
                Rasm sozlamalari
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-xl border border-[#f0d9d6] bg-white/50">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-[#fceae8]">
                      <HiOutlinePhotograph className="w-4 h-4 text-[#e07c8e]" />
                    </div>
                    <h4 className="text-xs font-medium text-[#7b4f53]">Yuklash talablari</h4>
                  </div>
                  <ul className="space-y-2 text-xs text-[#8f6d70]">
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-[#e07c8e] mt-1.5"></div>
                      <span>Maksimal fayl hajmi: 5MB</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-[#e07c8e] mt-1.5"></div>
                      <span>Tavsiya etiladi: Kvadrat rasm</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-[#e07c8e] mt-1.5"></div>
                      <span>Formatlar: JPG, PNG, WebP</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 rounded-xl border border-[#f0d9d6] bg-gradient-to-br from-[#fceae8] to-[#ffe1de]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-lg bg-white">
                      <FiUpload className="w-4 h-4 text-[#e07c8e]" />
                    </div>
                    <h4 className="text-xs font-medium text-[#7b4f53]">Tezkor yuklash</h4>
                  </div>
                  <p className="text-xs text-[#8f6d70] mb-4">
                    Profil rasmingizni tezda o'zgartirish uchun rasmingiz ustidagi kamera ikonkasini bosing.
                  </p>
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#e07c8e] to-[#a66466] px-4 py-2 text-xs font-medium text-white shadow-lg hover:-translate-y-1 transition-all">
                    <FiUpload className="w-3 h-3" />
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

            {/* Made with love */}
            <div className="flex items-center justify-center gap-1 text-xs text-[#b38b8d]">
              <span>Profil</span>
              <FiHeart className="text-[#e07c8e] text-xs animate-pulse-soft" />
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
    </section>
  );
}

export default Profile;
