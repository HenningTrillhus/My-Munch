"use client";

import { MEAL_TYPES, TIME_BUCKETS } from "@/lib/recipes/types";

export type FilterState = {
  search: string;
  mealType: string;
  category: string;
  timeBucket: string;
  vegetarian: boolean;
  fish: boolean;
};

export const EMPTY_FILTERS: FilterState = {
  search: "",
  mealType: "",
  category: "",
  timeBucket: "",
  vegetarian: false,
  fish: false,
};

const selectClasses =
  "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-sky-500";

export function RecipeFilters({
  filters,
  onChange,
  categories,
}: {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  categories: string[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        placeholder="Search for a recipe..."
        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-sky-500"
      />
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filters.mealType}
          onChange={(e) => onChange({ ...filters, mealType: e.target.value })}
          className={selectClasses}
        >
          <option value="">All types</option>
          {MEAL_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          className={selectClasses}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          value={filters.timeBucket}
          onChange={(e) => onChange({ ...filters, timeBucket: e.target.value })}
          className={selectClasses}
        >
          <option value="">All times</option>
          {TIME_BUCKETS.map((bucket) => (
            <option key={bucket.label} value={bucket.label}>
              {bucket.label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={filters.vegetarian}
            onChange={(e) => onChange({ ...filters, vegetarian: e.target.checked })}
            className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
          />
          Vegetarian
        </label>
        <label className="flex items-center gap-1.5 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={filters.fish}
            onChange={(e) => onChange({ ...filters, fish: e.target.checked })}
            className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
          />
          Fish
        </label>
      </div>
    </div>
  );
}

export function applyFilters<
  T extends {
    title: string;
    meal_type: string | null;
    categories: string[];
    prep_time_minutes: number | null;
    is_vegetarian: boolean;
    is_fish: boolean;
  },
>(recipes: T[], filters: FilterState): T[] {
  return recipes.filter((recipe) => {
    if (
      filters.search &&
      !recipe.title.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    if (filters.mealType && recipe.meal_type !== filters.mealType) {
      return false;
    }
    if (filters.category && !recipe.categories.includes(filters.category)) {
      return false;
    }
    if (filters.timeBucket) {
      const bucket = TIME_BUCKETS.find((b) => b.label === filters.timeBucket);
      const prevMax =
        TIME_BUCKETS[TIME_BUCKETS.indexOf(bucket!) - 1]?.max ?? 0;
      const time = recipe.prep_time_minutes;
      if (time == null || time <= prevMax || time > bucket!.max) {
        return false;
      }
    }
    if (filters.vegetarian && !recipe.is_vegetarian) {
      return false;
    }
    if (filters.fish && !recipe.is_fish) {
      return false;
    }
    return true;
  });
}
