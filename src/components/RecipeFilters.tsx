"use client";

import { MEAL_TYPES, SORT_OPTIONS, TIME_BUCKETS, type SortOption } from "@/lib/recipes/types";
import { Dropdown } from "@/components/ui/Dropdown";

export type FilterState = {
  search: string;
  mealType: string;
  category: string;
  timeBucket: string;
  country: string;
  vegetarian: boolean;
  fish: boolean;
};

export const EMPTY_FILTERS: FilterState = {
  search: "",
  mealType: "",
  category: "",
  timeBucket: "",
  country: "",
  vegetarian: false,
  fish: false,
};

export function RecipeFilters({
  filters,
  onChange,
  sort,
  onSortChange,
  categories,
  countries,
}: {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  categories: string[];
  countries: string[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        placeholder="Search by title or country..."
        className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-sky-500"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Dropdown
          value={sort}
          onChange={(v) => onSortChange(v as SortOption)}
          options={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          placeholder="Sort by"
          className="w-40 font-medium text-sky-700"
        />
        <Dropdown
          value={filters.mealType}
          onChange={(v) => onChange({ ...filters, mealType: v })}
          options={[
            { value: "", label: "All types" },
            ...MEAL_TYPES.map((type) => ({ value: type, label: type })),
          ]}
          placeholder="All types"
          className="w-36"
        />
        <Dropdown
          value={filters.category}
          onChange={(v) => onChange({ ...filters, category: v })}
          options={[
            { value: "", label: "All categories" },
            ...categories.map((category) => ({ value: category, label: category })),
          ]}
          placeholder="All categories"
          className="w-40"
        />
        <Dropdown
          value={filters.timeBucket}
          onChange={(v) => onChange({ ...filters, timeBucket: v })}
          options={[
            { value: "", label: "All times" },
            ...TIME_BUCKETS.map((bucket) => ({ value: bucket.label, label: bucket.label })),
          ]}
          placeholder="All times"
          className="w-36"
        />
        {countries.length > 0 && (
          <Dropdown
            value={filters.country}
            onChange={(v) => onChange({ ...filters, country: v })}
            options={[
              { value: "", label: "All countries" },
              ...countries.map((country) => ({ value: country, label: country })),
            ]}
            placeholder="All countries"
            className="w-36"
          />
        )}
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
    country: string | null;
  },
>(recipes: T[], filters: FilterState): T[] {
  return recipes.filter((recipe) => {
    if (filters.search) {
      const needle = filters.search.toLowerCase();
      const matchesTitle = recipe.title.toLowerCase().includes(needle);
      const matchesCountry = recipe.country?.toLowerCase().includes(needle) ?? false;
      if (!matchesTitle && !matchesCountry) {
        return false;
      }
    }
    if (filters.mealType && recipe.meal_type !== filters.mealType) {
      return false;
    }
    if (filters.category && !recipe.categories.includes(filters.category)) {
      return false;
    }
    if (filters.country && recipe.country !== filters.country) {
      return false;
    }
    if (filters.timeBucket) {
      const index = TIME_BUCKETS.findIndex((b) => b.label === filters.timeBucket);
      const bucket = TIME_BUCKETS[index];
      const prevMax = index > 0 ? TIME_BUCKETS[index - 1].max : -1;
      const time = recipe.prep_time_minutes;
      if (time == null || time <= prevMax || time > bucket.max) {
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
