import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateInterview } from "@/hooks/use-interviews";
import { INTERVIEW_MODES } from "@shared/schema";
import { Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function NewInterview() {
  const [name, setName] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const createInterview = useCreateInterview();

  const handleStart = async () => {
    if (!name || !selectedType) return;
    
    try {
      const interview = await createInterview.mutateAsync({
        candidateName: name,
        type: selectedType
      });
      setLocation(`/interview/${interview.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">Start a New Session</h1>
          <p className="text-muted-foreground">Choose your role and get ready to practice.</p>
        </div>

        <div className="glass-panel p-6 md:p-8 rounded-2xl space-y-8">
          
          {/* Name Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Candidate Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-lg"
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Select Role</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(INTERVIEW_MODES).map(([key, mode]) => (
                <motion.div
                  key={key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedType(key)}
                  className={`
                    p-4 rounded-xl border cursor-pointer transition-all relative overflow-hidden
                    ${selectedType === key 
                      ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(37,99,235,0.15)]" 
                      : "bg-background/50 border-border hover:bg-background hover:border-border/80"
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{mode.emoji}</span>
                    <div>
                      <h3 className={`font-semibold ${selectedType === key ? "text-primary" : "text-foreground"}`}>
                        {mode.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {mode.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleStart}
            disabled={!name || !selectedType || createInterview.isPending}
            className="
              w-full py-4 rounded-xl font-bold text-lg
              bg-gradient-to-r from-primary to-blue-600 text-white
              shadow-lg shadow-primary/25
              hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              transition-all duration-200 flex items-center justify-center gap-2
            "
          >
            {createInterview.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Preparing Room...
              </>
            ) : (
              <>
                Start Interview <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
