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
import ChangePasswordModal from "./ChangePasswordModal";

import {HiOutlineUserCircle, HiOutlinePhotograph} from "react-icons/hi"

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
  FiLoader
} from "react-icons/fi";
import { 
  MdOutlineBadge
} from "react-icons/md";

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

      setSuccess("Profile updated successfully!");
    } catch (err: any) {
      setError(err?.message ?? "Failed to update profile.");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB");
      return;
    }

    setSuccess("");
    setError("");
    setIsUploadingAvatar(true);

    try {
      await uploadAvatar.mutateAsync(file);
      setSuccess("Avatar updated successfully!");
    } catch (err: any) {
      setError(err?.message ?? "Failed to upload avatar.");
    } finally {
      e.target.value = "";
      setIsUploadingAvatar(false);
    }
  };

  if (meQuery.isLoading) {
    return (
      <section className="min-h-[calc(100vh-10rem)] bg-gradient-to-br from-teal-50 via-white to-cyan-50 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 mb-4">
                <FiLoader className="w-8 h-8 text-white animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Loading your profile</h3>
              <p className="text-slate-500">Please wait a moment...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

   if (meQuery.isError || !user) {
    return (
      <section className="min-h-[calc(100vh-10rem)] bg-gradient-to-br from-teal-50 via-white to-cyan-50 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-red-100 to-pink-100 text-red-500 mb-4">
                <FiAlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Authentication Required</h2>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Please sign in to view and edit your profile information.
              </p>
              <button 
                onClick={() => window.location.href = '/login'}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                <HiOutlineUserCircle className="w-5 h-5" />
                Go to Sign In
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[calc(100vh-20rem)] bg-gradient-to-br from-teal-50 via-white to-cyan-50 py-10">
      <div className="mx-auto max-w-8xl px-4">
        <div className="mb-10">
  <div className="inline-flex flex-col">
    <div className="flex items-baseline gap-3">
      <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
        Profile Settings
      </h1>
      <span className="text-xs font-semibold px-2 py-1 bg-teal-100 text-teal-700 rounded-full">
        PERSONAL
      </span>
    </div>
    
    <div className="mt-4 relative">
      <p className="text-slate-600 text-lg pl-10 relative z-10">
        Update your personal information and account preferences
      </p>
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-0.5 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full" />
    </div>
  </div>
</div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chap panel - Profil ma'lumotlari */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-teal-100 bg-white p-6 shadow-lg overflow-hidden">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 h-20 rounded-t-2xl -mx-6 -mt-16"></div>
                
                <div className="relative flex flex-col items-center text-center mt-10">
                  <div className="relative">
                    <img
                      src={avatarSrc || "https://placehold.co/140x140/e0f2fe/0f766e?text=User"}
                      alt={user.username || "User"}
                      className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-lg"
                    />
                    
                    <label className="absolute bottom-2 right-2 cursor-pointer">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg transition-transform hover:scale-110">
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

                  <h1 className="mt-6 text-2xl font-bold text-slate-800">
                    {user.username || "Unnamed User"}
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <FiMail className="w-4 h-4 text-slate-500" />
                    <p className="text-slate-600">{user.email}</p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-teal-700 border border-teal-100">
                      <MdOutlineBadge className="w-3.5 h-3.5" />
                      {(user.roles && user.roles.length ? user.roles.join(", ") : "user")}
                    </span>
                  </div>

                  <div className="mt-8 w-full space-y-3">
                    <button
                      type="button"
                      onClick={() => setPasswordOpen(true)}
                      className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow"
                    >
                      <FiLock className="w-4 h-4" />
                      Change Password
                    </button>
                    
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 hover:shadow"
                    >
                      <FiShield className="w-4 h-4" />
                      Privacy Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Statistika kartasi */}
            <div className="mt-6 rounded-2xl border border-teal-100 bg-white p-6 shadow-lg">
              <h3 className="font-semibold text-slate-800 mb-4">Account Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Member since</span>
                  <span className="text-sm font-medium text-slate-800">
                    {new Date(user.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Status</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <FiCheckCircle className="w-3 h-3" />
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* O'ng panel - Sozlash formasi */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Edit Profile</h2>
                  <p className="text-slate-500 mt-1">
                    Update your personal information and email address
                  </p>
                </div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-600">
                  <FiEdit2 className="w-6 h-6" />
                </div>
              </div>

              <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
                {/* Username input */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <FiUser className="w-4 h-4" />
                    Username
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      {...register("username", {
                        required: "Username is required",
                        minLength: {
                          value: 3,
                          message: "Username must be at least 3 characters"
                        }
                      })}
                      className={`w-full rounded-xl border ${errors.username ? 'border-red-300' : 'border-slate-300'} px-4 py-3 pl-12 outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-200`}
                      placeholder="Enter your username"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <HiOutlineUserCircle className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                  {errors.username && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                      <FiAlertCircle className="w-4 h-4" />
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* Email input */}
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <FiMail className="w-4 h-4" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address"
                        }
                      })}
                      className={`w-full rounded-xl border ${errors.email ? 'border-red-300' : 'border-slate-300'} px-4 py-3 pl-12 outline-none transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-200`}
                      placeholder="Enter your email address"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      <FiMail className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                  {errors.email && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                      <FiAlertCircle className="w-4 h-4" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Xabar va xatoliklarni ko'rsatish */}
                {success && (
                  <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-4">
                    <div className="flex items-start gap-3">
                      <FiCheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-emerald-800">Success!</p>
                        <p className="text-sm text-emerald-700">{success}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-4">
                    <div className="flex items-start gap-3">
                      <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">Something went wrong</p>
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Saqlash tugmasi */}
                <div className="pt-4 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={updateMe.isPending || !isDirty}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {updateMe.isPending ? (
                      <>
                        <FiLoader className="w-4 h-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <FiSave className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                  
                  {!isDirty && (
                    <p className="mt-3 text-sm text-slate-500">
                      No changes made to save
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Avatar upload qo'shimcha paneli */}
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Avatar Settings</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex items-center gap-3 mb-3">
                    <HiOutlinePhotograph className="w-5 h-5 text-teal-600" />
                    <h4 className="font-medium text-slate-800">Upload Requirements</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5"></div>
                      <span>Maximum file size: 5MB</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5"></div>
                      <span>Recommended: Square image</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5"></div>
                      <span>Formats: JPG, PNG, WebP</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 rounded-xl border border-slate-200 bg-gradient-to-r from-teal-50 to-cyan-50">
                  <div className="flex items-center gap-3 mb-3">
                    <FiUpload className="w-5 h-5 text-teal-600" />
                    <h4 className="font-medium text-slate-800">Quick Upload</h4>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    Click the camera icon on your avatar to quickly change your profile picture.
                  </p>
                  <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg hover:scale-[1.02]">
                    <FiUpload className="w-4 h-4" />
                    Choose Image
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
            setSuccess("Password updated successfully!");
            setPasswordOpen(false);
          } catch (err: any) {
            setError(err?.message ?? "Failed to change password.");
          }
        }}
      />
    </section>
  );
}

export default Profile;