import { Link } from "wouter";
import { useInterviews } from "@/hooks/use-interviews";
import { Plus, Clock, ChevronRight, BarChart3, Loader2 } from "lucide-react";
import { INTERVIEW_MODES } from "@shared/schema";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: interviews, isLoading } = useInterviews();

  // Sort interviews by date descending
  const recentInterviews = interviews?.sort((a, b) => 
    new Date(b.startedAt!).getTime() - new Date(a.startedAt!).getTime()
  ) || [];

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome back</h1>
          <p className="text-muted-foreground text-lg">Ready to ace your next interview?</p>
        </div>
        <Link href="/interview/new">
          <div className="
            px-6 py-3 rounded-xl font-semibold bg-primary text-primary-foreground
            shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]
            hover:-translate-y-0.5 transition-all duration-300 cursor-pointer
            flex items-center gap-2
          ">
            <Plus className="w-5 h-5" />
            Start New Session
          </div>
        </Link>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-muted-foreground font-medium mb-1">Total Sessions</h3>
          <p className="text-4xl font-bold">{recentInterviews.length}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-muted-foreground font-medium mb-1">Avg. Score</h3>
          <p className="text-4xl font-bold text-secondary">
            {recentInterviews.length > 0 ? "85" : "-"}
            <span className="text-sm text-muted-foreground font-normal ml-1">%</span>
          </p>
        </div>
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <h3 className="text-muted-foreground font-medium mb-1">Hours Practiced</h3>
          <p className="text-4xl font-bold text-emerald-500">
            {recentInterviews.length > 0 ? (recentInterviews.length * 0.5).toFixed(1) : "0"}
            <span className="text-sm text-muted-foreground font-normal ml-1">hrs</span>
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Activity</h2>
          <Link href="/history">
            <span className="text-primary hover:text-primary/80 cursor-pointer text-sm font-medium flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : recentInterviews.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {recentInterviews.map((interview) => {
              const mode = INTERVIEW_MODES[interview.type as keyof typeof INTERVIEW_MODES];
              return (
                <Link key={interview.id} href={`/interview/${interview.id}`}>
                  <div className="
                    glass-panel p-5 rounded-xl flex items-center gap-4
                    hover:border-primary/30 hover:bg-card/90 transition-all cursor-pointer group
                  ">
                    <div className="w-12 h-12 rounded-lg bg-background flex items-center justify-center text-2xl shadow-inner">
                      {mode?.emoji || "📝"}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                          {mode?.title || interview.type}
                        </h3>
                        {interview.status === 'completed' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-medium border border-emerald-500/20">
                            Completed
                          </span>
                        )}
                        {interview.status === 'in_progress' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium border border-amber-500/20 animate-pulse">
                            In Progress
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {interview.startedAt ? format(new Date(interview.startedAt), 'MMM d, h:mm a') : 'Unknown'}
                        </span>
                        <span>•</span>
                        <span>{interview.candidateName}</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-full text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                      {interview.status === 'completed' ? <BarChart3 className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-card/30 rounded-2xl border border-dashed border-border">
            <h3 className="text-xl font-semibold mb-2">No interviews yet</h3>
            <p className="text-muted-foreground mb-6">Start your first practice session to see your progress.</p>
            <Link href="/interview/new">
              <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors cursor-pointer">
                <Plus className="w-4 h-4" /> Start Now
              </div>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
