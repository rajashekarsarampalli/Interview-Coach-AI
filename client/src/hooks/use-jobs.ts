import { useQuery, useMutation } from "@tanstack/react-query";
import { api, type ResumeUploadRequest } from "@shared/routes";

// List jobs
export function useJobs() {
  return useQuery({
    queryKey: [api.jobs.list.path],
    queryFn: async () => {
      const res = await fetch(api.jobs.list.path);
      if (!res.ok) throw new Error("Failed to fetch jobs");
      return api.jobs.list.responses[200].parse(await res.json());
    },
  });
}

// Analyze resume
export function useAnalyzeResume() {
  return useMutation({
    mutationFn: async (data: ResumeUploadRequest) => {
      const res = await fetch(api.resume.analyze.path, {
        method: api.resume.analyze.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to analyze resume");
      return api.resume.analyze.responses[200].parse(await res.json());
    },
  });
}
