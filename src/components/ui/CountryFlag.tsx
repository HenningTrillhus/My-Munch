import { countryIsoCode } from "@/lib/recipes/types";

export function CountryFlag({
  country,
  size = 20,
  className = "",
}: {
  country: string | null | undefined;
  size?: number;
  className?: string;
}) {
  const code = countryIsoCode(country);
  if (!code) {
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      alt={country ?? ""}
      title={country ?? undefined}
      width={size}
      className={`inline-block h-auto rounded-sm object-cover align-middle ${className}`}
    />
  );
}
