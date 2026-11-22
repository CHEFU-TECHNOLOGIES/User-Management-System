import type { ManagedUser } from "@/lib/admin-api";

export function countryLabel(country: ManagedUser["country"]) {
  return country
    ? `${country.name}${country.source === "detected" ? " (detected)" : ""}`
    : "Unknown";
}

export function UserCountry({ country }: { country?: ManagedUser["country"] }) {
  return (
    <span title={country?.code || undefined}>
      {countryLabel(country || null)}
    </span>
  );
}
