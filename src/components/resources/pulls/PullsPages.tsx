import { wrapReactRouterRouting } from "@sentry/react";
import { Routes as RouterRoutes, Route } from "react-router-dom";

import AddSeriesPage from "./AddSeriesPage";
import PullsDetail from "./PullsDetail";
import PullsList from "./PullsList";

// Names route transactions after the matched route pattern.
const Routes = wrapReactRouterRouting(RouterRoutes);

export default function PullsPages() {
  return (
    <Routes>
      <Route index element={<PullsList />} />
      <Route path="add" element={<AddSeriesPage />} />
      <Route path=":pullId" element={<PullsDetail />} />
    </Routes>
  );
}
