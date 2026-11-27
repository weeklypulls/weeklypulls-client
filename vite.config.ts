import { sentryVitePlugin } from "@sentry/bundler-plugins/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Source maps are built and uploaded to Sentry only when SENTRY_AUTH_TOKEN is
// set (Railway's build). They're "hidden" (no sourceMappingURL comment) and
// deleted after upload, so they're never served publicly.
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Must come after the other plugins.
    sentryAuthToken
      ? sentryVitePlugin({
          org: "na-qp1",
          project: "weeklypulls-web",
          authToken: sentryAuthToken,
          release: { name: process.env.RAILWAY_GIT_COMMIT_SHA },
          sourcemaps: { filesToDeleteAfterUpload: ["./build/**/*.map"] },
          telemetry: false,
        })
      : null,
  ],
  build: {
    outDir: "build",
    sourcemap: sentryAuthToken ? "hidden" : false,
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
