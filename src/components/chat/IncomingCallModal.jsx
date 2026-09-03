import React from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import { useVideoCall } from "../../context/VideoCallContext";

export default function IncomingCallModal() {
  const { incomingCall, callStatus, acceptIncomingCall, rejectIncomingCall } = useVideoCall();

  if (callStatus !== "ringing" || !incomingCall) {
    return null;
  }

  const callerName = incomingCall.fromUserName || "Community Member";
  const callerAvatar = incomingCall.fromUserAvatar || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#181824] p-7 shadow-2xl border border-violet-100 dark:border-violet-900/60 text-center animate-bounce-short">
        {/* Pulsing ring around avatar */}
        <div className="relative mx-auto w-24 h-24 mb-5 flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-violet-400 dark:bg-violet-600 opacity-25 animate-ping" />
          <span className="absolute inset-[-8px] rounded-full border-2 border-violet-500/40 animate-pulse" />
          {callerAvatar ? (
            <img
              src={callerAvatar}
              alt={callerName}
              className="relative w-20 h-20 rounded-full object-cover border-3 border-white dark:border-gray-800 shadow-md"
            />
          ) : (
            <div className="relative w-20 h-20 rounded-full bg-violet-600 text-white font-bold text-3xl flex items-center justify-center border-3 border-white dark:border-gray-800 shadow-md">
              {callerName.charAt(0) || "U"}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-1">
          <Video size={14} className="animate-pulse" /> Incoming Video Swap Call
        </div>
        <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">{callerName}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-7">
          wants to connect with you via live 1-to-1 video call.
        </p>

        {/* Action Buttons: Accept / Reject */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={rejectIncomingCall}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <PhoneOff size={16} /> Decline
          </button>

          <button
            onClick={acceptIncomingCall}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm shadow-md transition-all cursor-pointer animate-pulse"
          >
            <Phone size={16} /> Accept Call
          </button>
        </div>
      </div>
    </div>
  );
}
