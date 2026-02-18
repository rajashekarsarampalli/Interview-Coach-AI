import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateInterviewRequest, type MessageRequest } from "@shared/routes";

// List all interviews
export function useInterviews() {
  return useQuery({
    queryKey: [api.interviews.list.path],
    queryFn: async () => {
      const res = await fetch(api.interviews.list.path);
      if (!res.ok) throw new Error("Failed to fetch interviews");
      return api.interviews.list.responses[200].parse(await res.json());
    },
  });
}

// Get single interview details (including messages & feedback)
export function useInterview(id: number) {
  return useQuery({
    queryKey: [api.interviews.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.interviews.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch interview");
      return api.interviews.get.responses[200].parse(await res.json());
    },
    refetchInterval: (query) => {
      // Poll more frequently if status is in_progress to get new messages
      // Ideally this would be handled via SSE or WebSocket
      const data = query.state.data;
      if (data && data.status === 'in_progress') return 3000;
      return false;
    }
  });
}

// Create new interview
export function useCreateInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateInterviewRequest) => {
      const res = await fetch(api.interviews.create.path, {
        method: api.interviews.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create interview");
      return api.interviews.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.interviews.list.path] });
    },
  });
}

// Send message (User reply)
export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      const url = buildUrl(api.interviews.addMessage.path, { id });
      const res = await fetch(url, {
        method: api.interviews.addMessage.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return api.interviews.addMessage.responses[201].parse(await res.json());
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [api.interviews.get.path, id] });
    },
  });
}

// End interview and generate feedback
export function useEndInterview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.interviews.end.path, { id });
      const res = await fetch(url, { method: api.interviews.end.method });
      if (!res.ok) throw new Error("Failed to end interview");
      return api.interviews.end.responses[200].parse(await res.json());
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [api.interviews.get.path, id] });
      queryClient.invalidateQueries({ queryKey: [api.interviews.list.path] });
    },
  });
}
