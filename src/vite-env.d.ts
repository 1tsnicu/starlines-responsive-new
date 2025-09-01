/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BUSS_BASE_URL?: string;
  readonly VITE_BUSS_LOGIN?: string;
  readonly VITE_BUSS_PASSWORD?: string;
  readonly VITE_USE_MOCK_BUSSYSTEM?: string;
  // add more env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
