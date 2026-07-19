import { NavLink } from "react-router-dom";
import { Settings, LifeBuoy, X, LayoutDashboard, Library, Layers, Bot } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Knowledge Library", path: "/library", icon: Library },
  { label: "Flashcards", path: "/flashcards", icon: Layers },
  { label: "AI Tutor", path: "/tutor", icon: Bot },
];

type SidebarProps = {
  /** Only used by the mobile drawer variant — desktop rail ignores it. */
  onNavigate?: () => void;
  onClose?: () => void;
  variant?: "desktop" | "mobile";
};

const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
  [
    "flex items-center gap-4 rounded-lg px-4 py-3 text-base transition-colors",
    isActive
      ? "bg-white/10 text-cyan-400 shadow-[0px_0px_10px_0px_rgba(0,220,229,0.20)]"
      : "text-neutral-300 hover:bg-white/5 hover:text-zinc-200",
  ].join(" ");

export function Sidebar({ onNavigate, onClose, variant = "desktop" }: SidebarProps) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex flex-col gap-4 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              className="size-10 rounded-full border border-cyan-400/30"
              src="https://placehold.co/40x40"
              alt=""
            />
            <span className="text-xl font-extrabold leading-6 text-cyan-400">
              Study Agent
            </span>
          </div>
          {variant === "mobile" && (
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-300"
              aria-label="Close menu"
            >
              <X className="size-5" />
            </button>
          )}
        </div>
        <div className="flex flex-col border-l-2 border-cyan-400 px-2">
          <span className="text-sm leading-5 text-cyan-400/80">
            Active Session: Neural Networks
          </span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2" aria-label="Primary">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            onClick={onNavigate}
            className={navLinkClasses}
          >
            <Icon className="size-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
        <button
          type="button"
          className="flex items-center gap-4 rounded-lg px-4 py-2 text-left text-sm text-neutral-300 hover:text-zinc-200"
        >
          <Settings className="size-4" />
          Settings
        </button>
        <button
          type="button"
          className="flex items-center gap-4 rounded-lg px-4 py-2 text-left text-sm text-neutral-300 hover:text-zinc-200"
        >
          <LifeBuoy className="size-4" />
          Support
        </button>
      </div>
    </div>
  );
}