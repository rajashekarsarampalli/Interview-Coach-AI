import { Camera, CameraOff } from "lucide-react";
import { useState } from "react";
import Webcam from "react-webcam";

export function WebcamPreview() {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
      {enabled ? (
        <Webcam
          audio={false}
          className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
          videoConstraints={{
            facingMode: "user",
            width: 1280,
            height: 720
          }}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-muted/20 text-muted-foreground">
          <CameraOff className="w-12 h-12 mb-2 opacity-50" />
          <p className="text-sm font-medium">Camera Disabled</p>
        </div>
      )}

      {/* Camera Toggle Overlay */}
      <button
        onClick={() => setEnabled(!enabled)}
        className="absolute bottom-4 right-4 p-2.5 rounded-full bg-black/50 backdrop-blur-md text-white/70 hover:text-white hover:bg-black/70 transition-all border border-white/10 opacity-0 group-hover:opacity-100"
      >
        {enabled ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
      </button>

      {/* Recording Indicator */}
      <div className="absolute top-4 left-4 flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/5">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-xs font-medium text-white/90">LIVE</span>
      </div>
    </div>
  );
}
