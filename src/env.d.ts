/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
  // add other env vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
