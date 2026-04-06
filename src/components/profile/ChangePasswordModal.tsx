import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { 
  FiLock, 
  FiEye, 
  FiEyeOff,
  FiCheck, 
  FiX, 
  FiAlertCircle, 
  FiLoader,
  FiShield,
  FiInfo
} from "react-icons/fi";
import { 
  MdOutlinePassword,
  MdOutlineSecurity,
  MdOutlineVerifiedUser
} from "react-icons/md";
import { 
  HiOutlineShieldCheck,
  HiOutlineKey
} from "react-icons/hi";
import { GiCherry } from "react-icons/gi";
import useHomeTheme from "../../hooks/useHomeTheme";

type FormData = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

type Props = {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: { current_password: string; new_password: string }) => void;
};

export default function ChangePasswordModal({ open, loading, onClose, onSubmit }: Props) {
  const isDarkMode = useHomeTheme();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const newPassword = watch("new_password");
  const currentPassword = watch("current_password");

  useEffect(() => {
    if (newPassword) {
      let strength = 0;
      if (newPassword.length >= 8) strength++;
      if (/[A-Z]/.test(newPassword)) strength++;
      if (/[0-9]/.test(newPassword)) strength++;
      if (/[^A-Za-z0-9]/.test(newPassword)) strength++;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [newPassword]);

  useEffect(() => {
    if (!open) {
      reset();
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      setPasswordStrength(0);
    }
  }, [open, reset]);

  const onSubmitForm = (data: FormData) => {
    onSubmit({
      current_password: data.current_password,
      new_password: data.new_password,
    });
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "from-rose-400 to-rose-500";
      case 2:
        return "from-amber-400 to-orange-400";
      case 3:
        return "from-teal-400 to-emerald-400";
      case 4:
        return "from-emerald-400 to-green-500";
      default:
        return "from-slate-300 to-slate-400";
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
        return "Juda zaif";
      case 1:
        return "Zaif";
      case 2:
        return "O'rtacha";
      case 3:
        return "Yaxshi";
      case 4:
        return "Kuchli";
      default:
        return "";
    }
  };

  if (!open) return null;

  return (
    <div
      data-home-theme={isDarkMode ? "dark" : "light"}
      className="password-theme fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        />
        
        {/* Modal Panel */}
        <div className="relative transform overflow-hidden rounded-3xl bg-gradient-to-br from-[#fff9f8] to-[#fff1f0] text-left shadow-2xl transition-all w-full max-w-md border border-white/60">
          
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#e07c8e] to-[#a66466]" />
          <GiCherry className="absolute -top-6 -right-6 text-8xl text-[#e07c8e]/10 rotate-12" />
          <GiCherry className="absolute -bottom-6 -left-6 text-8xl text-[#a66466]/10 -rotate-12" />
          
          {/* Header */}
          <div className="px-6 pt-8 pb-4 relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#e07c8e] to-[#a66466] rounded-xl blur-lg opacity-50" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-[#e07c8e] to-[#a66466] shadow-lg">
                    <MdOutlinePassword className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-light text-[#7b4f53]">Parolni o'zgartirish</h3>
                  <p className="text-xs text-[#8f6d70] mt-1 flex items-center gap-1">
                    <HiOutlineShieldCheck className="h-3.5 w-3.5 text-[#e07c8e]" />
                    Xavfsizlikni oshirish uchun parolingizni yangilang
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="rounded-lg p-1.5 text-[#b38b8d] hover:bg-[#fceae8] hover:text-[#e07c8e] transition-all disabled:opacity-50"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmitForm)} className="px-6 pb-8 relative">
            <div className="space-y-5">
              
              {/* Current Password */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-medium text-[#7b4f53]">
                  <FiLock className="h-3.5 w-3.5 text-[#e07c8e]" />
                  Joriy parol
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    {...register("current_password", {
                      required: "Joriy parol majburiy",
                      minLength: {
                        value: 6,
                        message: "Kamida 6 ta belgi",
                      },
                    })}
                    className={`w-full rounded-xl border ${errors.current_password ? "border-rose-300" : "border-[#f0d9d6]"} bg-white/80 px-4 py-3 pl-10 pr-10 text-sm text-[#7b4f53] placeholder:text-[#b38b8d] outline-none focus:border-[#e07c8e] focus:shadow-[0_0_0_3px_rgba(224,124,142,0.1)] transition-all`}
                    placeholder="Joriy parolingiz"
                    disabled={loading}
                  />
                  <HiOutlineKey className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b38b8d]" />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b38b8d] hover:text-[#e07c8e] transition-colors"
                  >
                    {showCurrent ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.current_password && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                    <FiAlertCircle className="w-3 h-3" />
                    {errors.current_password.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-medium text-[#7b4f53]">
                  <FiLock className="h-3.5 w-3.5 text-[#e07c8e]" />
                  Yangi parol
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    {...register("new_password", {
                      required: "Yangi parol majburiy",
                      minLength: {
                        value: 8,
                        message: "Kamida 8 ta belgi",
                      },
                      validate: (value) => {
                        if (value === currentPassword) {
                          return "Yangi parol joriy paroldan farqli bo'lishi kerak";
                        }
                        return true;
                      },
                    })}
                    className={`w-full rounded-xl border ${errors.new_password ? "border-rose-300" : "border-[#f0d9d6]"} bg-white/80 px-4 py-3 pl-10 pr-10 text-sm text-[#7b4f53] placeholder:text-[#b38b8d] outline-none focus:border-[#e07c8e] focus:shadow-[0_0_0_3px_rgba(224,124,142,0.1)] transition-all`}
                    placeholder="Yangi parolingiz"
                    disabled={loading}
                  />
                  <MdOutlineSecurity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b38b8d]" />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b38b8d] hover:text-[#e07c8e] transition-colors"
                  >
                    {showNew ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="mt-3 p-3 rounded-xl bg-[#fceae8]/50 border border-[#f0d9d6]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-medium text-[#8f6d70]">Parol kuchliligi</span>
                      <span className={`text-[8px] font-medium px-2 py-0.5 rounded-full bg-gradient-to-r ${getPasswordStrengthColor()} text-white`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="flex gap-1 mb-2">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength 
                              ? `bg-gradient-to-r ${getPasswordStrengthColor()}` 
                              : "bg-[#f0d9d6]"
                          }`}
                        />
                      ))}
                    </div>
                    
                    {/* Requirements */}
                    <div className="space-y-1.5">
                      {[
                        { test: newPassword.length >= 8, text: "Kamida 8 ta belgi" },
                        { test: /[A-Z]/.test(newPassword), text: "Bitta katta harf" },
                        { test: /[0-9]/.test(newPassword), text: "Bitta raqam" },
                        { test: /[^A-Za-z0-9]/.test(newPassword), text: "Maxsus belgi" },
                      ].map((req, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${req.test ? 'bg-emerald-400' : 'bg-[#f0d9d6]'}`} />
                          <span className={`text-[9px] ${req.test ? 'text-emerald-600' : 'text-[#b38b8d]'}`}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {errors.new_password && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                    <FiAlertCircle className="w-3 h-3" />
                    {errors.new_password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-medium text-[#7b4f53]">
                  <FiLock className="h-3.5 w-3.5 text-[#e07c8e]" />
                  Parolni tasdiqlang
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    {...register("confirm_password", {
                      required: "Parolni tasdiqlash majburiy",
                      validate: (value) =>
                        value === watch("new_password") || "Parollar mos kelmadi",
                    })}
                    className={`w-full rounded-xl border ${errors.confirm_password ? "border-rose-300" : "border-[#f0d9d6]"} bg-white/80 px-4 py-3 pl-10 pr-10 text-sm text-[#7b4f53] placeholder:text-[#b38b8d] outline-none focus:border-[#e07c8e] focus:shadow-[0_0_0_3px_rgba(224,124,142,0.1)] transition-all`}
                    placeholder="Yangi parolni qayta kiriting"
                    disabled={loading}
                  />
                  <MdOutlineVerifiedUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b38b8d]" />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b38b8d] hover:text-[#e07c8e] transition-colors"
                  >
                    {showConfirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-rose-500">
                    <FiAlertCircle className="w-3 h-3" />
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>

              {/* Security Tips */}
              <div className="rounded-xl border border-[#f0d9d6] bg-[#fceae8]/50 p-4">
                <div className="flex items-start gap-2">
                  <FiShield className="w-4 h-4 text-[#e07c8e] mt-0.5" />
                  <div>
                    <h4 className="text-xs font-medium text-[#7b4f53] flex items-center gap-1">
                      <FiInfo className="w-3 h-3 text-[#e07c8e]" />
                      Xavfsizlik maslahatlari
                    </h4>
                    <ul className="mt-2 space-y-1 text-[10px] text-[#8f6d70]">
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#e07c8e]">•</span>
                        <span>Boshqa saytlarda ishlatmagan unikal parol tanlang</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#e07c8e]">•</span>
                        <span>Harflar, raqamlar va maxsus belgilardan foydalaning</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#e07c8e]">•</span>
                        <span>Oddiy so'zlar va shaxsiy ma'lumotlardan saqlaning</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-xl border border-[#f0d9d6] bg-white/50 backdrop-blur-sm px-4 py-3 text-xs font-medium text-[#7b4f53] transition-all hover:bg-white hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
              >
                Bekor qilish
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#e07c8e] to-[#a66466] px-4 py-3 text-xs font-medium text-white shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <FiLoader className="w-3 h-3 animate-spin" />
                    Yangilanmoqda...
                  </>
                ) : (
                  <>
                    <FiCheck className="w-3 h-3" />
                    Parolni yangilash
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes float-soft {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes petal-float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float-soft {
          animation: float-soft 4s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-soft 6s ease-in-out infinite;
        }
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-petal-float {
          animation: petal-float 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
