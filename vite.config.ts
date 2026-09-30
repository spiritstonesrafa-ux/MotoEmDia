// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Public (non-secret) backend connection values. The .env file is not tracked in git,
// so builds made from the repository would ship without them and the app would crash
// with "Missing Supabase environment variable(s)". These fallbacks are only used when
// the variable is absent from the build environment. Never put secret keys here.
const PUBLIC_ENV_FALLBACKS: Record<string, string> = {
  VITE_SUPABASE_URL: "https://hmqfjssvkooahcqcsstw.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_mXQAamSjcdcWWOoe0vSKSA_LMwpp9eP",
  VITE_SUPABASE_PROJECT_ID: "hmqfjssvkooahcqcsstw",
};

const fallbackDefine: Record<string, string> = {};
for (const [key, value] of Object.entries(PUBLIC_ENV_FALLBACKS)) {
  if (!process.env[key]) process.env[key] = value;
  fallbackDefine[`import.meta.env.${key}`] = JSON.stringify(process.env[key]);
}
if (!process.env.SUPABASE_URL) process.env.SUPABASE_URL = PUBLIC_ENV_FALLBACKS.VITE_SUPABASE_URL;
if (!process.env.SUPABASE_PUBLISHABLE_KEY)
  process.env.SUPABASE_PUBLISHABLE_KEY = PUBLIC_ENV_FALLBACKS.VITE_SUPABASE_PUBLISHABLE_KEY;

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    define: fallbackDefine,
  },
});
