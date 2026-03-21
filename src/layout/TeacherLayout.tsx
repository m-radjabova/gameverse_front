import { FaArrowLeft } from "react-icons/fa";
import { Outlet, useNavigate } from "react-router-dom";

export default function TeacherLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen ">
      <div className="sticky top-0 z-40 border-b border-white/10 bg-[#12081f]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
                return;
              }
              navigate("/");
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-black text-white transition hover:bg-white/10"
          >
            <FaArrowLeft />
            Orqaga
          </button>

          <div className="text-right">
            <div className="text-xs font-bold uppercase tracking-[0.24em] text-white/45">O'qituvchi Paneli</div>
            <div className="text-sm font-black text-[#ffe24d]">Savollar boshqaruvi</div>
          </div>
        </div>
      </div>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
