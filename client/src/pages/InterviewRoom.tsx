import { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useInterview, useSendMessage, useEndInterview } from "@/hooks/use-interviews";
import { WebcamPreview } from "@/components/WebcamPreview";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { Loader2, Mic, Send, LogOut, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper to scroll chat to bottom
function useChatScroll(dep: any) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [dep]);
  return ref;
}

export default function InterviewRoom() {
  const { id } = useParams();
  const interviewId = Number(id);
  const [, setLocation] = useLocation();

  const { data: interview, isLoading } = useInterview(interviewId);
  const sendMessage = useSendMessage();
  const endInterview = useEndInterview();

  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  
  const chatContainerRef = useChatScroll(interview?.messages);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    try {
      await sendMessage.mutateAsync({ id: interviewId, content: inputText });
      setInputText("");
    } catch (e) {
      console.error(e);
    }
  };

  const handleEnd = async () => {
    if (confirm("Are you sure you want to end the interview? You will receive feedback immediately.")) {
      await endInterview.mutateAsync(interviewId);
      setLocation(`/feedback/${interviewId}`);
    }
  };

  if (isLoading || !interview) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // Determine who is speaking for visualizer
  const lastMessage = interview.messages?.[interview.messages.length - 1];
  const isAiSpeaking = lastMessage?.role === 'alex' || lastMessage?.role === 'sam';

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
          <h1 className="font-bold text-lg tracking-tight">Interview in Progress</h1>
          <span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground font-mono">
            ID: {interviewId.toString().padStart(4, '0')}
          </span>
        </div>
        <button 
          onClick={handleEnd}
          className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 text-sm font-medium transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" /> End Session
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
        
        {/* Left Column: Webcam & AI Avatars */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
          
          {/* User Webcam */}
          <div className="shrink-0">
            <WebcamPreview />
          </div>

          {/* AI Personas */}
          <div className="flex-1 space-y-4">
            {/* Alex (Technical) */}
            <div className={`
              glass-panel p-4 rounded-xl border transition-all duration-300
              ${lastMessage?.role === 'alex' ? 'border-primary shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'border-border'}
            `}>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  A
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Alex</h3>
                  <p className="text-xs text-primary font-medium">Technical Interviewer</p>
                </div>
                {lastMessage?.role === 'alex' && (
                  <div className="ml-auto">
                    <AudioVisualizer isActive={true} color="bg-primary" />
                  </div>
                )}
              </div>
            </div>

            {/* Sam (Behavioral) */}
            <div className={`
              glass-panel p-4 rounded-xl border transition-all duration-300
              ${lastMessage?.role === 'sam' ? 'border-secondary shadow-[0_0_20px_rgba(124,58,237,0.2)]' : 'border-border'}
            `}>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  S
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Sam</h3>
                  <p className="text-xs text-secondary font-medium">Behavioral Interviewer</p>
                </div>
                {lastMessage?.role === 'sam' && (
                  <div className="ml-auto">
                    <AudioVisualizer isActive={true} color="bg-secondary" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Chat Transcript */}
        <div className="lg:col-span-8 flex flex-col h-full glass-panel rounded-2xl border-white/5 overflow-hidden">
          
          {/* Messages Area */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
          >
            {interview.messages?.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                <MessageSquare className="w-12 h-12 mb-2" />
                <p>Conversation started. Waiting for interviewer...</p>
              </div>
            )}

            <AnimatePresence initial={false}>
              {interview.messages?.map((msg, idx) => (
                <motion.div
                  key={msg.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`
                    max-w-[80%] rounded-2xl p-4 shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-sm' 
                      : msg.role === 'system'
                        ? 'bg-muted/50 text-muted-foreground text-sm w-full text-center italic'
                        : 'bg-card border border-border text-foreground rounded-tl-sm'
                    }
                  `}>
                    {msg.role !== 'user' && msg.role !== 'system' && (
                      <p className={`text-xs font-bold mb-1 ${msg.role === 'alex' ? 'text-blue-400' : 'text-purple-400'}`}>
                        {msg.role.toUpperCase()}
                      </p>
                    )}
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Typing Indicator / Processing */}
            {sendMessage.isPending && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                <div className="bg-blue-600/50 text-white/70 rounded-2xl rounded-tr-sm p-4 text-sm">
                  Sending...
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-card/50 border-t border-border backdrop-blur-sm">
            <div className="flex gap-3">
              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`
                  p-3 rounded-xl transition-all duration-200 border
                  ${isRecording 
                    ? 'bg-red-500/20 text-red-500 border-red-500/50 animate-pulse' 
                    : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
                  }
                `}
                title="Toggle Microphone (Simulation)"
              >
                <Mic className="w-5 h-5" />
              </button>
              
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your answer here..."
                className="flex-1 bg-background border border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                disabled={sendMessage.isPending}
              />
              
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || sendMessage.isPending}
                className="
                  p-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/20
                  hover:bg-primary/90 hover:shadow-primary/40 hover:-translate-y-0.5
                  disabled:opacity-50 disabled:transform-none transition-all duration-200
                "
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Pro tip: Speak clearly and take your time. The AI is listening.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
