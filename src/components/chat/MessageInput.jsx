import React, { useState } from "react";
import { Send } from "lucide-react";

const MessageInput = ({ onSend }) => {
  const [msg, setMsg] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    onSend(msg);
    setMsg("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Type a message..."
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        className="flex-grow bg-gray-100 border border-transparent rounded-full px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-[var(--jb-primary)] focus:bg-white transition-colors"
      />
      <button
        type="submit"
        disabled={!msg.trim()}
        aria-label="Send message"
        className="button-anim shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-[var(--jb-primary)] text-white hover:bg-[var(--jb-accent-dark)] transition disabled:opacity-40 disabled:pointer-events-none"
      >
        <Send size={16} />
      </button>
    </form>
  );
};

export default MessageInput;
