import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AudioVisualizerProps {
  isActive: boolean;
  color?: string; // Tailwind color class prefix e.g. "bg-primary"
}

export function AudioVisualizer({ isActive, color = "bg-primary" }: AudioVisualizerProps) {
  const [bars, setBars] = useState<number[]>(Array(5).fill(10));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(5).fill(10));
      return;
    }

    const interval = setInterval(() => {
      setBars(Array(5).fill(0).map(() => Math.random() * 40 + 10));
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="flex items-end justify-center gap-1 h-12">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className={`w-1.5 rounded-full ${color}`}
          animate={{ height: isActive ? height : 4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      ))}
    </div>
  );
}
