import { useState } from "react";
import { useJobs, useAnalyzeResume } from "@/hooks/use-jobs";
import { Upload, FileText, Briefcase, MapPin, Building2, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Job } from "@shared/schema";

export default function Jobs() {
  const { data: jobs, isLoading: jobsLoading } = useJobs();
  const analyzeMutation = useAnalyzeResume();
  const [resumeText, setResumeText] = useState("");
  const [matchedJobs, setMatchedJobs] = useState<Job[]>([]);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    try {
      const result = await analyzeMutation.mutateAsync({ text: resumeText });
      setMatchedJobs(result.matchedJobs);
    } catch (e) {
      console.error(e);
    }
  };

  const displayedJobs = matchedJobs.length > 0 ? matchedJobs : (jobs || []);

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold">Smart Job Matching</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Paste your resume to get AI-powered job recommendations tailored to your skills and experience.
        </p>
      </div>

      {/* Resume Input */}
      <div className="glass-panel p-8 rounded-2xl max-w-4xl mx-auto border-dashed border-2 border-border/50 hover:border-primary/50 transition-colors">
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-2 font-semibold text-lg">
            <FileText className="w-5 h-5 text-primary" />
            Resume Content
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here..."
            className="w-full h-40 bg-background/50 rounded-xl p-4 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none custom-scrollbar"
          />
          <div className="flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={analyzeMutation.isPending || !resumeText}
              className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {analyzeMutation.isPending ? <Loader2 className="animate-spin" /> : <Upload className="w-4 h-4" />}
              Analyze & Find Jobs
            </button>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {jobsLoading ? (
            <div className="col-span-full flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : displayedJobs.map((job, idx) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel p-6 rounded-xl flex flex-col gap-4 group hover:bg-card/90 transition-colors border border-white/5"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center text-2xl border border-white/5">
                  <Building2 className="w-6 h-6 text-muted-foreground" />
                </div>
                {job.matchScore && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-bold border border-emerald-500/20">
                    {job.matchScore}% Match
                  </span>
                )}
              </div>
              
              <div>
                <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <p className="text-muted-foreground">{job.company}</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {job.location}
              </div>

              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {job.description}
              </p>

              <div className="mt-auto pt-4 border-t border-white/5">
                <button className="w-full py-2 rounded-lg bg-muted text-foreground hover:bg-primary hover:text-white transition-all text-sm font-medium">
                  View Details
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
