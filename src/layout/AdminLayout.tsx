import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { BellDot, Flower2, Sparkles, Heart } from "lucide-react";
import { FaUserShield } from "react-icons/fa";
import AdminSidebar from "../pages/admin/AdminSidebar";
import useContextPro from "../hooks/useContextPro";

const titles: Record<string, { title: string; subtitle: string }> = {
  "/admin": {
    title: "Hello Admin",
    subtitle: "Boshqaruv panel",
  },
  "/admin/dashboard": {
    title: "Dashboard",
    subtitle: "Statistika",
  },
  "/admin/users": {
    title: "Users",
    subtitle: "Users",
  },
  "/admin/feedbacks": {
    title: "Feedbacks",
    subtitle: "Feedbacks",
  },
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 opacity-30 animate-float-slow">
            <Flower2 className="h-32 w-32 text-pink-300" strokeWidth={1} />
          </div>
          <div className="absolute bottom-20 right-10 opacity-25 animate-float-delay">
            <Heart className="h-28 w-28 text-rose-300" fill="currentColor" />
          </div>
          <div className="absolute top-1/3 right-1/4 opacity-20 animate-pulse-slow">
            <Sparkles className="h-20 w-20 text-pink-400" />
          </div>
          <div className="absolute bottom-1/3 left-1/4 opacity-15 animate-float-slower">
            <Flower2 className="h-24 w-24 text-amber-300" strokeWidth={1} />
          </div>
        </div>
        
        {/* Falling Petals */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-fall"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${6 + Math.random() * 6}s`,
              opacity: 0.1 + Math.random() * 0.3,
            }}
          >
            <Flower2 className="h-4 w-4 text-pink-400" strokeWidth={1.5} />
          </div>
        ))}
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1800px]">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-pink-200/30 bg-white/40 backdrop-blur-xl shadow-sm">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-pink-200/60 bg-white/60 text-rose-600 transition-all hover:bg-white/80 hover:shadow-md lg:hidden"
                  >
                    <FaUserShield className="h-5 w-5" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-rose-700 via-pink-700 to-amber-700 bg-clip-text text-transparent sm:text-3xl">
                        {pageMeta.title}
                      </h1>
                      {pageMeta.title === "Hello Admin" && (
                        <div className="animate-bounce-slow">
                          <Heart className="h-5 w-5 text-pink-400" fill="currentColor" />
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-rose-600/70">
                      {pageMeta.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="group relative flex items-center gap-3 rounded-xl border border-pink-200/60 bg-white/60 px-4 py-3 shadow-sm transition-all hover:shadow-md hover:bg-white/80">
                    {/* Decorative Flower */}
                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Flower2 className="h-4 w-4 text-pink-400" />
                    </div>
                    
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-pink-400 via-rose-400 to-amber-400 shadow-md">
                      <BellDot className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-rose-800">
                        {user?.username || "Admin"}
                      </p>
                      <p className="truncate text-xs text-rose-500/70 flex items-center gap-1">
                        <Heart className="h-3 w-3" fill="currentColor" />
                        {user?.email || "admin@sakura.com"}
                      </p>
                    </div>
                    
                    {/* Hover Effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-200/0 via-pink-200/20 to-rose-200/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 m-5">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}