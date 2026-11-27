import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "build",
    // The antd vendor chunk is ~780 kB on its own; app code is split per page.
    chunkSizeWarningLimit: 900,
    rolldownOptions: {
      output: {
        // Separate long-lived vendor chunks so app deploys don't invalidate them.
        codeSplitting: {
          groups: [
            {
              name: "react",
              test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
              priority: 30,
            },
            {
              name: "antd",
              test: /node_modules[\\/](antd|@ant-design|@rc-component|rc-[^\\/]+|@emotion|dayjs)[\\/]/,
              priority: 20,
            },
            { name: "vendor", test: /node_modules[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
