import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { BellDot, Menu, ShieldCheck } from "lucide-react";
import AdminSidebar from "../pages/admin/AdminSidebar";
import useContextPro from "../hooks/useContextPro";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Control Room", subtitle: "Admin overview" },
  "/admin/dashboard": { title: "Dashboard", subtitle: "System status and shortcuts" },
  "/admin/users": { title: "Users", subtitle: "Manage accounts and roles" },
  "/admin/feedbacks": { title: "Feedbacks", subtitle: "Moderate incoming reviews" },
};

export default function AdminLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    state: { user },
  } = useContextPro();

  const pageMeta = useMemo(
    () => titles[location.pathname] ?? titles["/admin"],
    [location.pathname],
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.05),transparent_24%)]" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1800px]">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-black/70 backdrop-blur-xl">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 lg:hidden"
                  >
                    <Menu className="h-5 w-5" />
                  </button>

                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Admin panel
                    </div>
                    <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                      {pageMeta.title}
                    </h1>
                    <p className="mt-1 text-sm text-white/45">{pageMeta.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <BellDot className="h-5 w-5 text-white/70" />
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white px-4 py-3 text-black shadow-[0_20px_60px_rgba(255,255,255,0.08)]">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{user?.username || "Admin"}</p>
                      <p className="truncate text-xs text-black/55">{user?.email || "admin@example.com"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
