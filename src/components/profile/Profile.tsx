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

import { 
  HiOutlineUserCircle, 
  HiOutlinePhotograph,
  HiOutlineClock,
  HiOutlineBadgeCheck
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
  FiShield,
  FiEdit2,
  FiLoader,
  FiCalendar
} from "react-icons/fi";
import { 
  MdOutlineBadge,
  MdOutlineVerified
} from "react-icons/md";
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
      <section className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-center h-[80vh]">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-[#d42d73] to-[#b0134d] mb-6 shadow-lg shadow-[#d42d73]/20">
                <FiLoader className="w-8 h-8 text-white animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Profil yuklanmoqda</h3>
              <p className="text-gray-500">Iltimos, biroz kuting...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (meQuery.isError || !user) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-2xl border border-rose-200 bg-white/80 backdrop-blur-sm p-8 shadow-xl">
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-rose-100 to-pink-100 text-[#d42d73] mb-4">
                <FiAlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Autentifikatsiya talab qilinadi</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Profil ma'lumotlarini ko'rish va tahrirlash uchun tizimga kiring.
              </p>
              <button 
                onClick={() => window.location.href = '/login'}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#d42d73] via-[#c2185b] to-[#b0134d] px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#d42d73]/30 hover:scale-[1.02] active:scale-[0.98]"
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
    <section className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 py-10">
      {/* Dekorativ elementlar */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-[#d42d73]/10 to-[#b0134d]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-[#c2185b]/10 to-[#d42d73]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="mx-auto max-w-8xl px-4 relative z-10">
        {/* Sarlavha */}
        <div className="mb-10">
          <div className="inline-flex flex-col">
            <div className="flex items-baseline gap-3">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                Profil Sozlamalari
              </h1>
              <span className="text-xs font-semibold px-2 py-1 bg-gradient-to-r from-[#d42d73] to-[#b0134d] text-white rounded-full shadow-sm">
                SHAXSIY
              </span>
            </div>
            
            <div className="mt-4 relative">
              <p className="text-gray-600 text-lg pl-10 relative z-10">
                Shaxsiy ma'lumotlaringiz va hisob sozlamalarini yangilang
              </p>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-0.5 bg-gradient-to-r from-[#d42d73] to-[#b0134d] rounded-full" />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chap panel - Profil ma'lumotlari */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profil kartasi */}
            <div className="rounded-2xl border border-rose-200/50 bg-white/80 backdrop-blur-sm p-6 shadow-xl">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#d42d73] via-[#c2185b] to-[#b0134d] h-20 rounded-t-2xl -mx-6 -mt-6"></div>
                
                <div className="relative flex flex-col items-center text-center mt-14">
                  {/* Rasm yuklash qismi */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#d42d73] to-[#b0134d] rounded-full opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
                    <img
                      src={avatarSrc || "https://placehold.co/140x140/fee9f2/d42d73?text=Foydalanuvchi"}
                      alt={user.username || "Foydalanuvchi"}
                      className="relative h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
                    />
                    
                    <label className="absolute bottom-2 right-2 cursor-pointer">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-[#d42d73] to-[#b0134d] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl">
                        {isUploadingAvatar ? (
                          <FiLoader className="w-5 h-5 animate-spin" />
                        ) : (
                          <FiCamera className="w-5 h-5" />
                        )}
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

                  {/* Foydalanuvchi ma'lumotlari */}
                  <div className="mt-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                      {user.username || "Ismsiz foydalanuvchi"}
                    </h1>
                    <div className="flex items-center gap-2 mt-2">
                      <FiMail className="w-4 h-4 text-[#d42d73]" />
                      <p className="text-gray-600">{user.email}</p>
                    </div>
                  </div>

                  {/* Rol belgisi */}
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#d42d73]/10 to-[#b0134d]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[#d42d73] border border-[#d42d73]/20">
                      <MdOutlineBadge className="w-3.5 h-3.5" />
                      {(user.roles && user.roles.length ? user.roles.join(", ") : "foydalanuvchi")}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700 border border-emerald-200">
                      <MdOutlineVerified className="w-3.5 h-3.5" />
                      Tasdiqlangan
                    </span>
                  </div>

                  {/* Amal tugmalari */}
                  <div className="mt-8 w-full space-y-3">
                    <button
                      type="button"
                      onClick={() => setPasswordOpen(true)}
                      className="flex items-center justify-center gap-2 w-full rounded-xl border border-rose-200 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gradient-to-r hover:from-[#d42d73] hover:to-[#b0134d] hover:text-white hover:border-transparent hover:shadow-lg group"
                    >
                      <FiLock className="w-4 h-4 group-hover:text-white transition-colors" />
                      Parolni o'zgartirish
                    </button>
                    
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 w-full rounded-xl border border-rose-200 bg-white/50 backdrop-blur-sm px-4 py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gradient-to-r hover:from-[#d42d73] hover:to-[#b0134d] hover:text-white hover:border-transparent hover:shadow-lg group"
                    >
                      <FiShield className="w-4 h-4 group-hover:text-white transition-colors" />
                      Maxfiylik sozlamalari
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Hisob statistikasi kartasi */}
            <div className="rounded-2xl border border-rose-200/50 bg-white/80 backdrop-blur-sm p-6 shadow-xl">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <HiOutlineClock className="w-5 h-5 text-[#d42d73]" />
                Hisob haqida
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#d42d73]/5 to-[#b0134d]/5">
                  <span className="text-sm text-gray-600">Ro'yxatdan o'tgan</span>
                  <span className="text-sm font-medium text-gray-800 flex items-center gap-1">
                    <FiCalendar className="w-3 h-3 text-[#d42d73]" />
                    {new Date(user.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#d42d73]/5 to-[#b0134d]/5">
                  <span className="text-sm text-gray-600">Holat</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <FiCheckCircle className="w-3 h-3" />
                    Faol
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#d42d73]/5 to-[#b0134d]/5">
                  <span className="text-sm text-gray-600">Hisob turi</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#d42d73]/10 to-[#b0134d]/10 px-3 py-1 text-xs font-semibold text-[#d42d73]">
                    <HiOutlineBadgeCheck className="w-3 h-3" />
                    Premium
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* O'ng panel - Sozlash formasi */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profilni tahrirlash formasi */}
            <div className="rounded-2xl border border-rose-200/50 bg-white/80 backdrop-blur-sm p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Profilni Tahrirlash</h2>
                  <p className="text-gray-500 mt-1">
                    Shaxsiy ma'lumotlaringiz va email manzilingizni yangilang
                  </p>
                </div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-[#d42d73]/10 to-[#b0134d]/10 text-[#d42d73]">
                  <FiEdit2 className="w-6 h-6" />
                </div>
              </div>

              <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
                {/* Foydalanuvchi nomi kiritish maydoni */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FiUser className="w-4 h-4 text-[#d42d73]" />
                    Foydalanuvchi nomi
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register("username", {
                        required: "Foydalanuvchi nomi majburiy",
                        minLength: {
                          value: 3,
                          message: "Foydalanuvchi nomi kamida 3 ta belgidan iborat bo'lishi kerak"
                        }
                      })}
                      className={`w-full rounded-xl border ${errors.username ? 'border-red-300' : 'border-rose-200'} bg-white/50 px-4 py-3 pl-12 outline-none transition-all focus:border-[#d42d73] focus:ring-2 focus:ring-[#d42d73]/20 backdrop-blur-sm`}
                      placeholder="Foydalanuvchi nomingizni kiriting"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <HiOutlineUserCircle className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.username && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                      <FiAlertCircle className="w-4 h-4" />
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Email kiritish maydoni */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FiMail className="w-4 h-4 text-[#d42d73]" />
                    Email Manzil
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      {...register("email", {
                        required: "Email manzil majburiy",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Noto'g'ri email manzil"
                        }
                      })}
                      className={`w-full rounded-xl border ${errors.email ? 'border-red-300' : 'border-rose-200'} bg-white/50 px-4 py-3 pl-12 outline-none transition-all focus:border-[#d42d73] focus:ring-2 focus:ring-[#d42d73]/20 backdrop-blur-sm`}
                      placeholder="Email manzilingizni kiriting"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <FiMail className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.email && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                      <FiAlertCircle className="w-4 h-4" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Xabarlar */}
                {success && (
                  <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 backdrop-blur-sm p-4">
                    <div className="flex items-start gap-3">
                      <FiCheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-emerald-800">Muvaffaqiyatli!</p>
                        <p className="text-sm text-emerald-700">{success}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50/80 to-pink-50/80 backdrop-blur-sm p-4">
                    <div className="flex items-start gap-3">
                      <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">Xatolik yuz berdi</p>
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Saqlash tugmasi */}
                <div className="pt-4 border-t border-rose-200">
                  <button
                    type="submit"
                    disabled={updateMe.isPending || !isDirty}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#d42d73] via-[#c2185b] to-[#b0134d] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#d42d73]/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                    <p className="mt-3 text-sm text-gray-500 flex items-center gap-1">
                      <FiAlertCircle className="w-4 h-4" />
                      Saqlash uchun o'zgarish yo'q
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Rasm sozlamalari paneli */}
            <div className="rounded-2xl border border-rose-200/50 bg-white/80 backdrop-blur-sm p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <HiOutlinePhotograph className="w-5 h-5 text-[#d42d73]" />
                Rasm Sozlamalari
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-xl border border-rose-200 bg-white/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-[#d42d73]/10 to-[#b0134d]/10">
                      <HiOutlinePhotograph className="w-5 h-5 text-[#d42d73]" />
                    </div>
                    <h4 className="font-medium text-gray-800">Yuklash Talablari</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#d42d73] to-[#b0134d] mt-1.5"></div>
                      <span>Maksimal fayl hajmi: 5MB</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#d42d73] to-[#b0134d] mt-1.5"></div>
                      <span>Tavsiya etiladi: Kvadrat rasm</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#d42d73] to-[#b0134d] mt-1.5"></div>
                      <span>Formatlar: JPG, PNG, WebP</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 rounded-xl border border-rose-200 bg-gradient-to-r from-[#d42d73]/5 to-[#b0134d]/5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-[#d42d73]/10 to-[#b0134d]/10">
                      <FiUpload className="w-5 h-5 text-[#d42d73]" />
                    </div>
                    <h4 className="font-medium text-gray-800">Tezkor Yuklash</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Profil rasmingizni tezda o'zgartirish uchun rasmingiz ustidagi kamera ikonkasini bosing.
                  </p>
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#d42d73] via-[#c2185b] to-[#b0134d] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-[#d42d73]/30 hover:scale-[1.02]">
                    <FiUpload className="w-4 h-4" />
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
        </div>
      </div>

      {/* Parolni o'zgartirish modali */}
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
