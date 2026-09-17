"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { RecipeForm } from "@/components/RecipeForm";
import { RecipeComments } from "@/components/RecipeComments";
import { ratingSummary, type Recipe } from "@/lib/recipes/types";

export function RecipeDetail({
  recipe: initialRecipe,
  isOwner,
  userId,
}: {
  recipe: Recipe;
  isOwner: boolean;
  userId: string;
}) {
  const router = useRouter();
  const [recipe, setRecipe] = useState(initialRecipe);
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(initialRecipe.notes ?? "");
  const [notesStatus, setNotesStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );

  // initialRecipe is a fresh object every time the server re-sends data
  // (e.g. after router.refresh() following an edit). Re-sync local state
  // during render (not in an effect) or edits appear to not save.
  const [syncedRecipe, setSyncedRecipe] = useState(initialRecipe);
  if (initialRecipe !== syncedRecipe) {
    setSyncedRecipe(initialRecipe);
    setRecipe(initialRecipe);
    setNotes(initialRecipe.notes ?? "");
  }

  const { average, count } = ratingSummary(recipe.recipe_ratings);
  const myRating =
    recipe.recipe_ratings.find((r) => r.user_id === userId)?.rating ?? 0;

  const saveNotes = async () => {
    setNotesStatus("saving");
    const supabase = createClient();
    await supabase.from("recipes").update({ notes }).eq("id", recipe.id);
    setNotesStatus("saved");
  };

  const setRating = async (value: number) => {
    const newValue = value === myRating ? 0 : value;
    const otherRatings = recipe.recipe_ratings.filter(
      (r) => r.user_id !== userId,
    );
    setRecipe({
      ...recipe,
      recipe_ratings: newValue
        ? [...otherRatings, { rating: newValue, user_id: userId }]
        : otherRatings,
    });

    const supabase = createClient();
    if (newValue === 0) {
      await supabase
        .from("recipe_ratings")
        .delete()
        .eq("recipe_id", recipe.id)
        .eq("user_id", userId);
    } else {
      await supabase
        .from("recipe_ratings")
        .upsert(
          { recipe_id: recipe.id, user_id: userId, rating: newValue },
          { onConflict: "recipe_id,user_id" },
        );
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(isOwner ? "/recipes" : "/discover");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this recipe? This cannot be undone.")) return;
    const supabase = createClient();
    await supabase.from("recipes").delete().eq("id", recipe.id);
    router.push("/recipes");
    router.refresh();
  };

  if (editing) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-gray-100 bg-white p-5 shadow-xl shadow-sky-900/5 sm:p-8">
        <h2 className="mb-5 text-xl font-semibold text-gray-900">Edit recipe</h2>
        <RecipeForm
          userId={userId}
          initialRecipe={recipe}
          onCancel={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            router.refresh();
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="text-sm font-medium text-gray-400 transition hover:text-gray-700"
        >
          ← Back
        </button>
        {isOwner && (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-sky-900/5">
        <div className="flex h-56 items-center justify-center bg-gradient-to-b from-sky-100 to-sky-50 text-6xl">
          {recipe.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.image_url}
              alt={recipe.title}
              className="h-full w-full object-cover"
            />
          ) : (
            "🍽️"
          )}
        </div>
        <div className="flex flex-col gap-5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {recipe.title}
              </h1>
              {recipe.owner && (
                <p className="mt-1 text-sm text-gray-500">
                  by {recipe.owner.full_name}
                  {recipe.owner.country && ` · 🌍 ${recipe.owner.country}`}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recipe.meal_type && (
                <span className="rounded-full bg-gray-900 px-2.5 py-0.5 text-xs font-medium text-white">
                  {recipe.meal_type}
                </span>
              )}
              {recipe.country && (
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                  🌍 {recipe.country}
                </span>
              )}
              {recipe.categories.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Community rating
              </p>
              <p className="flex items-center gap-1 text-red-500">
                ♥ {count > 0 ? average.toFixed(1) : "—"}
                <span className="text-xs text-gray-400">
                  ({count} {count === 1 ? "review" : "reviews"})
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Difficulty
              </p>
              <p className="text-amber-500">
                {"★".repeat(recipe.difficulty ?? 0)}
                <span className="text-gray-300">
                  {"★".repeat(5 - (recipe.difficulty ?? 0))}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Your rating
              </p>
              <p className="flex gap-0.5 text-lg">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => setRating(value)}
                    className={
                      value <= myRating ? "text-red-500" : "text-gray-300"
                    }
                  >
                    ♥
                  </button>
                ))}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {recipe.prep_time_minutes != null && (
              <span>⏱ {recipe.prep_time_minutes} min</span>
            )}
            <span>🍽 {recipe.portions} portions</span>
            {recipe.price_kr != null && <span>💰 {recipe.price_kr} kr</span>}
          </div>

          <div>
            <h2 className="mb-2 font-semibold text-gray-900">Ingredients</h2>
            <ul className="flex flex-col gap-1 text-sm text-gray-700">
              {recipe.ingredients.map((ing, i) => (
                <li
                  key={i}
                  className="flex justify-between border-b border-gray-50 py-1"
                >
                  <span>{ing.name}</span>
                  <span className="text-gray-400">
                    {ing.amount} {ing.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-2 font-semibold text-gray-900">Instructions</h2>
            <InstructionSteps steps={recipe.instructions} />
          </div>

          {isOwner && (
            <div>
              <h2 className="mb-2 font-semibold text-gray-900">Notes</h2>
              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setNotesStatus("idle");
                }}
                onBlur={saveNotes}
                rows={3}
                placeholder="Write a note about this recipe — e.g. what you changed or what worked well..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-sky-500 focus:bg-white"
              />
              <p className="mt-1 text-xs text-gray-400">
                {notesStatus === "saving"
                  ? "Saving..."
                  : notesStatus === "saved"
                    ? "Saved"
                    : "Saves when you click away"}
              </p>
            </div>
          )}

          <RecipeComments
            recipeId={recipe.id}
            userId={userId}
            initialComments={recipe.recipe_comments}
          />
        </div>
      </div>
    </div>
  );
}

function InstructionSteps({ steps }: { steps: string[] }) {
  const [checked, setChecked] = useState<boolean[]>(() => steps.map(() => false));
  return (
    <ol className="flex flex-col gap-2 text-sm text-gray-700">
      {steps.map((step, i) => (
        <li key={i} className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={checked[i]}
            onChange={() =>
              setChecked(checked.map((c, idx) => (idx === i ? !c : c)))
            }
            className="mt-0.5 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
          />
          <span className={checked[i] ? "text-gray-400 line-through" : ""}>
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}
