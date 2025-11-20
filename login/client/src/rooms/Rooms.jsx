import React, { useEffect, useMemo, useState } from "react";
import "./Rooms.css";

const defaultRooms = [
  { id: "1", name: "Chill Lounge", topic: "Casual chats", users: 5 },
  { id: "2", name: "Study Hall", topic: "Focus + lo-fi", users: 8 },
  { id: "3", name: "Ranked Queue", topic: "Comp matches", users: 2 },
];

export default function Rooms() {
  const [rooms, setRooms] = useState(defaultRooms);
  const [selectedRoomId, setSelectedRoomId] = useState("1");
  const [messages, setMessages] = useState({
    1: [
      { author: "System", content: "Welcome to Chill Lounge!", timestamp: new Date() },
    ],
  });
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomTopic, setNewRoomTopic] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [voiceConnected, setVoiceConnected] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedInput, setSelectedInput] = useState("");
  const [selectedOutput, setSelectedOutput] = useState("");

  const fakeDevices = [
    { deviceId: "default-mic", kind: "audioinput", label: "Built-in Microphone" },
    { deviceId: "usb-mic", kind: "audioinput", label: "USB Podcast Mic" },
    { deviceId: "default-speaker", kind: "audiooutput", label: "Laptop Speakers" },
    { deviceId: "bt-headset", kind: "audiooutput", label: "Bluetooth Headset" },
  ];

  useEffect(() => {
    if (navigator?.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
        setDevices(deviceInfos);
        const defaultInput = deviceInfos.find((d) => d.kind === "audioinput");
        const defaultOutput = deviceInfos.find((d) => d.kind === "audiooutput");
        setSelectedInput((prev) => prev || defaultInput?.deviceId || "");
        setSelectedOutput((prev) => prev || defaultOutput?.deviceId || "");
      }).catch(() => {
        setDevices(fakeDevices);
        setSelectedInput(fakeDevices.find((d) => d.kind === "audioinput")?.deviceId || "");
        setSelectedOutput(fakeDevices.find((d) => d.kind === "audiooutput")?.deviceId || "");
      });
    } else {
      setDevices(fakeDevices);
      setSelectedInput(fakeDevices.find((d) => d.kind === "audioinput")?.deviceId || "");
      setSelectedOutput(fakeDevices.find((d) => d.kind === "audiooutput")?.deviceId || "");
    }
  }, []);

  const currentRoom = useMemo(
    () => rooms.find((room) => room.id === selectedRoomId),
    [rooms, selectedRoomId],
  );

  const roomMessages = messages[selectedRoomId] || [];

  const handleCreateRoom = (event) => {
    event.preventDefault();
    if (!newRoomName.trim()) return;

    const newRoom = {
      id: crypto.randomUUID(),
      name: newRoomName.trim(),
      topic: newRoomTopic.trim() || "General discussion",
      users: 1,
    };

    setRooms((prev) => [...prev, newRoom]);
    setMessages((prev) => ({ ...prev, [newRoom.id]: [
      { author: "System", content: `Welcome to ${newRoom.name}!`, timestamp: new Date() },
    ] }));
    setSelectedRoomId(newRoom.id);
    setVoiceConnected(false);
    setMicMuted(false);
    setNewRoomName("");
    setNewRoomTopic("");
  };

  const handleJoinRoom = (roomId) => {
    setSelectedRoomId(roomId);
    setVoiceConnected(false);
    setMicMuted(false);
    if (!messages[roomId]) {
      setMessages((prev) => ({ ...prev, [roomId]: [
        { author: "System", content: "You joined the room", timestamp: new Date() },
      ] }));
    }
  };

  const handleSendMessage = (event) => {
    event.preventDefault();
    if (!newMessage.trim() || !selectedRoomId) return;

    const message = {
      author: "You",
      content: newMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => ({ ...prev, [selectedRoomId]: [...(prev[selectedRoomId] || []), message] }));
    setNewMessage("");
  };

  const formattedTime = (timestamp) => new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);

  const inputDevices = devices.filter((device) => device.kind === "audioinput");
  const outputDevices = devices.filter((device) => device.kind === "audiooutput");

  return (
    <div className="rooms-page">
      <aside className="rooms-sidebar">
        <header className="sidebar-header">
          <h1>Rooms</h1>
          <p>Select a room or create your own hangout.</p>
        </header>

        <div className="create-room-card">
          <h2>Create Room</h2>
          <form onSubmit={handleCreateRoom} className="create-room-form">
            <label>
              Room name
              <input
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="e.g. Friday Night Chat"
                required
              />
            </label>
            <label>
              Topic (optional)
              <input
                value={newRoomTopic}
                onChange={(e) => setNewRoomTopic(e.target.value)}
                placeholder="What are you chatting about?"
              />
            </label>
            <button type="submit">Create</button>
          </form>
        </div>

        <div className="rooms-list">
          <div className="list-header">
            <h3>Available rooms</h3>
            <span>{rooms.length} total</span>
          </div>
          {rooms.length === 0 && <p className="empty">No rooms yet. Create the first one!</p>}
          {rooms.map((room) => (
            <button
              key={room.id}
              className={`room-tile ${room.id === selectedRoomId ? "active" : ""}`}
              onClick={() => handleJoinRoom(room.id)}
              type="button"
            >
              <div>
                <p className="room-name">{room.name}</p>
                <p className="room-topic">{room.topic}</p>
              </div>
              <div className="room-meta">
                <span className="pill">{room.users} online</span>
                <span className="pill">Text & Voice</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main className="room-content">
        {currentRoom ? (
          <>
            <header className="room-header">
              <div>
                <p className="eyebrow">Room</p>
                <h2>{currentRoom.name}</h2>
                <p className="room-topic">{currentRoom.topic}</p>
              </div>
              <div className="room-actions">
                <button
                  type="button"
                  className={`voice-button ${voiceConnected ? "active" : ""}`}
                  onClick={() => setVoiceConnected((prev) => !prev)}
                >
                  {voiceConnected ? "Leave voice" : "Join voice"}
                </button>
                <button
                  type="button"
                  className={`mute-button ${micMuted ? "muted" : ""}`}
                  onClick={() => setMicMuted((prev) => !prev)}
                  disabled={!voiceConnected}
                >
                  {micMuted ? "Unmute" : "Mute"}
                </button>
              </div>
            </header>

            <section className="audio-settings">
              <div>
                <p className="eyebrow">Input device</p>
                <select
                  value={selectedInput}
                  onChange={(event) => setSelectedInput(event.target.value)}
                  disabled={!voiceConnected || inputDevices.length === 0}
                >
                  {inputDevices.length === 0 && <option>No microphones detected</option>}
                  {inputDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || "Microphone"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="eyebrow">Output device</p>
                <select
                  value={selectedOutput}
                  onChange={(event) => setSelectedOutput(event.target.value)}
                  disabled={!voiceConnected || outputDevices.length === 0}
                >
                  {outputDevices.length === 0 && <option>No speakers detected</option>}
                  {outputDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || "Speaker"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="audio-status">
                <p className="eyebrow">Status</p>
                <p className="status-line">
                  {voiceConnected ? (
                    <>
                      <span className="status-dot online" />
                      {micMuted ? "You are muted" : "Live in voice"}
                    </>
                  ) : (
                    <>
                      <span className="status-dot offline" />
                      Not connected to voice
                    </>
                  )}
                </p>
              </div>
            </section>

            <section className="chat-panel">
              <div className="messages" aria-live="polite">
                {roomMessages.map((message, index) => (
                  <article key={`${message.timestamp}-${index}`} className="message">
                    <div className="message-meta">
                      <span className="author">{message.author}</span>
                      <span className="time">{formattedTime(message.timestamp)}</span>
                    </div>
                    <p>{message.content}</p>
                  </article>
                ))}
                {roomMessages.length === 0 && (
                  <p className="empty">No messages yet. Say hello!</p>
                )}
              </div>
              <form className="chat-input" onSubmit={handleSendMessage}>
                <input
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  placeholder="Type a message to everyone in the room"
                />
                <button type="submit">Send</button>
              </form>
            </section>
          </>
        ) : (
          <div className="empty-room">
            <h2>No room selected</h2>
            <p>Pick a room on the left or create a new one to start chatting.</p>
          </div>
        )}
      </main>
    </div>
  );
}
