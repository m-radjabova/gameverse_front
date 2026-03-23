import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquareMore,
  PanelLeftClose,
  ShieldCheck,
  UsersRound,
  X,
  Flower2,
  Heart,
  Wind,
} from "lucide-react";
import { FaArrowRightFromBracket } from "react-icons/fa6";
import useContextPro from "../../hooks/useContextPro";

type AdminSidebarProps = {
  open: boolean;
  onClose: () => void;
};

const navItems = [
  {
    to: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    hint: "Dashboard",
    gradient: "from-pink-400 to-rose-400",
  },
  {
    to: "/admin/users",
    label: "Users",
    icon: UsersRound,
    hint: "Users",
    gradient: "from-amber-400 to-pink-400",
  },
  {
    to: "/admin/feedbacks",
    label: "Feedbacks",
    icon: MessageSquareMore,
    hint: "Feedbacks",
    gradient: "from-rose-400 to-pink-400",
  },
];

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const {
    dispatch,
  } = useContextPro();

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-rose-950/40 backdrop-blur-sm transition lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[310px] max-w-[88vw] flex-col bg-gradient-to-b from-rose-50 via-pink-50 to-amber-50 px-5 py-6 shadow-2xl transition-transform duration-500 lg:static lg:w-[320px] lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Decorative Flowers */}
        <div className="absolute top-8 right-4 opacity-20 pointer-events-none">
          <Flower2 className="h-12 w-12 text-pink-400" strokeWidth={1.5} />
        </div>
        <div className="absolute bottom-20 left-2 opacity-15 pointer-events-none">
          <Heart className="h-10 w-10 text-rose-400" fill="currentColor" />
        </div>
        
        {/* Header */}
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-pink-300 to-rose-300 rounded-2xl blur-md opacity-50" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 via-rose-400 to-amber-400 text-white shadow-lg">
                <ShieldCheck className="h-7 w-7" />
              </div>
            </div>
            <div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight bg-gradient-to-r from-rose-700 to-pink-700 bg-clip-text text-transparent">
                Admin Panel
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-pink-200 bg-white/60 text-rose-600 transition-all hover:bg-white/80 hover:shadow-md lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="relative mt-8 space-y-2.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-pink-100/80 to-rose-100/80 shadow-md border border-pink-200/50"
                      : "hover:bg-white/60 border border-transparent hover:border-pink-100"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-br from-pink-400 to-rose-400 text-white shadow-md"
                            : "bg-white/60 text-rose-500 group-hover:bg-pink-100/80"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold tracking-wide ${
                          isActive ? "text-rose-800" : "text-rose-700/80"
                        }`}>
                          {item.label}
                        </p>
                        <p className={`mt-0.5 text-xs ${
                          isActive ? "text-rose-600/70" : "text-rose-500/60"
                        }`}>
                          {item.hint}
                        </p>
                      </div>
                    </div>

                    {isActive && (
                      <div className="flex items-center gap-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-pink-400" />
                        <PanelLeftClose
                          className={`h-3.5 w-3.5 transition ${
                            isActive ? "text-rose-500" : "text-rose-300"
                          }`}
                        />
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Decorative Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-pink-200/50" />
          </div>
          <div className="relative flex justify-center">
            <Wind className="h-4 w-4 text-pink-300 bg-gradient-to-b from-rose-50 via-pink-50 to-amber-50 px-2" />
          </div>
        </div>

        {/* Footer / Logout */}
        <div className="relative mt-auto space-y-4 pt-2">
          <button
            type="button"
            onClick={() => dispatch({ type: "LOGOUT" })}
            className="group relative inline-flex w-full items-center justify-center gap-3 rounded-xl border border-pink-200/60 bg-white/60 px-4 py-3.5 text-sm font-semibold text-rose-700 transition-all duration-300 hover:bg-white/80 hover:shadow-md hover:border-pink-300"
          >
            <FaArrowRightFromBracket className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            <span>Chiqish</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-200/0 via-pink-200/20 to-rose-200/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        {/* Decorative Bottom Element */}
        <div className="absolute bottom-6 right-6 opacity-10 pointer-events-none">
          <Flower2 className="h-16 w-16 text-pink-400" strokeWidth={1} />
        </div>
      </aside>
    </>
  );
}