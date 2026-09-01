import { IFilterSection } from "./types.ts";
import { CATEGORIES } from "./subjects.ts";

export const DOCUMENTS_FILTER_SECTIONS: IFilterSection[] = [
  {
    id: "category",
    title: "Category",
    type: "multi",
    options: Object.entries(CATEGORIES).map(([key, val]) => (
      {value: key, label: val.name, icon: val.icon}
    )),
  },
  {
    id: "sort",
    title: "Sort by",
    type: "single",
    options: [
      {value: "recent", label: "Recently uploaded"},
      {value: "pages-least", label: "Least pages"},
      {value: "title-az", label: "Title A-Z"},
    ],
  },
];

export const DECK_FILTER_SECTIONS: IFilterSection[] = [
  {
    id: "difficulty",
    title: "Difficulty",
    type: "multi",
    options: [
      {value: "easy", label: "Easy"},
      {value: "medium", label: "Medium"},
      {value: "hard", label: "Hard"},
    ],
  },
  {
    id: "category",
    title: "Category",
    type: "multi",
    options: Object.entries(CATEGORIES).map(([key, val]) => (
      {value: key, label: val.name, icon: val.icon}
    )),
  },
  {
    id: "sort",
    title: "Sort by",
    type: "single",
    options: [
      {value: "recent", label: "Recently studied"},
      {value: "due-least", label: "Least due"},
      {value: "title-az", label: "Title A-Z"},
    ],
  },
];