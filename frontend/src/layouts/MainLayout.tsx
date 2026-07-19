import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sidebar } from "../components/Sidebar";

export function MainLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-neutral-900">
      {/* Background gradients (liquid-glass effect base) */}
      <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-cyan-400/20 blur-[100px] sm:size-[500px] lg:size-[800px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 size-64 rounded-full bg-emerald-400/20 blur-[100px] sm:size-[400px] lg:size-[600px]" />

      <div className="relative flex min-h-screen w-full">
        {/* Persistent sidebar — desktop */}
        <aside className="fixed inset-y-4 left-4 z-20 hidden w-64 rounded-xl bg-white/5 p-5 shadow-[0px_0px_20px_0px_rgba(0,220,229,0.10)] outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[20px] lg:block">
          <Sidebar variant="desktop" />
        </aside>

        {/* Persistent sidebar — mobile drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-30 flex lg:hidden">
            <div
              className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm"
              onClick={() => setMobileNavOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-40 h-full w-64 bg-neutral-900 p-5 outline outline-1 outline-offset-[-1px] outline-white/10">
              <Sidebar
                variant="mobile"
                onClose={() => setMobileNavOpen(false)}
                onNavigate={() => setMobileNavOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Dynamic page content */}
        <div className="flex w-full flex-1 flex-col lg:pl-[19rem]">
          {/* Mobile top bar — gives the drawer somewhere to open from */}
          <div className="flex items-center gap-3 px-4 pt-4 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="rounded-lg bg-white/5 p-2 text-neutral-300 outline outline-1 outline-offset-[-1px] outline-white/10"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <span className="text-sm font-semibold text-cyan-400">Study Agent</span>
          </div>

          <main className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}