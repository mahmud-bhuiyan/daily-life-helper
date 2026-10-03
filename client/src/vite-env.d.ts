/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Production API origin, e.g. https://your-api.vercel.app (no trailing slash) */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
