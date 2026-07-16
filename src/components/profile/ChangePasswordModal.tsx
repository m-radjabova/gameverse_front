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
  FiInfo,
  FiStar
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
  const modalTheme = isDarkMode
    ? {
        panel: "border-[#344865] bg-[#101a2b]",
        title: "text-[#f2f7ff]",
        body: "text-[#b7c7dc]",
        label: "text-[#e2edf9]",
        input: "border-[#3b506d] bg-[#19283b] text-[#e8f5ff] placeholder:text-[#8ba1b9] focus:border-[#59b9e6] focus:shadow-[0_0_0_3px_rgba(89,185,230,0.16)]",
        inputIcon: "text-[#7fd3ef]",
        soft: "border-[#344865] bg-[#18263a]",
        cancel: "border-[#3b506d] bg-[#18263a] text-[#e2edf9] hover:bg-[#22354e]",
      }
    : {
        panel: "border-white/70 bg-[#fffaf8]",
        title: "text-[#294476]",
        body: "text-[#7185ad]",
        label: "text-[#294476]",
        input: "border-[#cfe8f4] bg-white/80 text-[#294476] placeholder:text-[#91a4c3] focus:border-[#59b9e6] focus:shadow-[0_0_0_3px_rgba(89,185,230,0.12)]",
        inputIcon: "text-[#59b9e6]",
        soft: "border-[#d7edf6] bg-[#f4fbff]/85",
        cancel: "border-[#cfe8f4] bg-white/75 text-[#294476] hover:bg-white",
      };
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
        <div className={`relative w-full max-w-md overflow-hidden rounded-lg border text-left shadow-2xl transition-all ${modalTheme.panel}`}>
          
          {/* Decorative Elements */}
          <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-[#59b9e6] to-[#ffd15d]" />
          <FiStar className="absolute -right-4 -top-4 text-8xl text-[#59b9e6]/15 rotate-12" />
          <FiStar className="absolute -bottom-5 -left-5 text-7xl text-[#ffd15d]/15 -rotate-12" />
          
          {/* Header */}
          <div className="px-6 pt-8 pb-4 relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-[#59b9e6] to-[#ffd15d] opacity-35 blur-lg" />
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-r from-[#59b9e6] to-[#ffd15d] shadow-lg">
                    <MdOutlinePassword className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className={`text-2xl font-light ${modalTheme.title}`}>Parolni o'zgartirish</h3>
                  <p className={`mt-1 flex items-center gap-1 text-xs ${modalTheme.body}`}>
                    <HiOutlineShieldCheck className="h-3.5 w-3.5 text-[#59b9e6]" />
                    Xavfsizlikni oshirish uchun parolingizni yangilang
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className={`rounded-md p-2 ${modalTheme.body} transition-colors hover:bg-[#59b9e6]/10 hover:text-[#59b9e6] disabled:opacity-50`}
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
                <label className={`mb-2 flex items-center gap-2 text-xs font-medium ${modalTheme.label}`}>
                  <FiLock className="h-3.5 w-3.5 text-[#59b9e6]" />
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
                    className={`w-full rounded-lg border px-4 py-3 pl-10 pr-10 text-sm outline-none transition-all ${errors.current_password ? "border-rose-400" : modalTheme.input}`}
                    placeholder="Joriy parolingiz"
                    disabled={loading}
                  />
                  <HiOutlineKey className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${modalTheme.inputIcon}`} />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${modalTheme.inputIcon} transition-colors hover:text-[#ffd15d]`}
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
                <label className={`mb-2 flex items-center gap-2 text-xs font-medium ${modalTheme.label}`}>
                  <FiLock className="h-3.5 w-3.5 text-[#59b9e6]" />
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
                    className={`w-full rounded-lg border px-4 py-3 pl-10 pr-10 text-sm outline-none transition-all ${errors.new_password ? "border-rose-400" : modalTheme.input}`}
                    placeholder="Yangi parolingiz"
                    disabled={loading}
                  />
                  <MdOutlineSecurity className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${modalTheme.inputIcon}`} />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${modalTheme.inputIcon} transition-colors hover:text-[#ffd15d]`}
                  >
                    {showNew ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className={`mt-3 rounded-lg border p-3 ${modalTheme.soft}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-medium ${modalTheme.body}`}>Parol kuchliligi</span>
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
                              : isDarkMode ? "bg-[#3b506d]" : "bg-[#d7edf6]"
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
                          <div className={`h-1.5 w-1.5 rounded-full ${req.test ? 'bg-emerald-400' : isDarkMode ? 'bg-[#3b506d]' : 'bg-[#d7edf6]'}`} />
                          <span className={`text-[9px] ${req.test ? 'text-emerald-500' : modalTheme.body}`}>
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
                <label className={`mb-2 flex items-center gap-2 text-xs font-medium ${modalTheme.label}`}>
                  <FiLock className="h-3.5 w-3.5 text-[#59b9e6]" />
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
                    className={`w-full rounded-lg border px-4 py-3 pl-10 pr-10 text-sm outline-none transition-all ${errors.confirm_password ? "border-rose-400" : modalTheme.input}`}
                    placeholder="Yangi parolni qayta kiriting"
                    disabled={loading}
                  />
                  <MdOutlineVerifiedUser className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${modalTheme.inputIcon}`} />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${modalTheme.inputIcon} transition-colors hover:text-[#ffd15d]`}
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
              <div className={`rounded-lg border p-4 ${modalTheme.soft}`}>
                <div className="flex items-start gap-2">
                  <FiShield className="mt-0.5 h-4 w-4 text-[#59b9e6]" />
                  <div>
                    <h4 className={`flex items-center gap-1 text-xs font-medium ${modalTheme.label}`}>
                      <FiInfo className="h-3 w-3 text-[#59b9e6]" />
                      Xavfsizlik maslahatlari
                    </h4>
                    <ul className={`mt-2 space-y-1 text-[10px] ${modalTheme.body}`}>
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#59b9e6]">•</span>
                        <span>Boshqa saytlarda ishlatmagan unikal parol tanlang</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#59b9e6]">•</span>
                        <span>Harflar, raqamlar va maxsus belgilardan foydalaning</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-[#59b9e6]">•</span>
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
                className={`flex-1 rounded-lg border px-4 py-3 text-xs font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 ${modalTheme.cancel}`}
              >
                Bekor qilish
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#59b9e6] to-[#ffd15d] px-4 py-3 text-xs font-medium text-white shadow-lg transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
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
      `}</style>
    </div>
  );
}
