import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertInterviewSchema, insertMessageSchema } from "@shared/schema";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerAudioRoutes } from "./replit_integrations/audio";
import { registerResumeRoutes } from "./replit_integrations/resume";
import { chatStorage } from "./replit_integrations/chat/storage";
import { openai } from "./replit_integrations/audio/client";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register integrations
  // We use Audio routes for the voice chat features
  registerAudioRoutes(app); 
  registerResumeRoutes(app);

  // Note: We don't use registerChatRoutes because audio routes handle the conversation logic
  // But we might want to expose some basic interview management endpoints manually if needed
  // The integration routes handle /api/conversations/* which map to our interviews

  // Custom Interview Routes (mapping to integration's storage if needed, or using our own)
  // Since we defined 'interviews' table in schema.ts but the integration uses 'conversations',
  // we should probably stick to the integration's routes for consistency or bridge them.
  // The integration provides /api/conversations which is close to /api/interviews.
  
  // Let's implement the specific endpoints defined in shared/routes.ts 
  // that might not be fully covered by the generic integration, or alias them.

  app.post("/api/interviews", async (req, res) => {
    // Alias to creating a conversation
    const { type, candidateName } = req.body;
    // We can store the type/candidateName in the title or a metadata field if we extended it,
    // For now, let's just create a conversation with a descriptive title.
    const title = `${type} Interview - ${candidateName}`;
    
    const conversation = await chatStorage.createConversation(title);
    
    // Return in the format expected by our frontend types if possible, 
    // or just return the conversation object which has id/title/createdAt.
    res.status(201).json(conversation);
  });

  app.get("/api/interviews/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const conversation = await chatStorage.getConversation(id);
    if (!conversation) return res.status(404).json({ message: "Interview not found" });
    
    const messages = await chatStorage.getMessagesByConversation(id);
    res.json({ ...conversation, messages });
  });

  // End interview - generate feedback
  app.post("/api/interviews/:id/end", async (req, res) => {
    const id = parseInt(req.params.id);
    const messages = await chatStorage.getMessagesByConversation(id);
    
    const transcript = messages.map((m: any) => `${m.role}: ${m.content}`).join("\n");
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          {
            role: "system",
            content: `Analyze the following interview transcript and provide detailed feedback.
            Return a JSON object with:
            {
              "overallScore": number (0-10),
              "verdict": "Strong Hire" | "Hire" | "Hold" | "No Hire",
              "summary": "text",
              "categories": {
                "technical": { "score": number, "feedback": "text" },
                "communication": { "score": number, "feedback": "text" },
                "problem_solving": { "score": number, "feedback": "text" },
                "cultural_fit": { "score": number, "feedback": "text" },
                "confidence": { "score": number, "feedback": "text" }
              },
              "strengths": ["text"],
              "improvements": ["text"],
              "recommendation": "text"
            }`
          },
          { role: "user", content: transcript }
        ],
        response_format: { type: "json_object" }
      });
      
      const feedback = JSON.parse(response.choices[0].message.content || "{}");
      res.json(feedback);
      
    } catch (error) {
      console.error("Error generating feedback:", error);
      res.status(500).json({ error: "Failed to generate feedback" });
    }
  });
  
  // Database seed logic
  // ...

  return httpServer;
}
