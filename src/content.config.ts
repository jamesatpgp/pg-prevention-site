import { defineCollection } from "astro:content";
import { z } from "astro:schema";
import { glob } from "astro/loaders";

// Per-jurisdiction data (50 states + DC + 5 territories). Populated in Phase 2
// from the Gaming Regulatory Archive. Schema kept light until then.
const states = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/states" }),
  schema: z.object({
    name: z.string(),
    abbr: z.string(),
    slug: z.string(),
    helpline: z.string().default("1-800-MY-RESET (1-800-697-3738)"),
  }),
});

// Downloadable resource catalog (rack cards, fact sheets, graphics).
const resources = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/resources" }),
  schema: z.object({
    title: z.string(),
    type: z.string(),
    audience: z.array(z.string()).default([]),
    state: z.string().optional(),
    file: z.string().optional(),
  }),
});

export const collections = { states, resources };
