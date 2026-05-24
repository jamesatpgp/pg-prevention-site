// Single source of truth for the Find Your State widgets (geo map + list).
// FIPS matches the Census TopoJSON feature ids.
export type JurisdictionType = "state" | "dc" | "territory";

export interface MapJurisdiction {
  code: string; // postal abbreviation
  name: string;
  slug: string; // matches existing /state/<slug> routes
  type: JurisdictionType;
  fips: string;
}

export const jurisdictions: MapJurisdiction[] = [
  { code: "AL", name: "Alabama", slug: "alabama", type: "state", fips: "01" },
  { code: "AK", name: "Alaska", slug: "alaska", type: "state", fips: "02" },
  { code: "AZ", name: "Arizona", slug: "arizona", type: "state", fips: "04" },
  { code: "AR", name: "Arkansas", slug: "arkansas", type: "state", fips: "05" },
  { code: "CA", name: "California", slug: "california", type: "state", fips: "06" },
  { code: "CO", name: "Colorado", slug: "colorado", type: "state", fips: "08" },
  { code: "CT", name: "Connecticut", slug: "connecticut", type: "state", fips: "09" },
  { code: "DE", name: "Delaware", slug: "delaware", type: "state", fips: "10" },
  { code: "DC", name: "District of Columbia", slug: "district-of-columbia", type: "dc", fips: "11" },
  { code: "FL", name: "Florida", slug: "florida", type: "state", fips: "12" },
  { code: "GA", name: "Georgia", slug: "georgia", type: "state", fips: "13" },
  { code: "HI", name: "Hawaii", slug: "hawaii", type: "state", fips: "15" },
  { code: "ID", name: "Idaho", slug: "idaho", type: "state", fips: "16" },
  { code: "IL", name: "Illinois", slug: "illinois", type: "state", fips: "17" },
  { code: "IN", name: "Indiana", slug: "indiana", type: "state", fips: "18" },
  { code: "IA", name: "Iowa", slug: "iowa", type: "state", fips: "19" },
  { code: "KS", name: "Kansas", slug: "kansas", type: "state", fips: "20" },
  { code: "KY", name: "Kentucky", slug: "kentucky", type: "state", fips: "21" },
  { code: "LA", name: "Louisiana", slug: "louisiana", type: "state", fips: "22" },
  { code: "ME", name: "Maine", slug: "maine", type: "state", fips: "23" },
  { code: "MD", name: "Maryland", slug: "maryland", type: "state", fips: "24" },
  { code: "MA", name: "Massachusetts", slug: "massachusetts", type: "state", fips: "25" },
  { code: "MI", name: "Michigan", slug: "michigan", type: "state", fips: "26" },
  { code: "MN", name: "Minnesota", slug: "minnesota", type: "state", fips: "27" },
  { code: "MS", name: "Mississippi", slug: "mississippi", type: "state", fips: "28" },
  { code: "MO", name: "Missouri", slug: "missouri", type: "state", fips: "29" },
  { code: "MT", name: "Montana", slug: "montana", type: "state", fips: "30" },
  { code: "NE", name: "Nebraska", slug: "nebraska", type: "state", fips: "31" },
  { code: "NV", name: "Nevada", slug: "nevada", type: "state", fips: "32" },
  { code: "NH", name: "New Hampshire", slug: "new-hampshire", type: "state", fips: "33" },
  { code: "NJ", name: "New Jersey", slug: "new-jersey", type: "state", fips: "34" },
  { code: "NM", name: "New Mexico", slug: "new-mexico", type: "state", fips: "35" },
  { code: "NY", name: "New York", slug: "new-york", type: "state", fips: "36" },
  { code: "NC", name: "North Carolina", slug: "north-carolina", type: "state", fips: "37" },
  { code: "ND", name: "North Dakota", slug: "north-dakota", type: "state", fips: "38" },
  { code: "OH", name: "Ohio", slug: "ohio", type: "state", fips: "39" },
  { code: "OK", name: "Oklahoma", slug: "oklahoma", type: "state", fips: "40" },
  { code: "OR", name: "Oregon", slug: "oregon", type: "state", fips: "41" },
  { code: "PA", name: "Pennsylvania", slug: "pennsylvania", type: "state", fips: "42" },
  { code: "RI", name: "Rhode Island", slug: "rhode-island", type: "state", fips: "44" },
  { code: "SC", name: "South Carolina", slug: "south-carolina", type: "state", fips: "45" },
  { code: "SD", name: "South Dakota", slug: "south-dakota", type: "state", fips: "46" },
  { code: "TN", name: "Tennessee", slug: "tennessee", type: "state", fips: "47" },
  { code: "TX", name: "Texas", slug: "texas", type: "state", fips: "48" },
  { code: "UT", name: "Utah", slug: "utah", type: "state", fips: "49" },
  { code: "VT", name: "Vermont", slug: "vermont", type: "state", fips: "50" },
  { code: "VA", name: "Virginia", slug: "virginia", type: "state", fips: "51" },
  { code: "WA", name: "Washington", slug: "washington", type: "state", fips: "53" },
  { code: "WV", name: "West Virginia", slug: "west-virginia", type: "state", fips: "54" },
  { code: "WI", name: "Wisconsin", slug: "wisconsin", type: "state", fips: "55" },
  { code: "WY", name: "Wyoming", slug: "wyoming", type: "state", fips: "56" },
  { code: "PR", name: "Puerto Rico", slug: "puerto-rico", type: "territory", fips: "72" },
  { code: "VI", name: "US Virgin Islands", slug: "us-virgin-islands", type: "territory", fips: "78" },
  { code: "GU", name: "Guam", slug: "guam", type: "territory", fips: "66" },
  { code: "AS", name: "American Samoa", slug: "american-samoa", type: "territory", fips: "60" },
  { code: "MP", name: "Northern Mariana Islands", slug: "northern-mariana-islands", type: "territory", fips: "69" },
];

export function linkFor(j: MapJurisdiction): string {
  return `/state/${j.slug}`;
}

export const jurisdictionsByName = [...jurisdictions].sort((a, b) =>
  a.name.localeCompare(b.name),
);
