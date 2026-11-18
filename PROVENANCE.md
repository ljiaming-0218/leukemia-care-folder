# Template provenance

Adapted from the user-provided Codex Sites 0.1.66 `sites-building/templates/vinext-starter`.

The Vite build setup and Tailwind base stylesheet originate from that template. The Shadcn UI catalog, hooks, utilities and vendored Shadcn CSS were removed during cleanup because this site uses hand-written CSS. Dependencies retain their own licenses.

Qoder adaptations replace Vinext/Next server rendering and Cloudflare configuration with a Vite static build; remove D1/Drizzle, R2 and ChatGPT authentication scaffolding. The Deno Function example and its local dev server were also removed because the site is fully static. No upstream hosting, auth or resource configuration is copied into generated projects.

Qoder adds the Sites design contract and maps the starter theme, spacing, typography and transition scales to Nudge variables. Original light/dark colors are preserved as named project variables.
