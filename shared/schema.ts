import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  resumeText: text("resume_text"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Conversations (Merged Interviews + Chat Integration)
// Integration expects: id, title, createdAt
// App expects: type, candidateName, status, startedAt, completedAt, userId
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(), // Required by integration
  type: text("type"), // 'software_engineer', 'frontend', etc.
  candidateName: text("candidate_name"),
  status: text("status").default("in_progress"), // 'in_progress', 'completed'
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(), // Required by integration
});

// Messages (Transcript)
// Integration expects: id, conversationId, role, content, createdAt
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user', 'assistant' (integration uses 'assistant', app used 'alex'/'sam' - map them to assistant or extend role)
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Feedback / Analysis
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id), // Changed from interviewId
  overallScore: integer("overall_score"),
  verdict: text("verdict"),
  summary: text("summary"),
  categories: jsonb("categories").$type<{
    technical: { score: number; feedback: string };
    communication: { score: number; feedback: string };
    problem_solving: { score: number; feedback: string };
    cultural_fit: { score: number; feedback: string };
    confidence: { score: number; feedback: string };
  }>(),
  strengths: jsonb("strengths").$type<string[]>(),
  improvements: jsonb("improvements").$type<string[]>(),
  integrityNote: text("integrity_note"),
  recommendation: text("recommendation"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Job Recommendations
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  requirements: jsonb("requirements").$type<string[]>(),
  matchScore: integer("match_score"),
});

// === RELATIONS ===
export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  user: one(users, {
    fields: [conversations.userId],
    references: [users.id],
  }),
  messages: many(messages),
  feedback: one(feedback, {
    fields: [conversations.id],
    references: [feedback.conversationId],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  conversation: one(conversations, {
    fields: [feedback.conversationId],
    references: [conversations.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true, startedAt: true, completedAt: true, status: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertFeedbackSchema = createInsertSchema(feedback).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export type Job = typeof jobs.$inferSelect;

// Legacy alias for compatibility if needed
export const interviews = conversations;
export type Interview = Conversation;

// Request types
export type CreateInterviewRequest = {
  type: string;
  candidateName: string;
};

export const INTERVIEW_MODES = {
  software_engineer: {
    title: "Software Engineer", 
    emoji: "💻",
    description: "Algorithms, system design, databases"
  },
  frontend: {
    title: "Frontend Developer", 
    emoji: "🎨",
    description: "React, CSS, performance, accessibility"
  },
  data_science: {
    title: "Data Scientist", 
    emoji: "📊",
    description: "ML algorithms, statistics, python, SQL"
  },
  product_manager: {
    title: "Product Manager", 
    emoji: "🗂️",
    description: "Product vision, prioritization, user research"
  }
};
