import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const formatTime = (timestamp) => new Intl.DateTimeFormat("en", {
  hour: "numeric",
  minute: "2-digit",
}).format(timestamp);

export default function RoomChatPage({ roomLookup, messages, onEnsureMessages, onSendMessage }) {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const room = roomLookup.get(roomId);
  const [draft, setDraft] = useState("");
  const [devices, setDevices] = useState([]);
  const [selectedInput, setSelectedInput] = useState("");
  const [selectedOutput, setSelectedOutput] = useState("");
  const [voiceStatus, setVoiceStatus] = useState("disconnected");
  const [micMuted, setMicMuted] = useState(false);
  const [error, setError] = useState("");
  const audioRef = useRef(null);
  const [stream, setStream] = useState(null);
  const streamRef = useRef(null);

  const roomMessages = useMemo(() => messages[roomId] || [], [messages, roomId]);

  const loadDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) {
        setError("Your browser does not expose audio devices.");
        return;
      }
      const list = await navigator.mediaDevices.enumerateDevices();
      setDevices(list);
      const firstInput = list.find((device) => device.kind === "audioinput");
      const firstOutput = list.find((device) => device.kind === "audiooutput");
      setSelectedInput((prev) => prev || firstInput?.deviceId || "");
      setSelectedOutput((prev) => prev || firstOutput?.deviceId || "");
    } catch (err) {
      setError(err.message || "Unable to list audio devices.");
    }
  }, []);

  useEffect(() => {
    loadDevices();
    const handler = () => loadDevices();
    navigator.mediaDevices?.addEventListener("devicechange", handler);
    return () => navigator.mediaDevices?.removeEventListener("devicechange", handler);
  }, [loadDevices]);

  useEffect(() => {
    if (roomId) {
      onEnsureMessages(roomId);
    }
  }, [roomId, onEnsureMessages]);

  useEffect(() => {
    if (!stream) return undefined;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !micMuted;
    });
    return undefined;
  }, [micMuted, stream]);

  const handleSend = (event) => {
    event.preventDefault();
    if (!room) return;
    onSendMessage(room.id, draft);
    setDraft("");
  };

  const leaveVoice = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
    setVoiceStatus("disconnected");
    setMicMuted(false);
  }, []);

  const applyOutputDevice = useCallback(async () => {
    if (!audioRef.current || !audioRef.current.setSinkId || !selectedOutput) return;
    try {
      await audioRef.current.setSinkId(selectedOutput);
    } catch (err) {
      setError(err.message || "Unable to change output device.");
    }
  }, [selectedOutput]);

  useEffect(() => {
    if (voiceStatus === "connected") {
      applyOutputDevice();
    }
  }, [applyOutputDevice, voiceStatus]);

  const joinVoice = useCallback(async () => {
    setError("");
    setVoiceStatus("connecting");
    try {
      const nextStream = await navigator.mediaDevices.getUserMedia({
        audio: selectedInput ? { deviceId: { exact: selectedInput } } : true,
      });
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = nextStream;
      setStream(nextStream);
      setVoiceStatus("connected");
      setMicMuted(false);
      if (audioRef.current) {
        audioRef.current.srcObject = nextStream;
        audioRef.current.muted = true;
        await audioRef.current.play();
        await applyOutputDevice();
      }
    } catch (err) {
      setVoiceStatus("disconnected");
      setError(err.message || "Unable to access microphone.");
    }
  }, [applyOutputDevice, selectedInput]);

  useEffect(() => {
    if (!streamRef.current || !selectedInput) return;
    joinVoice();
  }, [joinVoice, selectedInput]);

  useEffect(() => () => {
    leaveVoice();
  }, [leaveVoice]);

  const inputDevices = devices.filter((device) => device.kind === "audioinput");
  const outputDevices = devices.filter((device) => device.kind === "audiooutput");

  if (!room) {
    return (
      <div className="room-chat-shell">
        <div className="chat-header">
          <div>
            <p className="eyebrow">Room not found</p>
            <h1>That room isn't available</h1>
          </div>
          <Link className="ghost" to="/rooms">Back to rooms</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="room-chat-shell">
      <div className="chat-header">
        <div>
          <p className="eyebrow">In room</p>
          <h1>{room.name}</h1>
          <p className="room-topic">{room.topic}</p>
        </div>
        <div className="header-actions">
          <button type="button" className="ghost" onClick={() => navigate(`/rooms/${room.id}`)}>
            Room details
          </button>
          <Link className="ghost" to="/rooms">All rooms</Link>
        </div>
      </div>

      <section className="voice-controls">
        <div>
          <p className="eyebrow">Voice status</p>
          <p className="status-line">
            {voiceStatus === "connected" && !micMuted && (
              <><span className="status-dot online" /> Live in voice</>
            )}
            {voiceStatus === "connected" && micMuted && (
              <><span className="status-dot warning" /> Mic muted</>
            )}
            {voiceStatus === "connecting" && (
              <><span className="status-dot warning" /> Connecting...</>
            )}
            {voiceStatus === "disconnected" && (
              <><span className="status-dot offline" /> Not connected</>
            )}
          </p>
          {error && <p className="error">{error}</p>}
        </div>
        <div className="voice-actions">
          {voiceStatus === "connected" ? (
            <button type="button" className="danger" onClick={leaveVoice}>
              Leave voice
            </button>
          ) : (
            <button type="button" onClick={joinVoice}>
              Join voice
            </button>
          )}
          <button
            type="button"
            className={micMuted ? "ghost" : ""}
            onClick={() => setMicMuted((prev) => !prev)}
            disabled={voiceStatus !== "connected"}
          >
            {micMuted ? "Unmute" : "Mute"}
          </button>
        </div>
      </section>

      <section className="audio-pickers">
        <div>
          <label>
            Input device
            <select
              value={selectedInput}
              onChange={(event) => setSelectedInput(event.target.value)}
              disabled={!inputDevices.length}
            >
              {!inputDevices.length && <option>No microphones detected</option>}
              {inputDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || "Microphone"}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Output device
            <select
              value={selectedOutput}
              onChange={(event) => setSelectedOutput(event.target.value)}
              disabled={!outputDevices.length}
            >
              {!outputDevices.length && <option>No speakers detected</option>}
              {outputDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || "Speaker"}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="button" className="ghost" onClick={loadDevices}>
          Refresh devices
        </button>
      </section>

      <section className="chat-panel">
        <div className="messages" aria-live="polite">
          {roomMessages.map((message, index) => (
            <article key={`${message.timestamp}-${index}`} className="message">
              <div className="message-meta">
                <span className="author">{message.author}</span>
                <span className="time">{formatTime(message.timestamp)}</span>
              </div>
              <p>{message.content}</p>
            </article>
          ))}
          {roomMessages.length === 0 && <p className="empty">No messages yet. Say hello!</p>}
        </div>
        <form className="chat-input" onSubmit={handleSend}>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type a message to everyone in the room"
          />
          <button type="submit">Send</button>
        </form>
      </section>

      <audio ref={audioRef} hidden playsInline />
    </div>
  );
}
