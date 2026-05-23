// Single source of truth for the Find Your State widgets (geo map, hex
// cartogram, alphabetical list). FIPS matches Census TopoJSON feature ids;
// hex {row,col} is a 0-indexed tile-grid position (tuned visually).
export type JurisdictionType = "state" | "dc" | "territory";

export interface MapJurisdiction {
  code: string; // postal abbreviation
  name: string;
  slug: string; // matches existing /state/<slug> routes
  type: JurisdictionType;
  fips: string;
  hex: { row: number; col: number };
}

export const jurisdictions: MapJurisdiction[] = [
  { code: "AL", name: "Alabama", slug: "alabama", type: "state", fips: "01", hex: { row: 6, col: 7 } },
  { code: "AK", name: "Alaska", slug: "alaska", type: "state", fips: "02", hex: { row: 0, col: 0 } },
  { code: "AZ", name: "Arizona", slug: "arizona", type: "state", fips: "04", hex: { row: 5, col: 2 } },
  { code: "AR", name: "Arkansas", slug: "arkansas", type: "state", fips: "05", hex: { row: 5, col: 5 } },
  { code: "CA", name: "California", slug: "california", type: "state", fips: "06", hex: { row: 4, col: 1 } },
  { code: "CO", name: "Colorado", slug: "colorado", type: "state", fips: "08", hex: { row: 4, col: 3 } },
  { code: "CT", name: "Connecticut", slug: "connecticut", type: "state", fips: "09", hex: { row: 3, col: 11 } },
  { code: "DE", name: "Delaware", slug: "delaware", type: "state", fips: "10", hex: { row: 4, col: 10 } },
  { code: "DC", name: "District of Columbia", slug: "district-of-columbia", type: "dc", fips: "11", hex: { row: 5, col: 9 } },
  { code: "FL", name: "Florida", slug: "florida", type: "state", fips: "12", hex: { row: 7, col: 9 } },
  { code: "GA", name: "Georgia", slug: "georgia", type: "state", fips: "13", hex: { row: 6, col: 8 } },
  { code: "HI", name: "Hawaii", slug: "hawaii", type: "state", fips: "15", hex: { row: 6, col: 0 } },
  { code: "ID", name: "Idaho", slug: "idaho", type: "state", fips: "16", hex: { row: 2, col: 2 } },
  { code: "IL", name: "Illinois", slug: "illinois", type: "state", fips: "17", hex: { row: 3, col: 6 } },
  { code: "IN", name: "Indiana", slug: "indiana", type: "state", fips: "18", hex: { row: 3, col: 7 } },
  { code: "IA", name: "Iowa", slug: "iowa", type: "state", fips: "19", hex: { row: 3, col: 5 } },
  { code: "KS", name: "Kansas", slug: "kansas", type: "state", fips: "20", hex: { row: 5, col: 4 } },
  { code: "KY", name: "Kentucky", slug: "kentucky", type: "state", fips: "21", hex: { row: 4, col: 6 } },
  { code: "LA", name: "Louisiana", slug: "louisiana", type: "state", fips: "22", hex: { row: 6, col: 5 } },
  { code: "ME", name: "Maine", slug: "maine", type: "state", fips: "23", hex: { row: 0, col: 11 } },
  { code: "MD", name: "Maryland", slug: "maryland", type: "state", fips: "24", hex: { row: 4, col: 9 } },
  { code: "MA", name: "Massachusetts", slug: "massachusetts", type: "state", fips: "25", hex: { row: 2, col: 10 } },
  { code: "MI", name: "Michigan", slug: "michigan", type: "state", fips: "26", hex: { row: 2, col: 8 } },
  { code: "MN", name: "Minnesota", slug: "minnesota", type: "state", fips: "27", hex: { row: 2, col: 5 } },
  { code: "MS", name: "Mississippi", slug: "mississippi", type: "state", fips: "28", hex: { row: 6, col: 6 } },
  { code: "MO", name: "Missouri", slug: "missouri", type: "state", fips: "29", hex: { row: 4, col: 5 } },
  { code: "MT", name: "Montana", slug: "montana", type: "state", fips: "30", hex: { row: 2, col: 3 } },
  { code: "NE", name: "Nebraska", slug: "nebraska", type: "state", fips: "31", hex: { row: 4, col: 4 } },
  { code: "NV", name: "Nevada", slug: "nevada", type: "state", fips: "32", hex: { row: 3, col: 2 } },
  { code: "NH", name: "New Hampshire", slug: "new-hampshire", type: "state", fips: "33", hex: { row: 1, col: 11 } },
  { code: "NJ", name: "New Jersey", slug: "new-jersey", type: "state", fips: "34", hex: { row: 3, col: 10 } },
  { code: "NM", name: "New Mexico", slug: "new-mexico", type: "state", fips: "35", hex: { row: 5, col: 3 } },
  { code: "NY", name: "New York", slug: "new-york", type: "state", fips: "36", hex: { row: 2, col: 9 } },
  { code: "NC", name: "North Carolina", slug: "north-carolina", type: "state", fips: "37", hex: { row: 5, col: 7 } },
  { code: "ND", name: "North Dakota", slug: "north-dakota", type: "state", fips: "38", hex: { row: 2, col: 4 } },
  { code: "OH", name: "Ohio", slug: "ohio", type: "state", fips: "39", hex: { row: 3, col: 8 } },
  { code: "OK", name: "Oklahoma", slug: "oklahoma", type: "state", fips: "40", hex: { row: 6, col: 4 } },
  { code: "OR", name: "Oregon", slug: "oregon", type: "state", fips: "41", hex: { row: 3, col: 1 } },
  { code: "PA", name: "Pennsylvania", slug: "pennsylvania", type: "state", fips: "42", hex: { row: 3, col: 9 } },
  { code: "RI", name: "Rhode Island", slug: "rhode-island", type: "state", fips: "44", hex: { row: 2, col: 11 } },
  { code: "SC", name: "South Carolina", slug: "south-carolina", type: "state", fips: "45", hex: { row: 6, col: 9 } },
  { code: "SD", name: "South Dakota", slug: "south-dakota", type: "state", fips: "46", hex: { row: 3, col: 4 } },
  { code: "TN", name: "Tennessee", slug: "tennessee", type: "state", fips: "47", hex: { row: 5, col: 6 } },
  { code: "TX", name: "Texas", slug: "texas", type: "state", fips: "48", hex: { row: 6, col: 3 } },
  { code: "UT", name: "Utah", slug: "utah", type: "state", fips: "49", hex: { row: 4, col: 2 } },
  { code: "VT", name: "Vermont", slug: "vermont", type: "state", fips: "50", hex: { row: 1, col: 10 } },
  { code: "VA", name: "Virginia", slug: "virginia", type: "state", fips: "51", hex: { row: 4, col: 8 } },
  { code: "WA", name: "Washington", slug: "washington", type: "state", fips: "53", hex: { row: 2, col: 1 } },
  { code: "WV", name: "West Virginia", slug: "west-virginia", type: "state", fips: "54", hex: { row: 4, col: 7 } },
  { code: "WI", name: "Wisconsin", slug: "wisconsin", type: "state", fips: "55", hex: { row: 2, col: 6 } },
  { code: "WY", name: "Wyoming", slug: "wyoming", type: "state", fips: "56", hex: { row: 3, col: 3 } },
  { code: "PR", name: "Puerto Rico", slug: "puerto-rico", type: "territory", fips: "72", hex: { row: 9, col: 7 } },
  { code: "VI", name: "US Virgin Islands", slug: "us-virgin-islands", type: "territory", fips: "78", hex: { row: 9, col: 8 } },
  { code: "GU", name: "Guam", slug: "guam", type: "territory", fips: "66", hex: { row: 9, col: 5 } },
  { code: "AS", name: "American Samoa", slug: "american-samoa", type: "territory", fips: "60", hex: { row: 9, col: 4 } },
  { code: "MP", name: "Northern Mariana Islands", slug: "northern-mariana-islands", type: "territory", fips: "69", hex: { row: 9, col: 6 } },
];

export function linkFor(j: MapJurisdiction): string {
  return `/state/${j.slug}`;
}

export const jurisdictionsByName = [...jurisdictions].sort((a, b) =>
  a.name.localeCompare(b.name),
);
