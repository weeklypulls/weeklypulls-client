import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";

import type Store from "./store";
import { StoreContext } from "./storeContext";

// Mapping old cache durations to staleTime (ms)
const minutes = (m: number) => m * 60 * 1000;
const weeks = (w: number) => w * 7 * 24 * 60 * 1000;

// Pull Lists
export function usePullLists() {
  const store = useContext<Store>(StoreContext);
  return useQuery({
    queryKey: ["pull-lists"],
    queryFn: async () => {
      const response = await store.client.user.get("pull-lists/");
      return response.data as any[];
    },
    staleTime: weeks(1),
  });
}

export function useCreatePullList() {
  const store = useContext<Store>(StoreContext);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title: string }) => {
      const response = await store.client.user.post("pull-lists/", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pull-lists"] });
    },
  });
}

// Pulls
export function usePulls() {
  const store = useContext<Store>(StoreContext);
  return useQuery({
    queryKey: ["pulls"],
    queryFn: async () => {
      const response = await store.client.user.get("pulls/");
      return response.data as any[];
    },
    staleTime: minutes(20),
  });
}

export function useCreatePull() {
  const store = useContext<Store>(StoreContext);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { pull_list_id: number; series_id: string | number }) => {
      const resp = await store.client.user.post("pulls/", data);
      return resp.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pulls"] });
    },
  });
}

// Series (fetch individual series for each pull like previous getAllSeries)
export function useSeriesForPulls(enabled: boolean) {
  const store = useContext<Store>(StoreContext);
  const pullsQuery = usePulls();
  return useQuery({
    queryKey: ["series", { ids: pullsQuery.data?.map((p: any) => p.series_id) }],
    queryFn: async () => {
      const pulls = pullsQuery.data || [];
      const results: Record<string, any> = {};
      await Promise.all(
        pulls.map(async (pull: any) => {
          const id = pull.series_id;
          const resp = await store.client.user.get(`series/${id}/`);
          results[id] = resp.data;
        })
      );
      return results; // map of series_id -> series data
    },
    enabled: enabled && !!pullsQuery.data?.length,
    staleTime: weeks(2),
  });
}

// Mutation to mark read/unread replicating store.mark logic (simplified to READ only for now)
export function useMarkIssue() {
  const queryClient = useQueryClient();
  const store = useContext<Store>(StoreContext);
  return useMutation({
    mutationFn: async ({
      seriesId,
      issueId,
      actionKey,
    }: {
      seriesId: string;
      issueId: string;
      actionKey: string;
    }) => {
      // reuse existing endpoint semantics
      return await store.mark(seriesId, issueId, actionKey);
    },
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: ["pulls"] });
      const previousPulls = queryClient.getQueryData<any[]>(["pulls"]);
      if (previousPulls) {
        const nextPulls = previousPulls.map((p) => {
          if (String(p.series_id) !== String(vars.seriesId)) return p;
          const set = new Set<string>(p.read || []);
          if (vars.actionKey === "READ") set.add(vars.issueId);
          if (vars.actionKey === "UNREAD") set.delete(vars.issueId);
          return { ...p, read: Array.from(set) };
        });
        queryClient.setQueryData(["pulls"], nextPulls);
      }
      return { previousPulls };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previousPulls) {
        queryClient.setQueryData(["pulls"], ctx.previousPulls);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["pulls"] });
      queryClient.invalidateQueries({ queryKey: ["unread-issues"] });
    },
  });
}

// Single pull
export function usePull(pullId: string | undefined) {
  const store = useContext<Store>(StoreContext);
  return useQuery({
    queryKey: ["pull", pullId],
    queryFn: async () => {
      if (!pullId) return null;
      const resp = await store.client.user.get(`pulls/${pullId}/`);
      return resp.data;
    },
    enabled: !!pullId,
    staleTime: minutes(20),
  });
}

export function useSeries(seriesId: string | number | undefined) {
  const store = useContext<Store>(StoreContext);
  return useQuery({
    queryKey: ["series", seriesId],
    queryFn: async () => {
      if (!seriesId) return null;
      const resp = await store.client.user.get(`series/${seriesId}/`);
      return resp.data;
    },
    enabled: !!seriesId,
    staleTime: weeks(2),
  });
}

export function useUpdatePull() {
  const store = useContext<Store>(StoreContext);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ pullId, data }: { pullId: string; data: Record<string, unknown> }) => {
      const resp = await store.client.user.patch(`pulls/${pullId}/`, data);
      return resp.data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["pull", vars.pullId] });
      qc.invalidateQueries({ queryKey: ["pulls"] });
    },
  });
}

export function useDeletePull() {
  const store = useContext<Store>(StoreContext);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pullId: string) => {
      await store.client.user.delete(`pulls/${pullId}/`);
      return pullId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pulls"] });
    },
  });
}

// Week detail
export function useWeek(weekId: string | undefined) {
  const store = useContext<Store>(StoreContext);
  return useQuery({
    queryKey: ["week", weekId],
    queryFn: async () => {
      if (!weekId) return null;
      const resp = await store.client.user.get(`weeks/${weekId}/`);
      return resp.data;
    },
    enabled: !!weekId,
    staleTime: minutes(20),
  });
}

// Unread Issues
export interface UnreadIssuesFilters {
  limit?: number;
  since?: string;
}

export function useUnreadIssues(filters: UnreadIssuesFilters) {
  const store = useContext<Store>(StoreContext);
  return useQuery({
    queryKey: ["unread-issues", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.limit) params.append("limit", String(filters.limit));
      if (filters.since) params.append("since", filters.since);
      const qs = params.toString();
      const endpoint = qs ? `pulls/unread_issues/?${qs}` : "pulls/unread_issues/";
      const resp = await store.client.user.get(endpoint);
      return resp.data as any[];
    },
    // short cache; original resource used 5 minute freshness
    staleTime: minutes(5),
  });
}

export function useMarkUnreadIssue() {
  const qc = useQueryClient();
  const store = useContext<Store>(StoreContext);
  return useMutation({
    mutationFn: async (issue: { cv_id: number; pull_id?: number; volume_id: number }) => {
      const issueId = issue.cv_id;
      if (issue.pull_id) {
        await store.client.user.post(`pulls/${issue.pull_id}/mark_read/`, {
          issue_id: issue.cv_id,
        });
      } else {
        await store.mark(String(issue.volume_id), String(issue.cv_id), "READ");
      }
      return issueId;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pulls"] });
      qc.invalidateQueries({ queryKey: ["unread-issues"] });
    },
  });
}
