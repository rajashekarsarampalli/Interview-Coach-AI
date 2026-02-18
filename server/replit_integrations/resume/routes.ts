import { type Express, type Request, type Response } from "express";
import { openai } from "../audio/client"; // Use audio client which exports openai
import { jobs } from "@shared/schema";

export function registerResumeRoutes(app: Express): void {
  app.post("/api/resume/analyze", async (req: Request, res: Response) => {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ error: "Resume text is required" });
      }

      // Analyze resume and generate job recommendations
      const response = await openai.chat.completions.create({
        model: "gpt-5.1", // Using high-quality model for better analysis
        messages: [
          {
            role: "system",
            content: `You are an expert career coach and job market analyst. 
            Analyze the provided resume text.
            1. Identify key skills and experience level.
            2. Suggest 5 specific, relevant job titles and simulated job listings that would be a good fit.
            3. For each job, provide a company name, location, and a brief description.
            4. Provide a 'matchScore' (0-100) based on how well the resume fits.
            5. Provide a list of 'requirements' for each job.
            
            Return ONLY a JSON object with this structure:
            {
              "message": "Analysis summary...",
              "matchedJobs": [
                {
                  "title": "Job Title",
                  "company": "Company Name",
                  "location": "Location",
                  "description": "Brief description...",
                  "requirements": ["req1", "req2"],
                  "matchScore": 85
                }
              ]
            }`
          },
          {
            role: "user",
            content: text
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      // In a real app, we might save these to the DB, but for now just return them
      // We could also mix in some "scraped" results here if we had a scraping service.
      // For "simulated reliability", the AI generated jobs are consistent with the resume.

      res.json(result);

    } catch (error) {
      console.error("Error analyzing resume:", error);
      res.status(500).json({ error: "Failed to analyze resume" });
    }
  });

  app.get("/api/jobs", async (req: Request, res: Response) => {
    // Return some mock jobs or fetch from DB if we saved them
    // For now, let's just return an empty list or some statics
    res.json([]); 
  });
}
