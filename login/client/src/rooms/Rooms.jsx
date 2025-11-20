import React, { useMemo, useState } from "react";
import { Route, Routes } from "react-router-dom";
import RoomListPage from "./RoomListPage";
import RoomDetailPage from "./RoomDetailPage";
import RoomChatPage from "./RoomChatPage";
import "./Rooms.css";

const initialRooms = [
  {
    id: "chill-lounge",
    name: "Chill Lounge",
    topic: "Casual chats",
    description: "Drop in to share your day, listen to music, or hang out with friends after work.",
    users: 5,
  },
  {
    id: "study-hall",
    name: "Study Hall",
    topic: "Focus + lo-fi",
    description: "Cameras off, mics on request. Quiet accountability and occasional breaks for wins.",
    users: 8,
  },
  {
    id: "ranked-queue",
    name: "Ranked Queue",
    topic: "Comp matches",
    description: "Team up for ranked games. Bring your shot-calls and match reviews.",
    users: 2,
  },
];

const initialMessages = {
  "chill-lounge": [
    { author: "System", content: "Welcome to Chill Lounge!", timestamp: new Date() },
  ],
};

export default function Rooms() {
  const [rooms, setRooms] = useState(initialRooms);
  const [messages, setMessages] = useState(initialMessages);

  const roomLookup = useMemo(() => new Map(rooms.map((room) => [room.id, room])), [rooms]);

  const handleCreateRoom = (newRoom) => {
    setRooms((prev) => [...prev, newRoom]);
    setMessages((prev) => ({
      ...prev,
      [newRoom.id]: [
        { author: "System", content: `Welcome to ${newRoom.name}!`, timestamp: new Date() },
      ],
    }));
  };

  const ensureRoomMessages = (roomId) => {
    setMessages((prev) => {
      if (prev[roomId]) return prev;
      return {
        ...prev,
        [roomId]: [
          { author: "System", content: "You joined the room", timestamp: new Date() },
        ],
      };
    });
  };

  const handleSendMessage = (roomId, content) => {
    const trimmed = content.trim();
    if (!trimmed) return;
    setMessages((prev) => ({
      ...prev,
      [roomId]: [
        ...(prev[roomId] || []),
        { author: "You", content: trimmed, timestamp: new Date() },
      ],
    }));
  };

  return (
    <Routes>
      <Route
        index
        element={(
          <RoomListPage rooms={rooms} onCreateRoom={handleCreateRoom} />
        )}
      />
      <Route
        path=":roomId"
        element={(
          <RoomDetailPage
            roomLookup={roomLookup}
          />
        )}
      />
      <Route
        path=":roomId/chat"
        element={(
          <RoomChatPage
            roomLookup={roomLookup}
            messages={messages}
            onEnsureMessages={ensureRoomMessages}
            onSendMessage={handleSendMessage}
          />
        )}
      />
    </Routes>
  );
}
