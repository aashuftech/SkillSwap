import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Loader2, Sparkles, User } from "lucide-react";
import { useVideoCall } from "../../context/VideoCallContext";

export default function VideoCallModal() {
  const {
    callStatus,
    activePeerName,
    activePeerAvatar,
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoDisabled,
    statusMessage,
    endCall,
    toggleAudio,
    toggleVideo,
  } = useVideoCall();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [callDuration, setCallDuration] = useState(0);

  // Attach local stream to local video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callStatus]);

  // Attach remote stream to remote video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callStatus]);

  // Call timer when connected
  useEffect(() => {
    let timer = null;
    if (callStatus === "connected") {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callStatus]);

  // Format seconds into MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remSecs.toString().padStart(2, "0")}`;
  };

  // Only render modal when in calling / connected / status display states
  if (callStatus === "idle" || callStatus === "ringing") {
    return null;
  }

  const isConnected = callStatus === "connected";
  const hasRemoteVideo = isConnected && remoteStream && remoteStream.getVideoTracks().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl h-[85vh] max-h-[720px] rounded-3xl bg-[#0F0F17] border border-gray-800 shadow-2xl overflow-hidden flex flex-col justify-between">
        {/* Header Overlay */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-3">
            {activePeerAvatar ? (
              <img
                src={activePeerAvatar}
                alt={activePeerName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-violet-500/60"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-sm ring-2 ring-violet-500/60">
                {activePeerName?.charAt(0) || "U"}
              </div>
            )}
            <div>
              <h3 className="font-bold text-white text-base leading-snug">{activePeerName || "Skill Swapper"}</h3>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Connected · {formatTime(callDuration)}
                  </span>
                ) : (
                  <span className="text-xs text-violet-300 font-medium flex items-center gap-1.5">
                    <Loader2 size={12} className="animate-spin" />
                    {statusMessage || "Calling..."}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-semibold text-gray-300">
            <Sparkles size={13} className="text-violet-400" /> SkillSwap 1-on-1 Video
          </div>
        </div>

        {/* Video Display Area */}
        <div className="relative flex-1 w-full h-full bg-[#0D0D14] flex items-center justify-center overflow-hidden">
          {/* Main Feed: Remote Video if connected, else Waiting view */}
          {isConnected && remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="relative">
                <span className="absolute inset-0 rounded-full bg-violet-500/20 animate-ping" />
                {activePeerAvatar ? (
                  <img
                    src={activePeerAvatar}
                    alt={activePeerName}
                    className="relative w-28 h-28 rounded-full object-cover border-4 border-violet-500/40 shadow-xl"
                  />
                ) : (
                  <div className="relative w-28 h-28 rounded-full bg-violet-700 text-white font-bold text-4xl flex items-center justify-center border-4 border-violet-500/40 shadow-xl">
                    {activePeerName?.charAt(0) || "U"}
                  </div>
                )}
              </div>

              <div>
                <h4 className="text-xl font-bold text-white mb-1.5">{activePeerName}</h4>
                <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
                  {!isConnected && <Loader2 size={14} className="animate-spin text-violet-400" />}
                  {statusMessage || "Waiting for partner to accept call..."}
                </p>
              </div>
            </div>
          )}

          {/* Picture-in-Picture (Local Video) */}
          <div className="absolute bottom-24 right-4 sm:right-6 z-20 w-32 sm:w-48 h-24 sm:h-36 bg-gray-900/90 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl backdrop-blur-md">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isVideoDisabled ? "hidden" : "block"}`}
            />
            {isVideoDisabled && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-gray-400 text-xs">
                <VideoOff size={18} className="mb-1 text-gray-500" />
                <span>Camera Off</span>
              </div>
            )}
            <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full border border-white/10">
              You {isAudioMuted && "(Muted)"}
            </span>
          </div>
        </div>

        {/* Bottom Floating Controls */}
        <div className="relative z-20 flex items-center justify-center gap-4 sm:gap-6 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          {/* Mute Mic */}
          <button
            type="button"
            onClick={toggleAudio}
            aria-label={isAudioMuted ? "Unmute Microphone" : "Mute Microphone"}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 ${
              isAudioMuted
                ? "bg-red-500/90 text-white hover:bg-red-600 ring-4 ring-red-500/20"
                : "bg-gray-800/90 text-white hover:bg-gray-700 ring-2 ring-white/10"
            }`}
            title={isAudioMuted ? "Unmute Mic" : "Mute Mic"}
          >
            {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Toggle Camera */}
          <button
            type="button"
            onClick={toggleVideo}
            aria-label={isVideoDisabled ? "Turn Camera On" : "Turn Camera Off"}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 ${
              isVideoDisabled
                ? "bg-red-500/90 text-white hover:bg-red-600 ring-4 ring-red-500/20"
                : "bg-gray-800/90 text-white hover:bg-gray-700 ring-2 ring-white/10"
            }`}
            title={isVideoDisabled ? "Turn Camera On" : "Turn Camera Off"}
          >
            {isVideoDisabled ? <VideoOff size={20} /> : <VideoIcon size={20} />}
          </button>

          {/* End Call (Red) */}
          <button
            type="button"
            onClick={endCall}
            aria-label="End Video Call"
            className="px-6 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-xl active:scale-95 hover:shadow-red-600/40"
            title="End Call"
          >
            <PhoneOff size={18} />
            <span className="hidden sm:inline">End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
}
