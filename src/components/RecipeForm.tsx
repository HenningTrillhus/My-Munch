"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  COMMON_CATEGORIES,
  COMMON_COUNTRIES,
  MEAL_TYPES,
  UNITS,
  type Ingredient,
  type Recipe,
} from "@/lib/recipes/types";
import { Dropdown } from "@/components/ui/Dropdown";

const inputClasses =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20";

const labelClasses = "text-sm font-medium text-gray-700";

function emptyIngredient(): Ingredient {
  return { amount: "", unit: UNITS[0], name: "" };
}

export function RecipeForm({
  userId,
  initialRecipe,
  onSaved,
  onCancel,
}: {
  userId: string;
  initialRecipe?: Recipe;
  onSaved: (recipeId: string) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initialRecipe?.title ?? "");
  const [mealType, setMealType] = useState(initialRecipe?.meal_type ?? "");
  const [prepTime, setPrepTime] = useState(
    initialRecipe?.prep_time_minutes?.toString() ?? "",
  );
  const [categories, setCategories] = useState<string[]>(
    initialRecipe?.categories ?? [],
  );
  const [categoryInput, setCategoryInput] = useState("");
  const [country, setCountry] = useState(initialRecipe?.country ?? "");
  const [isVegetarian, setIsVegetarian] = useState(
    initialRecipe?.is_vegetarian ?? false,
  );
  const [isFish, setIsFish] = useState(initialRecipe?.is_fish ?? false);
  const [portions, setPortions] = useState(
    initialRecipe?.portions?.toString() ?? "1",
  );
  const [priceKr, setPriceKr] = useState(
    initialRecipe?.price_kr?.toString() ?? "",
  );
  const [difficulty, setDifficulty] = useState(initialRecipe?.difficulty ?? 0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl] = useState(initialRecipe?.image_url ?? null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialRecipe?.image_url ?? null,
  );

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : existingImageUrl);
  };
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialRecipe?.ingredients?.length
      ? initialRecipe.ingredients
      : [emptyIngredient()],
  );
  const [instructionsText, setInstructionsText] = useState(
    initialRecipe?.instructions?.join("\n") ?? "",
  );
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const addCategory = () => {
    const value = categoryInput.trim();
    if (value && !categories.includes(value)) {
      setCategories([...categories, value]);
    }
    setCategoryInput("");
  };

  const toggleCategory = (category: string) => {
    setCategories(
      categories.includes(category)
        ? categories.filter((c) => c !== category)
        : [...categories, category],
    );
  };

  const updateIngredient = (index: number, patch: Partial<Ingredient>) => {
    setIngredients(
      ingredients.map((ing, i) => (i === index ? { ...ing, ...patch } : ing)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const steps = instructionsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (!title.trim()) {
      setStatus("error");
      setErrorMessage("Title is required.");
      return;
    }
    if (steps.length === 0) {
      setStatus("error");
      setErrorMessage("Add at least one instruction step.");
      return;
    }

    setStatus("saving");
    const supabase = createClient();

    let imageUrl = existingImageUrl;
    if (imageFile) {
      const path = `${userId}/${crypto.randomUUID()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("recipe-images")
        .upload(path, imageFile);

      if (uploadError) {
        setStatus("error");
        setErrorMessage("Failed to upload image: " + uploadError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("recipe-images")
        .getPublicUrl(path);
      imageUrl = publicUrlData.publicUrl;
    }

    const payload = {
      title: title.trim(),
      meal_type: mealType || null,
      prep_time_minutes: prepTime ? Number(prepTime) : null,
      categories,
      is_vegetarian: isVegetarian,
      is_fish: isFish,
      portions: portions ? Number(portions) : 1,
      price_kr: priceKr ? Number(priceKr) : null,
      difficulty: difficulty || null,
      country: country.trim() || null,
      image_url: imageUrl,
      ingredients: ingredients.filter((ing) => ing.name.trim()),
      instructions: steps,
      updated_at: new Date().toISOString(),
    };

    if (initialRecipe) {
      const { error } = await supabase
        .from("recipes")
        .update(payload)
        .eq("id", initialRecipe.id);

      if (error) {
        setStatus("error");
        setErrorMessage(error.message);
        return;
      }
      onSaved(initialRecipe.id);
      return;
    }

    const { data, error } = await supabase
      .from("recipes")
      .insert({ ...payload, owner_id: userId })
      .select("id")
      .single();

    if (error || !data) {
      setStatus("error");
      setErrorMessage(error?.message ?? "Something went wrong.");
      return;
    }
    onSaved(data.id);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="recipe-title" className={labelClasses}>
          Title *
        </label>
        <input
          id="recipe-title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClasses}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="recipe-type" className={labelClasses}>
            Type
          </label>
          <Dropdown
            value={mealType}
            onChange={setMealType}
            options={[
              { value: "", label: "Not selected" },
              ...MEAL_TYPES.map((type) => ({ value: type, label: type })),
            ]}
            placeholder="Not selected"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="recipe-time" className={labelClasses}>
            Prep time (min)
          </label>
          <input
            id="recipe-time"
            type="number"
            min={0}
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
            className={inputClasses}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClasses}>Categories</label>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_CATEGORIES.map((category) => {
            const active = categories.includes(category);
            return (
              <button
                type="button"
                key={category}
                onClick={() => toggleCategory(category)}
                className={
                  active
                    ? "rounded-full bg-sky-600 px-3 py-1 text-xs font-medium text-white"
                    : "rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-sky-300 hover:text-sky-700"
                }
              >
                {category}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={categoryInput}
            onChange={(e) => setCategoryInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCategory();
              }
            }}
            placeholder="Add a custom category..."
            className={inputClasses}
          />
          <button
            type="button"
            onClick={addCategory}
            className="shrink-0 rounded-lg bg-sky-600 px-4 text-sm font-semibold text-white hover:bg-sky-700"
          >
            +
          </button>
        </div>
        {categories.filter((c) => !(COMMON_CATEGORIES as readonly string[]).includes(c))
          .length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {categories
              .filter((c) => !(COMMON_CATEGORIES as readonly string[]).includes(c))
              .map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => setCategories(categories.filter((c) => c !== category))}
                  className="flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700"
                >
                  {category} ✕
                </button>
              ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="recipe-country" className={labelClasses}>
          Country of origin (optional)
        </label>
        <input
          id="recipe-country"
          type="text"
          list="country-options"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="e.g. Italy"
          className={inputClasses}
        />
        <datalist id="country-options">
          {COMMON_COUNTRIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-1.5 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isVegetarian}
            onChange={(e) => setIsVegetarian(e.target.checked)}
            className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
          />
          Vegetarian
        </label>
        <label className="flex items-center gap-1.5 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isFish}
            onChange={(e) => setIsFish(e.target.checked)}
            className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
          />
          Fish
        </label>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="recipe-portions" className={labelClasses}>
            Portions
          </label>
          <input
            id="recipe-portions"
            type="number"
            min={1}
            value={portions}
            onChange={(e) => setPortions(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="recipe-price" className={labelClasses}>
            Price (kr)
          </label>
          <input
            id="recipe-price"
            type="number"
            min={0}
            value={priceKr}
            onChange={(e) => setPriceKr(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className={labelClasses}>Difficulty</span>
          <div className="flex h-[42px] items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                type="button"
                key={value}
                onClick={() => setDifficulty(value === difficulty ? 0 : value)}
                className={`text-xl ${value <= difficulty ? "text-amber-500" : "text-gray-300"}`}
                aria-label={`${value} of 5`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelClasses}>Photo</label>
        <div className="flex items-center gap-4">
          <label className="flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50 text-2xl transition hover:border-sky-400 hover:bg-sky-50">
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreview}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              "📷"
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
          <label className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
            {imagePreview ? "Change photo" : "Choose photo"}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className={labelClasses}>Ingredients</label>
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={ingredient.amount}
              onChange={(e) => updateIngredient(index, { amount: e.target.value })}
              placeholder="Amount"
              className={`${inputClasses} w-16 sm:w-20`}
            />
            <Dropdown
              value={ingredient.unit}
              onChange={(v) => updateIngredient(index, { unit: v })}
              options={UNITS.map((unit) => ({ value: unit, label: unit }))}
              placeholder="unit"
              className="w-20 sm:w-24"
            />
            <input
              type="text"
              value={ingredient.name}
              onChange={(e) => updateIngredient(index, { name: e.target.value })}
              placeholder="Ingredient, e.g. egg"
              className={`${inputClasses} min-w-[140px] flex-1`}
            />
            <button
              type="button"
              onClick={() => setIngredients(ingredients.filter((_, i) => i !== index))}
              aria-label="Remove ingredient"
              className="shrink-0 text-gray-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setIngredients([...ingredients, emptyIngredient()])}
          className="self-start text-sm font-medium text-sky-700 hover:text-sky-800"
        >
          + Add ingredient
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="recipe-instructions" className={labelClasses}>
          Instructions — one step per line *
        </label>
        <textarea
          id="recipe-instructions"
          required
          rows={5}
          value={instructionsText}
          onChange={(e) => setInstructionsText(e.target.value)}
          placeholder={"Mix milk and egg\nWhisk well\nFry on medium heat\n..."}
          className={inputClasses}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={status === "saving"}
          className="flex-1 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "saving" ? "Saving..." : "Save recipe"}
        </button>
      </div>
      {status === "error" && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
