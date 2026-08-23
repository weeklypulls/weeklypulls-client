import { Routes, Route } from "react-router-dom";

import AddSeriesPage from "./AddSeriesPage";
import PullsDetail from "./PullsDetail";
import PullsList from "./PullsList";

export default function PullsPages() {
  return (
    <Routes>
      <Route index element={<PullsList />} />
      <Route path="add" element={<AddSeriesPage />} />
      <Route path=":pullId" element={<PullsDetail />} />
    </Routes>
  );
}
