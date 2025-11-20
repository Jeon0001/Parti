import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

export default function RoomDetailPage({ roomLookup }) {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const room = roomLookup.get(roomId);

  if (!room) {
    return (
      <div className="rooms-shell">
        <header className="rooms-hero">
          <div>
            <p className="eyebrow">Room not found</p>
            <h1>We couldn't find that room</h1>
            <p className="lead">It may have been removed. Pick another space to join.</p>
          </div>
        </header>
        <Link className="ghost" to="/rooms">Back to all rooms</Link>
      </div>
    );
  }

  return (
    <div className="rooms-shell detail">
      <header className="rooms-hero">
        <div>
          <p className="eyebrow">Room preview</p>
          <h1>{room.name}</h1>
          <p className="lead">{room.topic}</p>
        </div>
        <div className="hero-meta">
          <div>
            <p className="eyebrow">Online now</p>
            <strong>{room.users}</strong>
          </div>
        </div>
      </header>

      <section className="room-detail">
        <div>
          <p className="eyebrow">Description</p>
          <p className="room-description">{room.description}</p>
          <p className="helper">Text chat is always available. Voice is opt-in once you join.</p>
        </div>
        <div className="detail-actions">
          <button type="button" onClick={() => navigate(`/rooms/${room.id}/chat`)}>
            Join room
          </button>
          <Link className="ghost" to="/rooms">
            Back to all rooms
          </Link>
        </div>
      </section>
    </div>
  );
}
