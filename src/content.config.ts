import { defineCollection } from "astro:content";
import { z } from "astro:schema";
import { glob } from "astro/loaders";

// Per-jurisdiction gambling-history narratives (rendered on state pages).
const history = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/history" }),
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

export const collections = { history, resources };
