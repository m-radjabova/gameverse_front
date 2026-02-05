import { useEffect, useState } from "react";
import LoginForm from "./Login";
import RegisterForm from "./Register";
import { useLocation, useNavigate } from "react-router-dom";

import imgLogin from "../../assets/loginImg.svg"
import imgRegister from "../../assets/registerImg.svg"

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

export default AuthPage;