import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const starterTags = ["Text", "Voice", "Drop-in", "Private on request"];

export default function RoomListPage({ rooms, onCreateRoom }) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");

  const totalUsers = useMemo(
    () => rooms.reduce((total, room) => total + (room.users || 0), 0),
    [rooms],
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    const roomId = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || crypto.randomUUID();
    const newRoom = {
      id: `${roomId}-${crypto.randomUUID().slice(0, 6)}`,
      name: name.trim(),
      topic: topic.trim() || "Open chat",
      description: description.trim() || "A brand new room to meet others.",
      users: 1,
    };
    onCreateRoom(newRoom);
    setName("");
    setTopic("");
    setDescription("");
    navigate(`/rooms/${newRoom.id}`);
  };

  return (
    <div className="rooms-shell">
      <header className="rooms-hero">
        <div>
          <p className="eyebrow">Browse rooms</p>
          <h1>Pick a space to chat</h1>
          <p className="lead">Preview rooms, read descriptions, then join with text or voice.</p>
        </div>
        <div className="hero-meta">
          <div>
            <p className="eyebrow">Rooms</p>
            <strong>{rooms.length}</strong>
          </div>
          <div>
            <p className="eyebrow">People online</p>
            <strong>{totalUsers}</strong>
          </div>
        </div>
      </header>

      <section className="rooms-grid" aria-label="Room catalog">
        {rooms.map((room) => (
          <article key={room.id} className="room-card">
            <div className="card-body">
              <div className="card-tags">
                {starterTags.map((tag) => (
                  <span key={tag} className="pill">{tag}</span>
                ))}
              </div>
              <h2>{room.name}</h2>
              <p className="room-topic">{room.topic}</p>
              <p className="room-description">{room.description}</p>
              <div className="card-footer">
                <span className="pill subtle">{room.users} online</span>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => navigate(`/rooms/${room.id}`)}
                >
                  View details
                </button>
              </div>
            </div>
          </article>
        ))}
        {rooms.length === 0 && (
          <p className="empty">No rooms yet. Create one below.</p>
        )}
      </section>

      <section className="room-form">
        <div>
          <p className="eyebrow">Create room</p>
          <h3>Launch a new hangout</h3>
          <p className="helper">Set a topic and description to attract the right people.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <label>
            Room name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Late night study sesh"
              required
            />
          </label>
          <label>
            Topic
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Assignments + accountability"
            />
          </label>
          <label>
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Let people know what to expect."
              rows={3}
            />
          </label>
          <button type="submit">Create &amp; view room</button>
        </form>
      </section>
    </div>
  );
}
