// Sentry setup. Imported first in index.tsx so it initializes before the app.
// Disabled unless VITE_SENTRY_DSN is set at build time (on Railway).
import * as Sentry from "@sentry/react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";

const dsn = import.meta.env.VITE_SENTRY_DSN;
const apiUrl = import.meta.env.VITE_API_URL ?? "https://api.weeklypulls.com/";

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.reactRouterBrowserTracingIntegration({
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
  ],
  tracesSampleRate: 0.1,
  // Send trace headers only to our own API (its CORS config allows them).
  tracePropagationTargets: [apiUrl],
  // SDK 11 collects more by default; keep personal data and bodies out.
  dataCollection: {
    userInfo: false,
    cookies: false,
    httpBodies: [],
  },
});
