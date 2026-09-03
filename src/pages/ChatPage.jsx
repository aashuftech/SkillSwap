import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowLeftRight, MessageCircle, MessageSquarePlus, Sparkles, UserCheck, Loader2 } from "lucide-react";
import ChatWindow from "../components/chat/ChatWindow";
import { Card, Button } from "../components/ui";
import { authFetch } from "../lib/authFetch";

const ChatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeRoom = searchParams.get("room");
  const queryUser = searchParams.get("user");
  const targetTitle = searchParams.get("title");
  const queryAvatar = searchParams.get("avatar");

  const [conversations, setConversations] = useState([]);
  const [loadingConv, setLoadingConv] = useState(true);
  const [resolvedPartner, setResolvedPartner] = useState({ name: "", avatar: "" });

  const token = localStorage.getItem("authToken");

  const currentUserName = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("skillswapUser") || "{}").name || "";
    } catch {
      return "";
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    setLoadingConv(true);
    authFetch("/api/chat/conversations")
      .then((res) => res.json())
      .then((data) => {
        if (data.conversations && Array.isArray(data.conversations)) {
          setConversations(data.conversations);
          // If no active room in query and conversations exist, select the first one
          if (!activeRoom && data.conversations.length > 0) {
            const first = data.conversations[0];
            const partner = first.partnerName || first.recipientName;
            const params = { room: first.room, user: partner };
            if (first.avatar) params.avatar = first.avatar;
            setSearchParams(params);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingConv(false));
  }, [token, activeRoom, setSearchParams]);

  const selectConversation = (conv) => {
    const partner = conv.partnerName || conv.recipientName;
    setResolvedPartner({ name: partner, avatar: conv.avatar || "" });
    const params = { room: conv.room, user: partner };
    if (conv.avatar) params.avatar = conv.avatar;
    setSearchParams(params);
  };

  const handlePartnerResolved = useCallback((name, avatar) => {
    if (name && name.toLowerCase() !== currentUserName.toLowerCase()) {
      setResolvedPartner({ name, avatar: avatar || "" });
    }
  }, [currentUserName]);

  // Determine active partner name & photo
  const currentConv = conversations.find((c) => c.room === activeRoom);

  let displayPartnerName = resolvedPartner.name;
  if (!displayPartnerName && currentConv) {
    displayPartnerName = currentConv.partnerName || currentConv.recipientName;
  }
  if (!displayPartnerName && queryUser && queryUser.toLowerCase() !== currentUserName.toLowerCase()) {
    displayPartnerName = queryUser;
  }
  if (!displayPartnerName || displayPartnerName.toLowerCase() === currentUserName.toLowerCase()) {
    displayPartnerName = currentConv?.partnerName || currentConv?.recipientName || "Community Member";
  }

  let displayPartnerAvatar = resolvedPartner.avatar;
  if (!displayPartnerAvatar && currentConv?.avatar) {
    displayPartnerAvatar = currentConv.avatar;
  }
  if (!displayPartnerAvatar && queryAvatar) {
    displayPartnerAvatar = queryAvatar;
  }

  // If user is not logged in
  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-[var(--jb-bg)] dark:bg-[#07070D]">
        <Card className="max-w-md w-full p-8 text-center border-violet-100 dark:border-gray-800">
          <MessageCircle size={36} className="text-violet-600 dark:text-violet-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Login to Chat</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            You need to be logged in to send messages and connect with other skill swappers.
          </p>
          <Button to="/login" fullWidth size="lg">
            Log In to Your Account
          </Button>
        </Card>
      </div>
    );
  }

  // If no room is active and there are zero conversations
  if (!activeRoom && conversations.length === 0 && !loadingConv) {
    return (
      <div className="min-h-[85vh] bg-[var(--jb-bg)] dark:bg-[#07070D] px-4 py-12 transition-colors duration-300">
        <div className="max-w-xl mx-auto text-center">
          <div className="rounded-3xl border border-violet-100 dark:border-gray-800 bg-white dark:bg-[#181824] p-8 sm:p-12 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center mx-auto mb-5 text-violet-600 dark:text-violet-400">
              <MessageCircle size={32} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">No conversations yet</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-md mx-auto mb-7">
              You haven't messaged any swappers yet. Browse skills or find a match in Start Swap to start chatting!
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button to="/start-swap" size="md" leftIcon={<Sparkles size={16} />}>
                Find a Skill Swap
              </Button>
              <Button to="/explore" variant="outline" size="md">
                Browse All Skills
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--jb-bg)] dark:bg-[#07070D] px-4 py-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/start-swap"
            className="jb-link inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-violet-700 dark:hover:text-violet-300 transition"
          >
            <ArrowLeft size={15} /> Back to Start Swap
          </Link>
          <Link
            to="/dashboard"
            className="text-xs font-semibold text-violet-700 dark:text-violet-400 hover:underline"
          >
            Go to My Dashboard →
          </Link>
        </div>

        <div className="grid lg:grid-cols-[300px_1fr] gap-6 items-start">
          {/* Conversations sidebar */}
          <div className="space-y-4">
            <Card className="p-4 border-violet-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-3 px-2">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">Conversations</h3>
                <Link
                  to="/start-swap"
                  className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-800 flex items-center gap-1"
                  title="Find a new partner"
                >
                  <MessageSquarePlus size={14} /> New
                </Link>
              </div>

              {loadingConv ? (
                <div className="py-6 text-center">
                  <Loader2 className="animate-spin text-violet-500 mx-auto" size={18} />
                </div>
              ) : conversations.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">No other active chats.</p>
              ) : (
                <div className="space-y-1 max-h-[65vh] overflow-y-auto pr-1">
                  {conversations.map((conv) => {
                    const isSelected = activeRoom === conv.room;
                    const partnerName = conv.partnerName || conv.recipientName;
                    return (
                      <button
                        key={conv.room}
                        type="button"
                        onClick={() => selectConversation(conv)}
                        className={`w-full text-left p-2.5 rounded-xl transition flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? "bg-violet-50 dark:bg-violet-950/60 text-violet-950 dark:text-violet-200 font-semibold border border-violet-200 dark:border-violet-800"
                            : "hover:bg-gray-50 dark:hover:bg-[#1f1d30] text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {conv.avatar ? (
                          <img
                            src={conv.avatar}
                            alt={partnerName}
                            className="w-9 h-9 rounded-full object-cover shrink-0 border border-violet-100 dark:border-gray-700"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {partnerName?.charAt(0) || "U"}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className={`text-xs font-semibold truncate ${isSelected ? "text-violet-950 dark:text-violet-200" : "text-gray-900 dark:text-white"}`}>
                            {partnerName}
                          </p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                            {conv.lastMessage}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Current contact details card */}
            {activeRoom && (
              <Card className="p-5 text-center border-violet-100 dark:border-gray-800">
                {displayPartnerAvatar ? (
                  <img
                    src={displayPartnerAvatar}
                    alt={displayPartnerName}
                    className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border border-violet-100 dark:border-gray-700 shadow-xs"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 flex items-center justify-center font-bold text-xl mx-auto mb-3">
                    {displayPartnerName?.charAt(0) || "U"}
                  </div>
                )}
                <h3 className="font-bold text-gray-900 dark:text-white text-base">{displayPartnerName}</h3>
                {targetTitle ? (
                  <div className="mt-3 rounded-xl bg-violet-50 dark:bg-violet-950/50 p-2.5 text-xs text-violet-900 dark:text-violet-200 border border-violet-100 dark:border-violet-900/40">
                    <p className="font-semibold text-violet-700 dark:text-violet-400">Skill Discussion</p>
                    <p className="mt-0.5">{targetTitle}</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">SkillSwap Community Member</p>
                )}
              </Card>
            )}
          </div>

          {/* Chat Window */}
          {activeRoom ? (
            <ChatWindow
              roomId={activeRoom}
              user={displayPartnerName}
              avatar={displayPartnerAvatar}
              title={targetTitle}
              onPartnerResolved={handlePartnerResolved}
            />
          ) : (
            <div className="bg-white dark:bg-[#181824] rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800 h-[80vh] flex flex-col items-center justify-center">
              <MessageCircle size={36} className="text-violet-400 mb-3" />
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Select a conversation</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose a swapper from the left sidebar to continue chatting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
