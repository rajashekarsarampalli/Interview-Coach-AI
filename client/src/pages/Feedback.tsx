import { useRoute } from "wouter";
import { useInterview } from "@/hooks/use-interviews";
import { Loader2, CheckCircle2, AlertCircle, XCircle, Award } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { motion } from "framer-motion";

export default function Feedback() {
  const [match, params] = useRoute("/feedback/:id");
  const interviewId = Number(params?.id);
  const { data: interview, isLoading } = useInterview(interviewId);
  const feedback = interview?.feedback;

  if (isLoading || !interview) return <div className="h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin" /></div>;

  if (!feedback) return (
    <div className="h-screen flex items-center justify-center flex-col gap-4 text-center p-4">
      <AlertCircle className="w-12 h-12 text-amber-500" />
      <h2 className="text-xl font-bold">Feedback Pending</h2>
      <p className="text-muted-foreground">The AI is still analyzing your performance. Check back in a moment.</p>
    </div>
  );

  const categoriesData = Object.entries(feedback.categories || {}).map(([key, val]) => ({
    name: key.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
    score: val.score,
    feedback: val.feedback
  }));

  const overallScore = feedback.overallScore || 0;
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#22c55e"; // Emerald
    if (score >= 60) return "#eab308"; // Yellow
    return "#ef4444"; // Red
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block p-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 mb-4"
          >
            <Award className="w-12 h-12 text-primary" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Interview Analysis</h1>
          <p className="text-xl text-muted-foreground">Here is how you performed in your {interview.type} interview.</p>
        </div>

        {/* Verdict Banner */}
        <div className={`
          p-8 rounded-3xl border text-center relative overflow-hidden
          ${feedback.verdict?.includes('Hire') ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}
        `}>
          <h2 className="text-3xl font-bold mb-2">{feedback.verdict}</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground">{feedback.summary}</p>
        </div>

        {/* Scores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Overall Score Chart */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold text-muted-foreground mb-6">Overall Score</h3>
            <div className="w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ value: overallScore }, { value: 100 - overallScore }]}
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill={getScoreColor(overallScore)} />
                    <Cell fill="#1e293b" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-4xl font-bold">{overallScore}</span>
                <span className="text-xs text-muted-foreground uppercase">Points</span>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="glass-panel p-8 rounded-2xl">
            <h3 className="text-lg font-semibold text-muted-foreground mb-6">Category Breakdown</h3>
            <div className="space-y-6">
              {categoriesData.map((cat) => (
                <div key={cat.name}>
                  <div className="flex justify-between mb-2 text-sm font-medium">
                    <span>{cat.name}</span>
                    <span style={{ color: getScoreColor(cat.score) }}>{cat.score}/10</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.score}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: getScoreColor(cat.score) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Feedback */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-8 rounded-2xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-500">
              <CheckCircle2 className="w-6 h-6" /> Key Strengths
            </h3>
            <ul className="space-y-4">
              {feedback.strengths?.map((item, i) => (
                <li key={i} className="flex gap-3 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-panel p-8 rounded-2xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-amber-500">
              <AlertCircle className="w-6 h-6" /> Areas for Improvement
            </h3>
            <ul className="space-y-4">
              {feedback.improvements?.map((item, i) => (
                <li key={i} className="flex gap-3 text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
