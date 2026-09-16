"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { RecipeForm } from "@/components/RecipeForm";
import type { Recipe } from "@/lib/recipes/types";

export function RecipeDetail({
  recipe: initialRecipe,
  isOwner,
  userId,
}: {
  recipe: Recipe;
  isOwner: boolean;
  userId?: string;
}) {
  const router = useRouter();
  const [recipe, setRecipe] = useState(initialRecipe);
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(recipe.notes ?? "");
  const [notesStatus, setNotesStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );

  const saveNotes = async () => {
    setNotesStatus("saving");
    const supabase = createClient();
    await supabase.from("recipes").update({ notes }).eq("id", recipe.id);
    setNotesStatus("saved");
  };

  const setRating = async (value: number) => {
    const newValue = value === recipe.personal_rating ? 0 : value;
    setRecipe({ ...recipe, personal_rating: newValue });
    const supabase = createClient();
    await supabase
      .from("recipes")
      .update({ personal_rating: newValue || null })
      .eq("id", recipe.id);
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
      <div className="mx-auto max-w-lg rounded-2xl border border-gray-100 bg-white p-8 shadow-xl shadow-orange-900/5">
        <h2 className="mb-5 text-xl font-semibold text-gray-900">Edit recipe</h2>
        <RecipeForm
          userId={userId!}
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
        <Link
          href={isOwner ? "/recipes" : "/discover"}
          className="text-sm font-medium text-gray-400 transition hover:text-gray-700"
        >
          ← Back
        </Link>
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

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-orange-900/5">
        <div className="flex h-56 items-center justify-center bg-gradient-to-b from-orange-100 to-orange-50 text-6xl">
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
            <h1 className="text-2xl font-semibold text-gray-900">{recipe.title}</h1>
            <div className="flex flex-wrap gap-1.5">
              {recipe.meal_type && (
                <span className="rounded-full bg-gray-900 px-2.5 py-0.5 text-xs font-medium text-white">
                  {recipe.meal_type}
                </span>
              )}
              {recipe.categories.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-medium text-orange-700"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
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
            {isOwner && (
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
                        value <= (recipe.personal_rating ?? 0)
                          ? "text-red-500"
                          : "text-gray-300"
                      }
                    >
                      ♥
                    </button>
                  ))}
                </p>
              </div>
            )}
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
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-orange-500 focus:bg-white"
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
            className="mt-0.5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
          />
          <span className={checked[i] ? "text-gray-400 line-through" : ""}>
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}
