import React, { useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";

/**
 * @param {{text: string, from: "me" | "them", time?: string}[]} messages
 */
const MessageList = ({ messages }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages?.length]);

  if (!messages || messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6 py-16">
        <div className="w-14 h-14 rounded-full bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center mb-4 text-violet-600 dark:text-violet-400">
          <MessageCircle size={26} />
        </div>
        <p className="font-bold text-gray-900 dark:text-white text-base">No messages yet</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Say hi and start the skill swap conversation 👋</p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {messages.map((msg, i) => {
        const isMe = msg.from === "me";
        return (
          <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
            <div
              className={`px-4 py-3 max-w-[80%] sm:max-w-md text-sm leading-relaxed shadow-xs ${
                isMe
                  ? "bg-violet-600 text-white rounded-2xl rounded-br-xs font-medium"
                  : "bg-white dark:bg-[#1E1E2E] text-gray-900 dark:text-white border border-gray-200 dark:border-[#2C2C40] rounded-2xl rounded-bl-xs font-normal"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
              {msg.time && (
                <span className={`block text-[11px] mt-1.5 ${isMe ? "text-violet-200 text-right" : "text-gray-400 dark:text-gray-400 text-left"}`}>
                  {msg.time}
                </span>
              )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
