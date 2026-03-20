import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#312e81_0%,#111827_45%,#020617_100%)]">
      <Outlet />
    </div>
  );
}
