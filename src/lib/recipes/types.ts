export const MEAL_TYPES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Dessert",
  "Sauce",
  "Side dish",
  "Baking",
  "Drink",
] as const;

export const UNITS = ["pcs", "g", "kg", "ml", "dl", "l", "tsp", "tbsp"] as const;

export const TIME_BUCKETS = [
  { label: "Under 15 min", max: 15 },
  { label: "15-30 min", max: 30 },
  { label: "30-60 min", max: 60 },
  { label: "Over 60 min", max: Infinity },
] as const;

export type Ingredient = {
  amount: string;
  unit: string;
  name: string;
};

export type RecipeAuthor = {
  username: string;
  full_name: string;
} | null;

export type RecipeRating = {
  rating: number;
  user_id?: string;
};

export type RecipeComment = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  profiles: RecipeAuthor;
};

export type Recipe = {
  id: string;
  owner_id: string;
  title: string;
  meal_type: string | null;
  prep_time_minutes: number | null;
  categories: string[];
  is_vegetarian: boolean;
  is_fish: boolean;
  portions: number;
  price_kr: number | null;
  difficulty: number | null;
  image_url: string | null;
  ingredients: Ingredient[];
  instructions: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
  owner: RecipeAuthor;
  recipe_ratings: RecipeRating[];
  recipe_comments: RecipeComment[];
};

export type RecipeCardData = Pick<
  Recipe,
  | "id"
  | "title"
  | "meal_type"
  | "prep_time_minutes"
  | "categories"
  | "is_vegetarian"
  | "is_fish"
  | "portions"
  | "price_kr"
  | "difficulty"
  | "image_url"
  | "owner"
  | "recipe_ratings"
>;

export const RECIPE_CARD_COLUMNS =
  "id, title, meal_type, prep_time_minutes, categories, is_vegetarian, is_fish, portions, price_kr, difficulty, image_url, owner:profiles(username, full_name), recipe_ratings(rating)";

export function ratingSummary(ratings: RecipeRating[]): {
  average: number;
  count: number;
} {
  if (ratings.length === 0) {
    return { average: 0, count: 0 };
  }
  const sum = ratings.reduce((total, r) => total + r.rating, 0);
  return { average: sum / ratings.length, count: ratings.length };
}
