import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FiLock, FiEye, FiEyeOff, FiKey, FiCheck, FiX, FiAlertCircle, FiLoader } from "react-icons/fi";
import { MdOutlinePassword } from "react-icons/md";

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
        return "bg-red-500";
      case 2:
        return "bg-amber-500";
      case 3:
        return "bg-teal-400";
      case 4:
        return "bg-green-500";
      default:
        return "bg-slate-300";
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
        return "Very Weak";
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "";
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        />
        
        {/* Modal panel */}
        <div className="relative transform overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 text-left shadow-2xl transition-all w-full max-w-md">
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500">
                  <MdOutlinePassword className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Change Password</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Update your password for enhanced security
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmitForm)} className="px-6 pb-6">
            <div className="space-y-5">
              {/* Current Password */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <FiLock className="h-4 w-4" />
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    {...register("current_password", {
                      required: "Current password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                    })}
                    className={`w-full rounded-xl border ${errors.current_password ? "border-red-300" : "border-slate-300"} px-4 py-3 pl-12 pr-12 outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-200`}
                    placeholder="Enter current password"
                    disabled={loading}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <FiKey className="h-5 w-5 text-slate-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrent ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.current_password && (
                  <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                    <FiAlertCircle className="h-4 w-4" />
                    {errors.current_password.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <FiLock className="h-4 w-4" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    {...register("new_password", {
                      required: "New password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                      validate: (value) => {
                        if (value === watch("current_password")) {
                          return "New password must be different from current password";
                        }
                        return true;
                      },
                    })}
                    className={`w-full rounded-xl border ${errors.new_password ? "border-red-300" : "border-slate-300"} px-4 py-3 pl-12 pr-12 outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-200`}
                    placeholder="Enter new password"
                    disabled={loading}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <FiKey className="h-5 w-5 text-slate-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNew ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {newPassword && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-slate-600">Password strength</span>
                      <span className={`text-xs font-semibold ${getPasswordStrengthColor().replace("bg-", "text-")}`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full ${level <= passwordStrength ? getPasswordStrengthColor() : "bg-slate-200"}`}
                        />
                      ))}
                    </div>
                    
                    {/* Password requirements */}
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${newPassword.length >= 8 ? "bg-green-500" : "bg-slate-300"}`} />
                        <span className={`text-xs ${newPassword.length >= 8 ? "text-green-600 font-medium" : "text-slate-500"}`}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${/[A-Z]/.test(newPassword) ? "bg-green-500" : "bg-slate-300"}`} />
                        <span className={`text-xs ${/[A-Z]/.test(newPassword) ? "text-green-600 font-medium" : "text-slate-500"}`}>
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`h-1.5 w-1.5 rounded-full ${/[0-9]/.test(newPassword) ? "bg-green-500" : "bg-slate-300"}`} />
                        <span className={`text-xs ${/[0-9]/.test(newPassword) ? "text-green-600 font-medium" : "text-slate-500"}`}>
                          One number
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {errors.new_password && (
                  <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                    <FiAlertCircle className="h-4 w-4" />
                    {errors.new_password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <FiLock className="h-4 w-4" />
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    {...register("confirm_password", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === watch("new_password") || "Passwords do not match",
                    })}
                    className={`w-full rounded-xl border ${errors.confirm_password ? "border-red-300" : "border-slate-300"} px-4 py-3 pl-12 pr-12 outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-200`}
                    placeholder="Confirm new password"
                    disabled={loading}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <FiKey className="h-5 w-5 text-slate-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirm ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                    <FiAlertCircle className="h-4 w-4" />
                    {errors.confirm_password.message}
                  </p>
                )}
              </div>

              {/* Security tips */}
              <div className="rounded-xl border border-teal-100 bg-gradient-to-r from-teal-50 to-cyan-50 p-4">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="h-5 w-5 text-teal-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-teal-800">Security Tips</h4>
                    <ul className="mt-1 space-y-1 text-xs text-teal-700">
                      <li>• Use a unique password not used elsewhere</li>
                      <li>• Include letters, numbers, and special characters</li>
                      <li>• Avoid common words or personal information</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-400 hover:shadow disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <FiLoader className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FiCheck className="h-4 w-4" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}