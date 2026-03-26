import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  MessageSquareMore,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";
import useContextPro from "../../hooks/useContextPro";

type AdminSidebarProps = {
  open: boolean;
  onClose: () => void;
};

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", hint: "System overview", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", hint: "Accounts and access", icon: UsersRound },
  { to: "/admin/feedbacks", label: "Feedbacks", hint: "Review moderation", icon: MessageSquareMore },
];

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const { dispatch } = useContextPro();

  const navigate = useNavigate();

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/70 backdrop-blur-sm transition lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[320px] max-w-[88vw] flex-col border-r border-white/10 bg-[#0a0a0a] px-5 py-6 shadow-[0_20px_80px_rgba(0,0,0,0.6)] transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white text-black">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">Workspace</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white">Admin Panel</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-3">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-2xl px-4 py-3 transition ${
                      isActive
                        ? "bg-white text-black shadow-[0_16px_30px_rgba(255,255,255,0.1)]"
                        : "border border-transparent text-white/72 hover:border-white/10 hover:bg-white/[0.05] hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                            isActive ? "bg-black text-white" : "bg-white/5 text-white/70"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${isActive ? "text-black" : "text-white"}`}>
                            {item.label}
                          </p>
                          <p className={`text-xs ${isActive ? "text-black/55" : "text-white/38"}`}>
                            {item.hint}
                          </p>
                        </div>
                      </div>

                      <div className={`h-2 w-2 rounded-full ${isActive ? "bg-black" : "bg-white/10"}`} />
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto pt-6">
          <button
            type="button"
            onClick={() => dispatch({ type: "LOGOUT" })}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white px-4 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            <LogOut className="h-4 w-4" />
            Chiqish
          </button>
        </div>
      </aside>
    </>
  );
}
