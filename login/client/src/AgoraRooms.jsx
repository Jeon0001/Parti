import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import useAgoraScripts from "./agora/useAgoraScripts";
import "./agora/AgoraRooms.css";

const defaultRooms = [
  { name: "Courtside-Chat", description: "Quick drop-in voice + text" },
  { name: "Team-Huddle", description: "Invite friends to strategize" },
];

export default function AgoraRooms() {
  const { ready: scriptsReady, error: scriptError } = useAgoraScripts();
  const [appId, setAppId] = useState("");
  const [rtcToken, setRtcToken] = useState("");
  const [rtmToken, setRtmToken] = useState("");
  const [userId, setUserId] = useState("user-1");
  const [rooms, setRooms] = useState(defaultRooms);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [logs, setLogs] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [currentRoom, setCurrentRoom] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("idle");
  const [microphones, setMicrophones] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [selectedMic, setSelectedMic] = useState("");
  const [selectedSpeaker, setSelectedSpeaker] = useState("");
  const [muted, setMuted] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [chatError, setChatError] = useState("");
  const [voiceError, setVoiceError] = useState("");

  const rtcClientRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const rtmClientRef = useRef(null);
  const rtmChannelRef = useRef(null);

  const addLog = (entry) => {
    setLogs((prev) => [
      { id: `${Date.now()}-${Math.random()}`, message: entry },
      ...prev,
    ].slice(0, 40));
  };

  const scriptsMessage = useMemo(() => {
    if (scriptError) {
      return "Failed to load the Agora SDKs. Please check your network.";
    }
    if (!scriptsReady) {
      return "Loading Agora SDKs from CDN...";
    }
    return "Agora voice and chat SDKs loaded.";
  }, [scriptError, scriptsReady]);

  const ensureRtcClient = () => {
    if (!window.AgoraRTC) throw new Error("AgoraRTC script not ready");
    if (!rtcClientRef.current) {
      const client = window.AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      client.on("user-published", handleUserPublished);
      client.on("user-unpublished", handleUserUnpublished);
      rtcClientRef.current = client;
    }
    return rtcClientRef.current;
  };

  const ensureRtmClient = async () => {
    if (!window.AgoraRTM) throw new Error("AgoraRTM script not ready");
    if (!rtmClientRef.current) {
      rtmClientRef.current = window.AgoraRTM.createInstance(appId);
    }
    const client = rtmClientRef.current;
    const status = client.connectionState;
    if (status !== "CONNECTED") {
      await client.login({ uid: userId, token: rtmToken || null });
      addLog(`RTM connected as ${userId}`);
    }
    return client;
  };

  const collectDevices = async () => {
    if (!window.AgoraRTC) return;
    const devices = await window.AgoraRTC.getMicrophones();
    const outputs = await window.AgoraRTC.getPlaybackDevices();
    setMicrophones(devices);
    setSpeakers(outputs);
    if (!selectedMic && devices[0]) setSelectedMic(devices[0].deviceId);
    if (!selectedSpeaker && outputs[0]) setSelectedSpeaker(outputs[0].deviceId);
  };

  const handleUserPublished = async (user, mediaType) => {
    const client = rtcClientRef.current;
    if (!client) return;
    await client.subscribe(user, mediaType);
    if (mediaType === "audio") {
      const audioTrack = user.audioTrack;
      if (selectedSpeaker && audioTrack?.setPlaybackDevice) {
        await audioTrack.setPlaybackDevice(selectedSpeaker);
      }
      audioTrack.play();
      setRemoteUsers((prev) => {
        const filtered = prev.filter((u) => u.uid !== user.uid);
        return [...filtered, { uid: user.uid, audioTrack }];
      });
      addLog(`Subscribed to ${user.uid}'s audio`);
    }
  };

  const handleUserUnpublished = (user) => {
    setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    addLog(`User ${user.uid} left the room`);
  };

  const joinRoom = async (room) => {
    try {
      setVoiceError("");
      setChatError("");
      if (!scriptsReady) throw new Error("SDKs still loading");
      if (!appId || !userId) throw new Error("Provide App ID and a unique user ID");
      if (currentRoom?.name !== room.name) await leaveRoom();

      const client = ensureRtcClient();
      setConnectionStatus("joining");
      const uid = await client.join(appId, room.name, rtcToken || null, userId || null);
      addLog(`Joined RTC channel ${room.name} as ${uid}`);
      await collectDevices();
      const track = await window.AgoraRTC.createMicrophoneAudioTrack(
        selectedMic ? { microphoneId: selectedMic } : undefined,
      );
      localAudioTrackRef.current = track;
      await client.publish([track]);
      setMuted(false);
      setCurrentRoom(room);
      setConnectionStatus("joined");
      addLog("Microphone published");

      await ensureRtmClient();
      await joinRtmChannel(room.name);
    } catch (err) {
      console.error(err);
      setVoiceError(err.message);
      setConnectionStatus("idle");
    }
  };

  const joinRtmChannel = async (channelName) => {
    if (!rtmClientRef.current) return;
    if (rtmChannelRef.current) {
      await rtmChannelRef.current.leave();
      rtmChannelRef.current.off?.("ChannelMessage");
    }
    const channel = rtmClientRef.current.createChannel(channelName);
    channel.on("ChannelMessage", ({ text }, senderId) => {
      setChatMessages((prev) => [...prev, { sender: senderId, text, ts: Date.now() }]);
    });
    await channel.join();
    rtmChannelRef.current = channel;
    addLog(`Joined chat for ${channelName}`);
  };

  const leaveRoom = async () => {
    try {
      if (rtmChannelRef.current) {
        await rtmChannelRef.current.leave();
        rtmChannelRef.current = null;
      }
      if (rtmClientRef.current?.connectionState === "CONNECTED") {
        await rtmClientRef.current.logout();
      }
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      if (rtcClientRef.current) {
        await rtcClientRef.current.leave();
        rtcClientRef.current.removeAllListeners();
        rtcClientRef.current = null;
      }
      setCurrentRoom(null);
      setConnectionStatus("idle");
      setRemoteUsers([]);
      addLog("Left the current room");
    } catch (err) {
      console.error(err);
    }
  };

  const toggleMute = async () => {
    const track = localAudioTrackRef.current;
    if (!track) return;
    const nextMuted = !muted;
    await track.setEnabled(!nextMuted);
    setMuted(nextMuted);
  };

  const handleSendMessage = async (evt) => {
    evt.preventDefault();
    if (!messageInput.trim()) return;
    if (!rtmChannelRef.current) {
      setChatError("Join a room to send messages.");
      return;
    }
    try {
      await rtmChannelRef.current.sendMessage({ text: messageInput });
      setChatMessages((prev) => [...prev, { sender: userId, text: messageInput, ts: Date.now() }]);
      setMessageInput("");
    } catch (err) {
      setChatError(err.message);
    }
  };

  const handleCreateRoom = (evt) => {
    evt.preventDefault();
    if (!newRoomName.trim()) return;
    const room = {
      name: newRoomName.trim(),
      description: newRoomDescription.trim() || "Custom room",
    };
    setRooms((prev) => [...prev, room]);
    setNewRoomName("");
    setNewRoomDescription("");
  };

  const handleMicChange = async (value) => {
    setSelectedMic(value);
    if (localAudioTrackRef.current) {
      await localAudioTrackRef.current.setDevice(value);
      addLog(`Microphone switched to ${value}`);
    }
  };

  const handleSpeakerChange = async (value) => {
    setSelectedSpeaker(value);
    setRemoteUsers((prev) => {
      prev.forEach((u) => u.audioTrack?.setPlaybackDevice?.(value));
      return [...prev];
    });
  };

  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, []);

  return (
    <div className="agora-page">
      <div className="agora-header">
        <div>
          <h1 className="agora-title">Agora Voice + Chat Rooms</h1>
          <p className="agora-badge">{scriptsMessage}</p>
        </div>
        <Link to="/dashboard" className="agora-button secondary">Back to dashboard</Link>
      </div>

      <div className="agora-credentials agora-section">
        <h3>Credentials</h3>
        <div className="agora-grid">
          <div className="agora-field">
            <label>Agora App ID (RTC + RTM)</label>
            <input className="agora-input" value={appId} onChange={(e) => setAppId(e.target.value)} placeholder="Enter your Agora App ID" />
          </div>
          <div className="agora-field">
            <label>RTC Token (leave empty for temporary testing)</label>
            <input className="agora-input" value={rtcToken} onChange={(e) => setRtcToken(e.target.value)} placeholder="Token for voice channel" />
          </div>
          <div className="agora-field">
            <label>RTM Token</label>
            <input className="agora-input" value={rtmToken} onChange={(e) => setRtmToken(e.target.value)} placeholder="Token for chat" />
          </div>
          <div className="agora-field">
            <label>User ID</label>
            <input className="agora-input" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Unique user name" />
          </div>
        </div>
        <p className="agora-alert">Use the same App ID for RTC and RTM. Tokens should be generated per channel and user on your server for production.</p>
      </div>

      <div className="agora-panels">
        <div className="agora-section">
          <h3>Create or Join a Room</h3>
          <form onSubmit={handleCreateRoom} className="agora-grid" style={{ marginBottom: 12 }}>
            <div className="agora-field">
              <label>Room name</label>
              <input className="agora-input" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} placeholder="e.g. Strategy-Lab" />
            </div>
            <div className="agora-field">
              <label>Description</label>
              <input className="agora-input" value={newRoomDescription} onChange={(e) => setNewRoomDescription(e.target.value)} placeholder="Optional" />
            </div>
            <div className="agora-field" style={{ justifyContent: "flex-end" }}>
              <button className="agora-button" type="submit">Create room</button>
            </div>
          </form>

          <div className="agora-room-list">
            {rooms.map((room) => (
              <div key={room.name} className="agora-room-card">
                <div>
                  <strong>{room.name}</strong>
                  <p style={{ margin: 0, color: "#475569" }}>{room.description}</p>
                </div>
                <div className="agora-room-actions">
                  <span className="agora-status">{currentRoom?.name === room.name ? "In room" : "Ready"}</span>
                  <button className="agora-button" type="button" onClick={() => joinRoom(room)} disabled={!scriptsReady || connectionStatus === "joining"}>
                    Join room
                  </button>
                  {currentRoom?.name === room.name && (
                    <button className="agora-button secondary" type="button" onClick={leaveRoom}>
                      Leave
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="agora-section" style={{ marginTop: 14 }}>
            <h3>Audio controls</h3>
            <div className="agora-devices">
              <div className="agora-field">
                <label>Microphone</label>
                <select className="agora-select" value={selectedMic} onChange={(e) => handleMicChange(e.target.value)} disabled={!currentRoom}>
                  {microphones.map((mic) => (
                    <option key={mic.deviceId} value={mic.deviceId}>{mic.label || mic.deviceId}</option>
                  ))}
                </select>
              </div>
              <div className="agora-field">
                <label>Playback device</label>
                <select className="agora-select" value={selectedSpeaker} onChange={(e) => handleSpeakerChange(e.target.value)} disabled={!currentRoom}>
                  {speakers.map((speaker) => (
                    <option key={speaker.deviceId} value={speaker.deviceId}>{speaker.label || speaker.deviceId}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
              <button className="agora-button" type="button" onClick={toggleMute} disabled={!currentRoom}>
                {muted ? "Unmute" : "Mute"}
              </button>
            </div>
            {voiceError && <div className="agora-alert">{voiceError}</div>}
          </div>

          <div className="agora-section" style={{ marginTop: 14 }}>
            <h3>Remote listeners</h3>
            {remoteUsers.length === 0 && <p className="agora-badge">No remote audio yet</p>}
            <div className="agora-chip-list">
              {remoteUsers.map((user) => (
                <span key={user.uid} className="agora-chip">User {user.uid}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="agora-section">
          <h3>Live chat</h3>
          <div className="agora-chat">
            <div className="agora-chat-messages">
              {chatMessages.map((msg) => (
                <div key={msg.ts + msg.sender} className="agora-message">
                  <strong>{msg.sender}</strong>
                  <span>{msg.text}</span>
                </div>
              ))}
              {chatMessages.length === 0 && <p style={{ color: "#475569" }}>No messages yet. Join a room to start chatting.</p>}
            </div>
            <form className="agora-footer-form" onSubmit={handleSendMessage}>
              <textarea className="agora-textarea" rows="2" placeholder="Say hi to everyone in the room" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} disabled={!currentRoom}></textarea>
              <button className="agora-button" type="submit" disabled={!currentRoom}>Send</button>
            </form>
            {chatError && <div className="agora-alert">{chatError}</div>}
          </div>

          <div className="agora-section" style={{ marginTop: 14 }}>
            <h3>Recent events</h3>
            <div className="agora-logs">
              <div className="agora-logs-list">
                {logs.map((log) => (
                  <div key={log.id} className="agora-message" style={{ background: "#f1f5f9" }}>
                    <span>{log.message}</span>
                  </div>
                ))}
                {logs.length === 0 && <p style={{ color: "#475569" }}>Join or leave rooms to see diagnostic messages.</p>}
              </div>
              <div className="agora-badge">Status: {connectionStatus}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
