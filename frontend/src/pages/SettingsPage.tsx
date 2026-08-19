import { useState } from "react";
import { UserIcon, TargetIcon, FlameIcon, AwardIcon, PencilIcon } from "lucide-react";

import { PageHeader } from "../components/PageHeader.tsx";
import AvatarModal from "../components/AvatarModal.tsx";
import { IUser } from "../utils/types.ts";

const MIN_TARGET = 10;
const MAX_TARGET = 200;

const DEFAULT_USER: IUser = {
  id: "",
  createdAt: new Date(),
  timezone: "",
  lastActive: new Date(),
  username: "Cosmin",
  target: 50,
  currentStreak: 15,
  longestStreak: 42,
  avatarId: "study-avatar",
}

export default function SettingsPage() {
  const [user, setUser] = useState<IUser | null>(DEFAULT_USER);
  const [username, setUsername] = useState(DEFAULT_USER.username);
  const [dailyTarget, setDailyTarget] = useState(DEFAULT_USER.target);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarId, setAvatarId] = useState(DEFAULT_USER.avatarId);

  const targetPercent = ((dailyTarget - MIN_TARGET) / (MAX_TARGET - MIN_TARGET)) * 100;
  const hasTargetChanged = user !== null && dailyTarget !== user.target;


  const handleSaveUsername = () => {
    // TO-DO: PATCH /api/user
  };

  const handleSaveTarget = () => {
    // TO-DO: PATCH /api/user
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Settings"
        subtitle="Manage your profile, study preferences, and daily goals."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column - Profile & Study Goals */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="flex flex-col gap-6 rounded-xl bg-white/5 p-5 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px]">
            <div className="flex flex-col gap-1 border-b border-white/10 pb-4">
              <span className="text-2xl font-bold leading-8 text-cyan-400">Profile Information</span>
              <span className="text-sm leading-5 text-neutral-300">Update your personal details.</span>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Username
              </span>
              
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg bg-white/5 px-4 py-3 text-base text-zinc-200 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-md placeholder:text-neutral-300/50 focus:outline-cyan-400/50 [color-scheme:dark]"
                placeholder="Enter your username"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveUsername}
                className="relative overflow-hidden rounded-lg bg-gradient-to-r from-cyan-400/80 to-emerald-300/80 px-6 py-2 text-xs font-semibold tracking-wide text-emerald-950 shadow-[0px_0px_15px_0px_rgba(0,220,229,0.30)] transition-opacity hover:opacity-90"
              >
                Save Changes
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-6 rounded-xl bg-white/5 p-5 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px]">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold leading-8 text-cyan-400">Study Goals</span>
                <span className="text-sm leading-5 text-neutral-300">Configure your daily learning targets.</span>
              </div>

              <TargetIcon className="size-6 shrink-0 text-emerald-400" />
            </div>

            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Daily Flashcard Target
                </span>
                
                <span className="text-base font-bold leading-6 text-emerald-300">{dailyTarget} cards</span>
              </div>

              <div className="relative flex h-2 items-center">
                <div className="absolute inset-0 rounded-full bg-white/10" />
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300 shadow-[0px_0px_10px_0px_rgba(0,245,255,0.50)]"
                  style={{ width: `${targetPercent}%` }}
                />

                <input
                  type="range"
                  min={MIN_TARGET}
                  max={MAX_TARGET}
                  step={5}
                  value={dailyTarget}
                  onChange={(e) => setDailyTarget(Number(e.target.value))}
                  className="relative z-10 h-2 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0px_0px_8px_0px_rgba(0,220,229,0.60)] [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white"
                />
              </div>

              <div className="flex items-center justify-between text-sm leading-5 text-neutral-300/60">
                <span>{MIN_TARGET}</span>
                <span>{MAX_TARGET}</span>
              </div>

              {hasTargetChanged && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleSaveTarget}
                    className="relative flex items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-cyan-400/80 to-emerald-300/80 px-6 py-2 text-xs font-semibold tracking-wide text-emerald-950 shadow-[0px_0px_15px_0px_rgba(0,220,229,0.30)] transition-opacity hover:opacity-90"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column - Learning Statistics & Avatar */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-xl bg-white/5 p-5 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px]">
            <span className="text-2xl font-bold leading-8 text-emerald-300">Learning Statistics</span>

            <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3 outline outline-1 outline-offset-[-1px] outline-white/10">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 outline outline-1 outline-offset-[-1px] outline-emerald-400/30">
                <FlameIcon className="size-4 text-emerald-400" />
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Current Streak</span>
                <span className="text-xl font-bold leading-7 text-zinc-200">{user.currentStreak} Days</span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3 outline outline-1 outline-offset-[-1px] outline-white/10">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 outline outline-1 outline-offset-[-1px] outline-emerald-400/30">
                <AwardIcon className="size-4 text-emerald-400" />
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Longest Streak</span>
                <span className="text-xl font-bold leading-7 text-zinc-200">{user.longestStreak} Days</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-xl bg-white/5 p-5 outline outline-1 outline-offset-[-1px] outline-white/10 backdrop-blur-[10px]">
            <span className="self-start text-2xl font-bold leading-8 text-cyan-400">Profile Picture</span>

            <div className="flex size-24 items-center justify-center overflow-hidden rounded-full bg-white/5 shadow-[0px_0px_20px_0px_rgba(0,220,229,0.20)] outline outline-2 outline-offset-[-2px] outline-cyan-400/50">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile avatar" className="size-full object-cover" />
              ) : (
                <UserIcon className="size-10 text-neutral-400" />
              )}
            </div>

            <button
              onClick={() => setIsAvatarModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-white/5 px-6 py-2 text-xs font-semibold tracking-wide text-zinc-200 outline outline-1 outline-offset-[-1px] outline-white/20 backdrop-blur-[6px] transition-colors hover:bg-white/10"
            >
              <PencilIcon className="size-3" />
              Change Avatar
            </button>
          </div>
        </div>
      </div>

      <AvatarModal
        isOpen={isAvatarModalOpen}
        currentAvatarId={avatarId}
        onClose={() => setIsAvatarModalOpen(false)}
        onSave={(id) => setAvatarId(id)}
      />
    </div>
  );
}