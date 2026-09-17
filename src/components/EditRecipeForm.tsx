"use client";

import { useRouter } from "next/navigation";
import { RecipeForm } from "@/components/RecipeForm";
import type { Recipe } from "@/lib/recipes/types";

export function EditRecipeForm({
  userId,
  recipe,
}: {
  userId: string;
  recipe: Recipe;
}) {
  const router = useRouter();

  return (
    <RecipeForm
      userId={userId}
      initialRecipe={recipe}
      onCancel={() => router.push(`/recipes/${recipe.id}`)}
      onSaved={() => {
        router.push(`/recipes/${recipe.id}`);
        router.refresh();
      }}
    />
  );
}
