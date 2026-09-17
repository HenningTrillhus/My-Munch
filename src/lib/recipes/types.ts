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

export const COMMON_CATEGORIES = [
  "quick",
  "healthy",
  "comfort food",
  "family favorite",
  "budget-friendly",
  "spicy",
  "meal prep",
  "party food",
  "kid-friendly",
  "low-carb",
] as const;

export const SORT_OPTIONS = [
  { value: "most_reviews", label: "Most reviews" },
  { value: "highest_rated", label: "Highest rated" },
  { value: "newest", label: "Newest" },
  { value: "easiest", label: "Easiest first" },
  { value: "hardest", label: "Hardest first" },
  { value: "cheapest", label: "Cheapest first" },
  { value: "priciest", label: "Priciest first" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export const COMMON_COUNTRIES = [
  "Norway",
  "Sweden",
  "Denmark",
  "Finland",
  "Iceland",
  "United Kingdom",
  "Ireland",
  "France",
  "Germany",
  "Italy",
  "Spain",
  "Portugal",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Austria",
  "Poland",
  "Greece",
  "Turkey",
  "Morocco",
  "Egypt",
  "Nigeria",
  "South Africa",
  "India",
  "China",
  "Japan",
  "South Korea",
  "Thailand",
  "Vietnam",
  "Indonesia",
  "Philippines",
  "Mexico",
  "Brazil",
  "Argentina",
  "Peru",
  "United States",
  "Canada",
  "Australia",
  "New Zealand",
] as const;

const COUNTRY_ISO_CODES: Record<string, string> = {
  Norway: "NO",
  Sweden: "SE",
  Denmark: "DK",
  Finland: "FI",
  Iceland: "IS",
  "United Kingdom": "GB",
  Ireland: "IE",
  France: "FR",
  Germany: "DE",
  Italy: "IT",
  Spain: "ES",
  Portugal: "PT",
  Netherlands: "NL",
  Belgium: "BE",
  Switzerland: "CH",
  Austria: "AT",
  Poland: "PL",
  Greece: "GR",
  Turkey: "TR",
  Morocco: "MA",
  Egypt: "EG",
  Nigeria: "NG",
  "South Africa": "ZA",
  India: "IN",
  China: "CN",
  Japan: "JP",
  "South Korea": "KR",
  Thailand: "TH",
  Vietnam: "VN",
  Indonesia: "ID",
  Philippines: "PH",
  Mexico: "MX",
  Brazil: "BR",
  Argentina: "AR",
  Peru: "PE",
  "United States": "US",
  Canada: "CA",
  Australia: "AU",
  "New Zealand": "NZ",
};

// Unicode flag emoji rely on the OS/browser having a font that renders
// regional-indicator letter pairs as an actual flag glyph - Windows
// Chrome/Edge commonly just show the raw two letters instead (e.g. "NO"),
// so flags are rendered as real images (see CountryFlag) keyed by this
// ISO 3166-1 alpha-2 code rather than as emoji text.
export function countryIsoCode(country: string | null | undefined): string | null {
  if (!country) return null;
  return COUNTRY_ISO_CODES[country]?.toLowerCase() ?? null;
}

export type Ingredient = {
  amount: string;
  unit: string;
  name: string;
};

export type RecipeAuthor = {
  username: string;
  full_name: string;
  country: string | null;
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
  country: string | null;
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
  | "country"
  | "image_url"
  | "created_at"
  | "owner"
  | "recipe_ratings"
>;

export const RECIPE_CARD_COLUMNS =
  "id, title, meal_type, prep_time_minutes, categories, is_vegetarian, is_fish, portions, price_kr, difficulty, country, image_url, created_at, owner:profiles(username, full_name, country), recipe_ratings(rating)";

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

export function sortRecipes<
  T extends {
    created_at: string;
    difficulty: number | null;
    price_kr: number | null;
    recipe_ratings: RecipeRating[];
  },
>(recipes: T[], sort: SortOption): T[] {
  const list = [...recipes];
  switch (sort) {
    case "highest_rated":
      return list.sort((a, b) => {
        const statsA = ratingSummary(a.recipe_ratings);
        const statsB = ratingSummary(b.recipe_ratings);
        return statsB.average - statsA.average || statsB.count - statsA.count;
      });
    case "newest":
      return list.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    case "easiest":
      return list.sort((a, b) => (a.difficulty ?? 99) - (b.difficulty ?? 99));
    case "hardest":
      return list.sort((a, b) => (b.difficulty ?? -1) - (a.difficulty ?? -1));
    case "cheapest":
      return list.sort(
        (a, b) => (a.price_kr ?? Infinity) - (b.price_kr ?? Infinity),
      );
    case "priciest":
      return list.sort((a, b) => (b.price_kr ?? -1) - (a.price_kr ?? -1));
    case "most_reviews":
    default:
      return list.sort(
        (a, b) => ratingSummary(b.recipe_ratings).count - ratingSummary(a.recipe_ratings).count,
      );
  }
}
