import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "build", // keep existing deploy expectations
  },
  server: {
    port: 3000,
    open: true,
  },
});
