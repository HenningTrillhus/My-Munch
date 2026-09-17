import Link from "next/link";
import { ratingSummary, type RecipeCardData } from "@/lib/recipes/types";

export function RecipeCard({ recipe }: { recipe: RecipeCardData }) {
  const { average, count } = ratingSummary(recipe.recipe_ratings);

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="flex h-36 items-center justify-center bg-gradient-to-b from-sky-100 to-sky-50 text-4xl">
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
      <div className="flex flex-col gap-2 p-4">
        <h3 className="font-semibold text-gray-900">{recipe.title}</h3>
        {recipe.owner && (
          <p className="text-xs text-gray-500">by {recipe.owner.full_name}</p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {recipe.meal_type && (
            <span className="rounded-full bg-gray-900 px-2.5 py-0.5 text-xs font-medium text-white">
              {recipe.meal_type}
            </span>
          )}
          {recipe.categories.map((category) => (
            <span
              key={category}
              className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700"
            >
              {category}
            </span>
          ))}
          {recipe.is_vegetarian && (
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
              🌱 Vegetarian
            </span>
          )}
          {recipe.is_fish && (
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              🐟 Fish
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1 text-red-500">
            ♥ {count > 0 ? average.toFixed(1) : "—"}
            <span className="text-xs text-gray-400">
              ({count} {count === 1 ? "review" : "reviews"})
            </span>
          </span>
          {recipe.difficulty && (
            <span className="text-amber-500">
              {"★".repeat(recipe.difficulty)}
              <span className="text-gray-300">
                {"★".repeat(5 - recipe.difficulty)}
              </span>
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          {recipe.prep_time_minutes != null && <span>⏱ {recipe.prep_time_minutes} min</span>}
          <span>🍽 {recipe.portions} portions</span>
          {recipe.price_kr != null && <span>💰 {recipe.price_kr} kr</span>}
        </div>
      </div>
    </Link>
  );
}
