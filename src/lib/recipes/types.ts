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
  personal_rating: number | null;
  image_url: string | null;
  ingredients: Ingredient[];
  instructions: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
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
>;

export const RECIPE_CARD_COLUMNS =
  "id, title, meal_type, prep_time_minutes, categories, is_vegetarian, is_fish, portions, price_kr, difficulty, image_url";
