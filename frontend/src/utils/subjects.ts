import {
  Sigma,
  FlaskConical,
  Code2,
  BrainCircuit,
  BookOpen,
  Landmark,
  Earth,
  Scale,
  TrendingUp,
  Palette,
  HeartPulse,
  Wrench,
  Sprout,
  Library,
  type LucideIcon
} from "lucide-react";

export const CATEGORIES: Record<string, {icon: LucideIcon; name: string; color: string}> = {
  "mathematics": {
    icon: Sigma,
    name: "Mathematics",
    color: "text-fuchsia-300",
  },
  "sciences": {
    icon: FlaskConical,
    name: "Sciences",
    color: "text-cyan-300",
  },
  "medicine": {
    icon: HeartPulse,
    name: "Medicine & Anatomy",
    color: "text-rose-400",
  },
  "computer": {
    icon: Code2,
    name: "Computer Science",
    color: "text-indigo-300",
  },
  "psychology": {
    icon: BrainCircuit,
    name: "Psychology & Sociology",
    color: "text-violet-300",
  },
  "literature": {
    icon: BookOpen,
    name: "Literature",
    color: "text-rose-300",
  },
  "history": {
    icon: Landmark,
    name: "History & Politics",
    color: "text-amber-200",
  },
  "geography": {
    icon: Earth,
    name: "Geography",
    color: "text-teal-300",
  },
  "law": {
    icon: Scale,
    name: "Law & Legislation",
    color: "text-slate-300",
  },
  "economics": {
    icon: TrendingUp,
    name: "Economics & Business",
    color: "text-emerald-400",
  },
  "arts": {
    icon: Palette,
    name: "Arts & Design",
    color: "text-pink-300",
  },
  "engineering": {
    icon: Wrench,
    name: "Engineering & Robotics",
    color: "text-sky-300",
  },
  "agriculture": {
    icon: Sprout,
    name: "Agriculture",
    color: "text-emerald-300",
  },
  "general": {
    icon: Library,
    name: "General",
    color: "text-zinc-300",
  }
};