import {
  SigmaIcon,
  FlaskConicalIcon,
  Code2Icon,
  BrainCircuitIcon,
  BookOpenIcon,
  LandmarkIcon,
  EarthIcon,
  ScaleIcon,
  TrendingUpIcon,
  PaletteIcon,
  HeartPulseIcon,
  WrenchIcon,
  SproutIcon,
  LibraryIcon,
  type LucideIcon
} from "lucide-react";

export const CATEGORIES: Record<string, {icon: LucideIcon; name: string; color: string}> = {
  "mathematics": {
    icon: SigmaIcon,
    name: "Mathematics",
    color: "text-fuchsia-300",
  },
  "sciences": {
    icon: FlaskConicalIcon,
    name: "Sciences",
    color: "text-cyan-300",
  },
  "medicine": {
    icon: HeartPulseIcon,
    name: "Medicine & Anatomy",
    color: "text-rose-400",
  },
  "computer": {
    icon: Code2Icon,
    name: "Computer Science",
    color: "text-indigo-300",
  },
  "psychology": {
    icon: BrainCircuitIcon,
    name: "Psychology & Sociology",
    color: "text-violet-300",
  },
  "literature": {
    icon: BookOpenIcon,
    name: "Literature",
    color: "text-rose-300",
  },
  "history": {
    icon: LandmarkIcon,
    name: "History & Politics",
    color: "text-amber-200",
  },
  "geography": {
    icon: EarthIcon,
    name: "Geography",
    color: "text-teal-300",
  },
  "law": {
    icon: ScaleIcon,
    name: "Law & Legislation",
    color: "text-slate-300",
  },
  "economics": {
    icon: TrendingUpIcon,
    name: "Economics & Business",
    color: "text-emerald-400",
  },
  "arts": {
    icon: PaletteIcon,
    name: "Arts & Design",
    color: "text-pink-300",
  },
  "engineering": {
    icon: WrenchIcon,
    name: "Engineering & Robotics",
    color: "text-sky-300",
  },
  "agriculture": {
    icon: SproutIcon,
    name: "Agriculture",
    color: "text-emerald-300",
  },
  "general": {
    icon: LibraryIcon,
    name: "General",
    color: "text-zinc-300",
  }
};