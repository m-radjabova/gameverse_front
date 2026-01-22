import { useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import useContextPro from "../../hooks/useContextPro";

function HelloAdmin() {
  const {
    state: { user },
  } = useContextPro();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-md border border-slate-200 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {user?.username || "Admin"} 👋
          </h1>

          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700 transition"
          >
            <FaHome />
            Home
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-slate-200" />

        {/* Info */}
        <div className="space-y-3">
          {user?.email && (
            <p className="flex items-center gap-2 text-slate-600">
              <svg
                className="h-5 w-5 text-slate-500"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M22 6L12 13L2 6"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
              {user.email}
            </p>
          )}

          <p className="text-slate-700">
            You are logged in as an <span className="font-semibold">Administrator</span>.
          </p>

          <p className="text-slate-500">
            Ready to manage the system and keep everything running smoothly 🚀
          </p>
        </div>
      </div>
    </div>
  );
}

export default HelloAdmin;
