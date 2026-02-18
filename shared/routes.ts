import { z } from 'zod';
import { conversations, messages, feedback, jobs } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  interviews: {
    create: {
      method: 'POST' as const,
      path: '/api/interviews' as const,
      input: z.object({
        type: z.string(),
        candidateName: z.string(),
      }),
      responses: {
        201: z.custom<typeof conversations.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/interviews/:id' as const,
      responses: {
        200: z.custom<typeof conversations.$inferSelect & { messages?: (typeof messages.$inferSelect)[], feedback?: typeof feedback.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/interviews' as const,
      responses: {
        200: z.array(z.custom<typeof conversations.$inferSelect>()),
      },
    },
    addMessage: {
      method: 'POST' as const,
      path: '/api/interviews/:id/messages' as const,
      input: z.object({
        content: z.string(),
      }),
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    end: {
      method: 'POST' as const,
      path: '/api/interviews/:id/end' as const,
      responses: {
        200: z.custom<typeof feedback.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  resume: {
    analyze: {
      method: 'POST' as const,
      path: '/api/resume/analyze' as const,
      input: z.object({
        text: z.string(),
      }),
      responses: {
        200: z.object({
          message: z.string(),
          matchedJobs: z.array(z.custom<typeof jobs.$inferSelect>()),
        }),
      },
    }
  },
  jobs: {
    list: {
      method: 'GET' as const,
      path: '/api/jobs' as const,
      responses: {
        200: z.array(z.custom<typeof jobs.$inferSelect>()),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
