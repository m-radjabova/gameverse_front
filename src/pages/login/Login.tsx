import { useEffect, useState } from "react";
import { FaEyeSlash } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import imgLogin from "../../assets/loginImg.svg";
import imgRegister from "../../assets/registerImg.svg";
import { useLocation, useNavigate } from "react-router-dom";

function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    if (location.pathname === "/register") {
      setActiveTab("register");
    } else {
      setActiveTab("login");
    }
  }, [location.pathname]);

  const [showPassword, setShowPassword] = useState(false);

  const isLogin = activeTab === "login";

  return (
    <div className="min-h-screen bg-slate-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="grid lg:grid-cols-2">
          {/* LEFT IMAGE */}
          <div className="relative hidden lg:block">
            <img
              src={isLogin ? imgLogin : imgRegister}
              alt="auth"
              className="h-full w-full object-cover"
            />

            <div className="absolute bottom-10 left-10 text-white">
              <h2 className="text-4xl font-extrabold drop-shadow">
                Lorem Ipsum is simply
              </h2>
              <p className="mt-2 text-lg text-white/80 drop-shadow">
                Lorem ipsum is simply
              </p>
            </div>

            <div className="absolute inset-0 bg-black/10" />
          </div>

          {/* RIGHT FORM */}
          <div className="flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md">
              <p className="text-center text-sm text-slate-600">
                Welcome to lorem..!
              </p>

              {/* Tabs */}
              <div className="mx-auto mt-5 flex w-full rounded-full bg-teal-200/70 p-1">
                <button
                  onClick={() => navigate("/login")}
                  className={`w-1/2 rounded-full py-2 text-sm font-semibold transition ${
                    activeTab === "login"
                      ? "bg-teal-500 text-white shadow"
                      : "text-slate-700"
                  }`}
                >
                  Login
                </button>

                <button
                  onClick={() => navigate("/register")}
                  className={`w-1/2 rounded-full py-2 text-sm font-semibold transition ${
                    activeTab === "register"
                      ? "bg-teal-500 text-white shadow"
                      : "text-slate-700"
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Description */}
              <p className="mt-6 text-sm leading-6 text-slate-500">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </p>

              {/* FORMS */}
              {isLogin ? (
                <LoginForm
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                />
              ) : (
                <RegisterForm />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginForm({
  showPassword,
  setShowPassword,
}: {
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
}) {
  return (
    <form className="mt-8 space-y-5">
      <div>
        <label className="text-sm font-medium text-slate-700">User name</label>
        <input
          type="text"
          placeholder="Enter your User name"
          className="mt-2 w-full rounded-full border border-teal-300 px-5 py-3 text-sm outline-none focus:border-teal-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Password</label>
        <div className="relative mt-2">
          <input
            type="password"
            placeholder="Enter your Password"
            className="w-full rounded-full border border-teal-300 px-5 py-3 pr-12 text-sm outline-none focus:border-teal-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="accent-teal-500" />
          Remember me
        </label>
        <button type="button" className="hover:text-teal-600">
          Forgot Password ?
        </button>
      </div>

      <button className="mt-2 w-full rounded-full bg-teal-500 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 active:scale-[0.99]">
        Login
      </button>
    </form>
  );
}

function RegisterForm() {
  return (
    <form className="mt-8 space-y-5">
      <div>
        <label className="text-sm font-medium text-slate-700">
          Email Address
        </label>
        <input
          type="email"
          placeholder="Enter your Email Address"
          className="mt-2 w-full rounded-full border border-teal-300 px-5 py-3 text-sm outline-none focus:border-teal-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">User name</label>
        <input
          type="text"
          placeholder="Enter your User name"
          className="mt-2 w-full rounded-full border border-teal-300 px-5 py-3 text-sm outline-none focus:border-teal-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Password</label>
        <div className="relative mt-2">
          <input
            type="password"
            placeholder="Enter your Password"
            className="w-full rounded-full border border-teal-300 px-5 py-3 pr-12 text-sm outline-none focus:border-teal-500"
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          >
            <FaEyeSlash />
          </button>
        </div>
      </div>

      <button className="mt-2 w-full rounded-full bg-teal-500 py-3 text-sm font-semibold text-white transition hover:bg-teal-600 active:scale-[0.99]">
        Register
      </button>
    </form>
  );
}

export default AuthPage;
