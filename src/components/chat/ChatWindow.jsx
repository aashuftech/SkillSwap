import React, { useEffect, useState, useRef } from "react";
import { Video, PhoneOff, Send, Loader2, Star, CheckCircle, X } from "lucide-react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { authFetch } from "../../lib/authFetch";
import { useVideoCall } from "../../context/VideoCallContext";
import { joinSocketChatRoom } from "../../lib/socket";

/**
 * @param {object} props
 * @param {string} props.roomId - Unique chat room ID.
 * @param {string} props.user - Display name of the chat partner.
 * @param {string} [props.avatar] - Partner profile photo.
 * @param {string} [props.title] - Skill topic / swap title.
 * @param {function} [props.onPartnerResolved] - Callback when server resolves the other participant's real name & photo.
 */
const ChatWindow = ({ roomId, user, avatar, title, onPartnerResolved }) => {
  const { startCall, endCall, callStatus, activePeerName } = useVideoCall();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [partnerName, setPartnerName] = useState(user || "Community Member");
  const [partnerAvatar, setPartnerAvatar] = useState(avatar || "");
  const [partnerRating, setPartnerRating] = useState(5.0);
  const [partnerRatingCount, setPartnerRatingCount] = useState(0);

  // Rating modal/popover state
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedStars, setSelectedStars] = useState(5);
  const [hoveredStars, setHoveredStars] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratedMsg, setRatedMsg] = useState("");

  const onPartnerResolvedRef = useRef(onPartnerResolved);
  useEffect(() => {
    onPartnerResolvedRef.current = onPartnerResolved;
  }, [onPartnerResolved]);

  useEffect(() => {
    if (user) setPartnerName(user);
    if (avatar !== undefined) setPartnerAvatar(avatar || "");
  }, [user, avatar]);

  // Fetch initial messages and set up silent background polling
  useEffect(() => {
    if (!roomId) return;
    joinSocketChatRoom(roomId);
    let isMounted = true;
    setLoading(true);

    const fetchMessages = (isInitial = false) => {
      authFetch(`/api/chat/messages?room=${encodeURIComponent(roomId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          if (data.messages && Array.isArray(data.messages)) {
            setMessages(data.messages);
          }
          if (data.partner?.name) {
            setPartnerName(data.partner.name);
            if (data.partner.avatar) setPartnerAvatar(data.partner.avatar);
            if (data.partner.rating !== undefined) setPartnerRating(Number(data.partner.rating));
            if (data.partner.ratingCount !== undefined) setPartnerRatingCount(Number(data.partner.ratingCount));
            onPartnerResolvedRef.current?.(data.partner.name, data.partner.avatar);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted && isInitial) {
            setLoading(false);
          }
        });
    };

    fetchMessages(true);

    // Silent background poll every 3 seconds for live message delivery
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [roomId]);

  // Check if current user already rated partner
  useEffect(() => {
    if (!partnerName || partnerName === "Community Member") return;
    authFetch(`/api/ratings/status?targetUserName=${encodeURIComponent(partnerName)}&room=${encodeURIComponent(roomId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.hasRated && data.myRating) {
          setSelectedStars(data.myRating);
          setRatedMsg(`You rated ${partnerName} ${data.myRating} ★`);
        }
        if (data.targetRating !== undefined) setPartnerRating(Number(data.targetRating));
        if (data.targetRatingCount !== undefined) setPartnerRatingCount(Number(data.targetRatingCount));
      })
      .catch(() => {});
  }, [partnerName, roomId]);

  const handleSend = async (text) => {
    if (!text.trim() || !roomId) return;
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const optimisticMsg = { text, from: "me", time };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await authFetch("/api/chat/messages", {
        method: "POST",
        body: JSON.stringify({ room: roomId, text, recipientName: partnerName }),
      });
    } catch {
      // Optimistic message already shown
    }
  };

  const submitRating = async () => {
    if (!selectedStars || !partnerName) return;
    setSubmittingRating(true);
    try {
      const res = await authFetch("/api/ratings", {
        method: "POST",
        body: JSON.stringify({
          targetUserName: partnerName,
          room: roomId,
          rating: selectedStars,
          feedback,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPartnerRating(Number(data.rating));
        setPartnerRatingCount(Number(data.ratingCount));
        setRatedMsg(`You rated ${partnerName} ${selectedStars} ★!`);
        setShowRateModal(false);
      } else {
        alert(data.message || "Failed to submit rating");
      }
    } catch (err) {
      alert("Error submitting rating");
    } finally {
      setSubmittingRating(false);
    }
  };

  const isInCallWithPartner =
    callStatus !== "idle" &&
    activePeerName &&
    activePeerName.toLowerCase() === partnerName.toLowerCase();

  const handleVideoCallClick = () => {
    if (isInCallWithPartner) {
      endCall();
    } else {
      startCall({
        targetUserName: partnerName,
        targetAvatar: partnerAvatar,
        roomId,
      });
    }
  };

  return (
    <div className="bg-white dark:bg-[#151522] rounded-2xl shadow-lg w-full flex flex-col h-[80vh] overflow-hidden border border-gray-200 dark:border-[#2C2C40] transition-colors duration-200">
      {/* Header */}
      <div className="flex justify-between items-center gap-3 border-b border-gray-200 dark:border-[#2C2C40] px-5 py-3.5 bg-white dark:bg-[#151522]">
        <div className="flex items-center gap-3 min-w-0">
          {partnerAvatar ? (
            <img
              src={partnerAvatar}
              alt={partnerName}
              className="w-11 h-11 rounded-xl object-cover shrink-0 ring-2 ring-violet-200 dark:ring-violet-700"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-violet-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
              {partnerName?.charAt(0) ?? "?"}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900 dark:text-white truncate text-base">{partnerName}</h2>
              {partnerRatingCount > 0 && partnerRating ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-700/80 px-2 py-0.5 rounded-full shrink-0">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  {Number(partnerRating).toFixed(1)} ({partnerRatingCount})
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
              {title && (
                <span className="text-xs text-gray-400 dark:text-gray-400 truncate max-w-[180px]">· {title}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Rate Button */}
          <button
            onClick={() => setShowRateModal((prev) => !prev)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/80 text-amber-900 dark:text-amber-200 transition cursor-pointer"
            title="Rate this swapper"
          >
            <Star size={13} className="fill-amber-400 text-amber-500" />
            <span className="hidden sm:inline">{ratedMsg ? "Rated ★" : "Rate User"}</span>
          </button>

          {/* Video Call */}
          <button
            onClick={handleVideoCallClick}
            aria-label={isInCallWithPartner ? "End video call" : "Start video call"}
            className={`button-anim flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
              isInCallWithPartner
                ? "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 hover:bg-red-100"
                : "bg-violet-600 text-white hover:bg-violet-700"
            }`}
          >
            {isInCallWithPartner ? <PhoneOff size={14} /> : <Video size={14} />}
            <span className="hidden sm:inline">{isInCallWithPartner ? "End Call" : "Video Call"}</span>
          </button>
        </div>
      </div>

      {/* Interactive 5-Star Rating Modal/Panel */}
      {showRateModal && (
        <div className="bg-amber-50/95 dark:bg-[#201D14] border-b border-amber-200 dark:border-amber-800/80 px-5 py-4 animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
              <Star size={15} className="fill-amber-500 text-amber-500" /> Rate your swap experience with {partnerName}
            </h4>
            <button
              onClick={() => setShowRateModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
            Your rating helps build trust and will be publicly displayed on {partnerName}'s skill cards across SkillSwap.
          </p>

          <div className="flex items-center gap-1.5 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredStars(star)}
                onMouseLeave={() => setHoveredStars(0)}
                onClick={() => setSelectedStars(star)}
                className="p-1 hover:scale-120 transition-transform cursor-pointer"
              >
                <Star
                  size={26}
                  className={`${
                    (hoveredStars || selectedStars) >= star
                      ? "fill-amber-400 text-amber-500"
                      : "text-gray-300 dark:text-gray-600 fill-transparent"
                  } transition-colors`}
                />
              </button>
            ))}
            <span className="ml-2 font-bold text-sm text-gray-800 dark:text-gray-200">
              {hoveredStars || selectedStars} / 5 Stars
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Optional: What was great about this swap?"
              className="flex-1 bg-white dark:bg-[#151522] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              onClick={submitRating}
              disabled={submittingRating}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shrink-0 disabled:opacity-50"
            >
              {submittingRating ? "Saving..." : "Submit Rating"}
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex flex-col flex-grow overflow-hidden">
        <div className="flex-grow overflow-y-auto px-4 py-4 bg-[#FAF9FF] dark:bg-[#0D0D14]">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="animate-spin text-violet-500" size={26} />
            </div>
          ) : (
            <MessageList messages={messages} />
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-[#2C2C40] p-3 bg-white dark:bg-[#151522]">
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
};

export default ChatWindow;
