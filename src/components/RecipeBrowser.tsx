"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RecipeFilters,
  EMPTY_FILTERS,
  applyFilters,
  type FilterState,
} from "@/components/RecipeFilters";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeForm } from "@/components/RecipeForm";
import type { RecipeCardData } from "@/lib/recipes/types";

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
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [showForm, setShowForm] = useState(false);

  const categories = useMemo(
    () => Array.from(new Set(recipes.flatMap((r) => r.categories))).sort(),
    [recipes],
  );

  const filtered = useMemo(() => applyFilters(recipes, filters), [recipes, filters]);
  const noResultsFromFilters = recipes.length > 0 && filtered.length === 0;

  return (
    <div className="flex flex-col gap-6">
      {showCreateButton && userId && (
        <button
          onClick={() => setShowForm(true)}
          className="self-center rounded-lg bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
        >
          + New recipe
        </button>
      )}

      <RecipeFilters filters={filters} onChange={setFilters} categories={categories} />

      {filtered.length === 0 ? (
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
            {filtered.length === recipes.length
              ? `${recipes.length} recipe${recipes.length === 1 ? "" : "s"}`
              : `Showing ${filtered.length} of ${recipes.length} recipes`}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </>
      )}

      {showForm && userId && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-3 py-6 sm:p-4 sm:py-12">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-8">
            <h2 className="mb-5 text-xl font-semibold text-gray-900">New recipe</h2>
            <RecipeForm
              userId={userId}
              onCancel={() => setShowForm(false)}
              onSaved={(id) => {
                setShowForm(false);
                router.push(`/recipes/${id}`);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
