"use client";

import { useRouter } from "next/navigation";
import { RecipeForm } from "@/components/RecipeForm";

export function NewRecipeForm({ userId }: { userId: string }) {
  const router = useRouter();

  return (
    <RecipeForm
      userId={userId}
      onCancel={() => router.back()}
      onSaved={(id) => router.push(`/recipes/${id}`)}
    />
  );
}
