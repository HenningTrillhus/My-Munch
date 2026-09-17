"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  RecipeFilters,
  EMPTY_FILTERS,
  applyFilters,
  type FilterState,
} from "@/components/RecipeFilters";
import { RecipeCard } from "@/components/RecipeCard";
import {
  sortRecipes,
  type RecipeCardData,
  type SortOption,
} from "@/lib/recipes/types";

// 21 divides evenly into full rows at both grid widths used
// (2 columns on phones, 3 columns from lg up), so the last page of
// a full set doesn't end with an awkward half-empty row.
const PAGE_SIZE = 21;

export function RecipeBrowser({
  recipes,
  userId,
  showCreateButton,
  emptyMessage,
}: {
  recipes: RecipeCardData[];
  userId?: string;
  showCreateButton: boolean;
  emptyMessage: string;
}) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortOption>("most_reviews");
  const [page, setPage] = useState(1);

  const categories = useMemo(
    () => Array.from(new Set(recipes.flatMap((r) => r.categories))).sort(),
    [recipes],
  );
  const countries = useMemo(
    () =>
      Array.from(
        new Set(recipes.map((r) => r.country).filter((c): c is string => !!c)),
      ).sort(),
    [recipes],
  );

  const filtered = useMemo(() => applyFilters(recipes, filters), [recipes, filters]);
  const sorted = useMemo(() => sortRecipes(filtered, sort), [filtered, sort]);
  const noResultsFromFilters = recipes.length > 0 && sorted.length === 0;

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(pageStart, pageStart + PAGE_SIZE);

  const handleFiltersChange = (next: FilterState) => {
    setFilters(next);
    setPage(1);
  };
  const handleSortChange = (next: SortOption) => {
    setSort(next);
    setPage(1);
  };
  const handleRefresh = () => startRefresh(() => router.refresh());

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {showCreateButton && userId && (
          <Link
            href="/recipes/new"
            className="rounded-lg bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
          >
            + New recipe
          </Link>
        )}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
        >
          <span className={isRefreshing ? "inline-block animate-spin" : "inline-block"}>
            ⟳
          </span>
          Refresh
        </button>
      </div>

      <RecipeFilters
        filters={filters}
        onChange={handleFiltersChange}
        sort={sort}
        onSortChange={handleSortChange}
        categories={categories}
        countries={countries}
      />

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <span className="text-3xl">{noResultsFromFilters ? "🔍" : "🍳"}</span>
          <p className="text-sm text-gray-500">
            {noResultsFromFilters
              ? "No recipes match your filters."
              : emptyMessage}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {sorted.length === recipes.length
              ? `${recipes.length} recipe${recipes.length === 1 ? "" : "s"}`
              : `Showing ${sorted.length} of ${recipes.length} recipes`}
            {totalPages > 1 &&
              ` — page ${currentPage} of ${totalPages}`}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {pageItems.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
