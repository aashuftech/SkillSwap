import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { getSocket, registerSocketUser, joinSocketChatRoom } from "../lib/socket";

const VideoCallContext = createContext(null);

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

export const VideoCallProvider = ({ children }) => {
  // Call status: "idle" | "calling" | "ringing" | "connected" | "rejected" | "offline" | "ended"
  const [callStatus, setCallStatus] = useState("idle");
  const [incomingCall, setIncomingCall] = useState(null); // { fromUserName, fromUserAvatar, roomId, signalData, fromSocketId }
  const [activePeerName, setActivePeerName] = useState("");
  const [activePeerAvatar, setActivePeerAvatar] = useState("");
  const [activeRoomId, setActiveRoomId] = useState("");
  const [peerSocketId, setPeerSocketId] = useState("");

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Persistent Refs to prevent stale closures inside socket listeners
  const callStatusRef = useRef("idle");
  const incomingCallRef = useRef(null);
  const activePeerNameRef = useRef("");
  const activeRoomIdRef = useRef("");
  const peerSocketIdRef = useRef("");
  const localStreamRef = useRef(null);
  const pcRef = useRef(null);
  const iceCandidatesQueue = useRef([]);
  const callTimeoutRef = useRef(null);

  useEffect(() => {
    callStatusRef.current = callStatus;
  }, [callStatus]);

  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  useEffect(() => {
    activePeerNameRef.current = activePeerName;
  }, [activePeerName]);

  useEffect(() => {
    activeRoomIdRef.current = activeRoomId;
  }, [activeRoomId]);

  useEffect(() => {
    peerSocketIdRef.current = peerSocketId;
  }, [peerSocketId]);

  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  // Clean up all media tracks and peer connection
  const cleanupCall = useCallback(() => {
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);

    if (pcRef.current) {
      try {
        pcRef.current.onicecandidate = null;
        pcRef.current.ontrack = null;
        pcRef.current.close();
      } catch {
        // ignore
      }
      pcRef.current = null;
    }

    iceCandidatesQueue.current = [];
    setCallStatus("idle");
    setIncomingCall(null);
    setActivePeerName("");
    setActivePeerAvatar("");
    setActiveRoomId("");
    setPeerSocketId("");
    setIsAudioMuted(false);
    setIsVideoDisabled(false);
    setStatusMessage("");
  }, []);

  // Helper to acquire local audio + video stream
  const getMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      return stream;
    } catch (err) {
      console.warn("Could not get audio+video stream, trying fallback", err);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setLocalStream(stream);
        localStreamRef.current = stream;
        return stream;
      } catch (err2) {
        alert("Camera/Microphone access is required for video calls. Please allow permissions in browser.");
        throw err2;
      }
    }
  };

  // Create and configure RTCPeerConnection
  const createPeerConnection = useCallback((targetSocketId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    // Send local ICE candidates to peer
    pc.onicecandidate = (event) => {
      const currentTarget = targetSocketId || peerSocketIdRef.current;
      if (event.candidate && currentTarget) {
        const socket = getSocket();
        socket.emit("ice-candidate", {
          toSocketId: currentTarget,
          candidate: event.candidate,
        });
      }
    };

    // Receive remote stream
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        setCallStatus("connected");
        setStatusMessage("");
      } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        cleanupCall();
      }
    };

    return pc;
  }, [cleanupCall]);

  // Set up persistent Socket.IO listeners once on mount
  useEffect(() => {
    const socket = getSocket();

    // Register current user immediately
    try {
      const user = JSON.parse(localStorage.getItem("skillswapUser") || "{}");
      if (user.name) registerSocketUser(user);
    } catch {
      // ignore
    }

    // 1. Incoming Call received from Caller
    const handleIncomingCall = (data) => {
      console.log("[VideoCall] Received incoming-call event:", data);

      // If user is already on another active call, reject busy
      if (callStatusRef.current === "connected" || callStatusRef.current === "calling") {
        socket.emit("reject-call", {
          toSocketId: data.fromSocketId,
          fromUserName: "busy",
        });
        return;
      }

      setIncomingCall(data);
      setActivePeerName(data.fromUserName || "Community Member");
      setActivePeerAvatar(data.fromUserAvatar || "");
      setActiveRoomId(data.roomId || "");
      setPeerSocketId(data.fromSocketId || "");
      setCallStatus("ringing");
    };

    // 2. Caller receives call-accepted from Receiver
    const handleCallAccepted = async (data) => {
      console.log("[VideoCall] Caller received call-accepted:", data);

      if (callTimeoutRef.current) {
        clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }

      if (data.fromSocketId) {
        setPeerSocketId(data.fromSocketId);
        peerSocketIdRef.current = data.fromSocketId;
      }

      setCallStatus("connected");
      setStatusMessage("Connecting video feed...");

      if (pcRef.current && data.signalData) {
        try {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.signalData));
          // Process any queued ICE candidates
          while (iceCandidatesQueue.current.length > 0) {
            const candidate = iceCandidatesQueue.current.shift();
            await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          }
        } catch (err) {
          console.error("Error setting remote description on caller:", err);
        }
      }
    };

    // 3. Caller receives call-rejected
    const handleCallRejected = (data) => {
      console.log("[VideoCall] Call was declined by receiver:", data);
      setCallStatus("rejected");
      setStatusMessage(`${data.fromUserName || "User"} declined the call.`);
      setTimeout(() => {
        cleanupCall();
      }, 2500);
    };

    // 4. Target user is offline
    const handleUserOffline = (data) => {
      console.log("[VideoCall] Target user is offline:", data);
      setCallStatus("offline");
      setStatusMessage(`${data.toUserName || "User"} is currently offline.`);
      setTimeout(() => {
        cleanupCall();
      }, 3000);
    };

    // 5. Caller cancelled before answer
    const handleCallCancelled = () => {
      console.log("[VideoCall] Caller cancelled call");
      cleanupCall();
    };

    // 6. ICE candidate received from peer
    const handleIceCandidate = async (data) => {
      if (!data.candidate) return;
      if (pcRef.current && pcRef.current.remoteDescription && pcRef.current.remoteDescription.type) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.error("Error adding received ICE candidate:", err);
        }
      } else {
        iceCandidatesQueue.current.push(data.candidate);
      }
    };

    // 7. Peer ended the active call
    const handleCallEnded = () => {
      console.log("[VideoCall] Peer ended the call");
      setCallStatus("ended");
      setStatusMessage("Call ended");
      setTimeout(() => {
        cleanupCall();
      }, 1500);
    };

    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("call-rejected", handleCallRejected);
    socket.on("call-user-offline", handleUserOffline);
    socket.on("call-cancelled", handleCallCancelled);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-ended", handleCallEnded);

    return () => {
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("call-rejected", handleCallRejected);
      socket.off("call-user-offline", handleUserOffline);
      socket.off("call-cancelled", handleCallCancelled);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("call-ended", handleCallEnded);
    };
  }, [cleanupCall]);

  // Start Call (Caller User A)
  const startCall = async ({ targetUserName, targetAvatar, roomId }) => {
    if (!targetUserName) return;
    cleanupCall();

    let currentUser = {};
    try {
      currentUser = JSON.parse(localStorage.getItem("skillswapUser") || "{}");
    } catch {
      // ignore
    }

    const currentUserName = currentUser.name || "Member";
    const currentUserAvatar = currentUser.avatar || "";

    setActivePeerName(targetUserName);
    setActivePeerAvatar(targetAvatar || "");
    const actualRoomId = roomId || `room_${Date.now()}`;
    setActiveRoomId(actualRoomId);
    setCallStatus("calling");
    setStatusMessage(`Calling ${targetUserName}...`);

    try {
      const socket = getSocket();
      registerSocketUser(currentUser);
      joinSocketChatRoom(actualRoomId);

      const stream = await getMediaStream();

      // Create peer connection
      const pc = createPeerConnection(null);

      // Add local audio and video tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Create WebRTC Offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
      await pc.setLocalDescription(offer);

      // Send call request to target user
      socket.emit("call-user", {
        toUserName: targetUserName,
        fromUserName: currentUserName,
        fromUserAvatar: currentUserAvatar,
        roomId: actualRoomId,
        signalData: offer,
      });

      // 35s Timeout for No Answer
      callTimeoutRef.current = setTimeout(() => {
        if (callStatusRef.current === "calling") {
          socket.emit("cancel-call", { toUserName: targetUserName, roomId: actualRoomId });
          setCallStatus("offline");
          setStatusMessage(`${targetUserName} did not answer.`);
          setTimeout(() => cleanupCall(), 3000);
        }
      }, 35000);
    } catch (err) {
      console.error("Error starting video call:", err);
      cleanupCall();
    }
  };

  // Accept Incoming Call (Receiver User B)
  const acceptIncomingCall = async () => {
    const callData = incomingCallRef.current || incomingCall;
    if (!callData) return;

    let currentUser = {};
    try {
      currentUser = JSON.parse(localStorage.getItem("skillswapUser") || "{}");
    } catch {
      // ignore
    }

    const currentUserName = currentUser.name || "Member";
    const socket = getSocket();
    const { fromSocketId, roomId, signalData } = callData;

    setCallStatus("connected");
    setStatusMessage("Connecting video stream...");

    try {
      registerSocketUser(currentUser);
      if (roomId) joinSocketChatRoom(roomId);

      const stream = await getMediaStream();
      const pc = createPeerConnection(fromSocketId);

      // Add local tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Set caller's offer as remote description
      if (signalData) {
        await pc.setRemoteDescription(new RTCSessionDescription(signalData));
        // Process queued ICE candidates
        while (iceCandidatesQueue.current.length > 0) {
          const candidate = iceCandidatesQueue.current.shift();
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }

      // Create WebRTC Answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer back to caller
      socket.emit("accept-call", {
        toSocketId: fromSocketId,
        fromUserName: currentUserName,
        signalData: answer,
        roomId,
      });

      setIncomingCall(null);
    } catch (err) {
      console.error("Error accepting call:", err);
      cleanupCall();
    }
  };

  // Reject Incoming Call (Receiver User B)
  const rejectIncomingCall = () => {
    const callData = incomingCallRef.current || incomingCall;
    if (!callData) return;

    const socket = getSocket();
    let currentUser = {};
    try {
      currentUser = JSON.parse(localStorage.getItem("skillswapUser") || "{}");
    } catch {
      // ignore
    }

    socket.emit("reject-call", {
      toSocketId: callData.fromSocketId,
      fromUserName: currentUser.name || "Member",
    });

    cleanupCall();
  };

  // End Call (Either User)
  const endCall = () => {
    const socket = getSocket();
    const targetPeer = activePeerNameRef.current || activePeerName;
    const currentRoom = activeRoomIdRef.current || activeRoomId;
    const currentPeerSocket = peerSocketIdRef.current || peerSocketId;

    if (callStatusRef.current === "calling" && targetPeer) {
      socket.emit("cancel-call", {
        toUserName: targetPeer,
        roomId: currentRoom,
      });
    } else if (currentPeerSocket) {
      socket.emit("end-call", {
        toSocketId: currentPeerSocket,
        roomId: currentRoom,
      });
    }

    cleanupCall();
  };

  // Toggle Audio Mute
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextState = !isAudioMuted;
        audioTracks.forEach((track) => {
          track.enabled = !nextState;
        });
        setIsAudioMuted(nextState);
      }
    }
  };

  // Toggle Video Camera
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const nextState = !isVideoDisabled;
        videoTracks.forEach((track) => {
          track.enabled = !nextState;
        });
        setIsVideoDisabled(nextState);
      }
    }
  };

  return (
    <VideoCallContext.Provider
      value={{
        callStatus,
        incomingCall,
        activePeerName,
        activePeerAvatar,
        activeRoomId,
        localStream,
        remoteStream,
        isAudioMuted,
        isVideoDisabled,
        statusMessage,
        startCall,
        acceptIncomingCall,
        rejectIncomingCall,
        endCall,
        toggleAudio,
        toggleVideo,
      }}
    >
      {children}
    </VideoCallContext.Provider>
  );
};

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error("useVideoCall must be used within a VideoCallProvider");
  }
  return context;
};
