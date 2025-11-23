import express from "express";
import cors from "cors";
import session from "express-session";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

// -------------------- In-memory storage --------------------
const users = []; // { username, email, password }

// OLD:
// const partis = [];

// NEW:
const allPartis = [];         // all partis created by everyone
const userPartis = {};        // key=username → array of partis
const userPartiCounts = {};   // key=username → number of partis created (for chat room naming)
const chatRoomIds = new Set(); // Track all chatroom IDs for uniqueness validation

// -------------------- Middleware --------------------
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: "secret-key",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// -------------------- Register --------------------
app.post("/api/register", (req, res) => {
  const { username, email, password } = req.body;

  const existing = users.find(u => u.email === email);
  if (existing)
    return res.json({ success: false, message: "Email already registered" });

  users.push({ username, email, password });
  res.json({ success: true, message: "Account registered successfully" });
});

// -------------------- Login --------------------
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);
  if (!user)
    return res.json({ success: false, message: "Incorrect email or password" });

  req.session.user = { username: user.username, email: user.email };
  res.json({ success: true });
});

// -------------------- Dashboard --------------------
app.get("/api/dashboard", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ success: false, message: "Not logged in" });

  res.json({ success: true, data: req.session.user });
});

// -------------------- WebRTC Logic (unchanged) --------------------
const activeCalls = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-call", ({ callId, username }) => {
    socket.join(callId);

    if (!activeCalls.has(callId)) {
      activeCalls.set(callId, new Set());
    }
    activeCalls.get(callId).add(socket.id);

    const participants = Array.from(activeCalls.get(callId));

    socket.to(callId).emit("user-joined", {
      username,
      participants: participants.length,
      socketId: socket.id
    });

    const otherParticipants = participants.filter(id => id !== socket.id);
    if (otherParticipants.length > 0) {
      socket.emit("existing-participants", {
        participants: otherParticipants
      });
    }
  });

  socket.on("leave-call", ({ callId, username }) => {
    socket.leave(callId);

    if (activeCalls.has(callId)) {
      activeCalls.get(callId).delete(socket.id);
      if (activeCalls.get(callId).size === 0) {
        activeCalls.delete(callId);
      } else {
        const participants = Array.from(activeCalls.get(callId));
        socket.to(callId).emit("user-left", {
          username,
          participants: participants.length
        });
      }
    }
  });

  socket.on("offer", ({ offer, to }) => {
    socket.to(to).emit("offer", { offer, from: socket.id });
  });

  socket.on("answer", ({ answer, to }) => {
    socket.to(to).emit("answer", { answer, from: socket.id });
  });

  socket.on("ice-candidate", ({ callId, candidate }) => {
    socket.to(callId).emit("ice-candidate", { candidate, from: socket.id });
  });

  socket.on("message", ({ callId, username, message }) => {
    io.to(callId).emit("message", {
      username,
      message,
      timestamp: new Date()
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (const [callId, participants] of activeCalls.entries()) {
      if (participants.has(socket.id)) {
        participants.delete(socket.id);
        if (participants.size === 0) {
          activeCalls.delete(callId);
        }
      }
    }
  });
});

// -------------------- Parti Endpoints --------------------
app.post("/api/create-parti", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ success: false, message: "Not logged in" });

  const { selectedGame, selectedLanguages, selectedTags, timeRange } = req.body;
  const hostUsername = req.session.user.username;

  // Increment parti count for this user
  if (!userPartiCounts[hostUsername]) {
    userPartiCounts[hostUsername] = 0;
  }
  userPartiCounts[hostUsername] += 1;

  // Generate chat room name: (username)_parti_[number]
  let chatRoomName = `${hostUsername}_parti_${userPartiCounts[hostUsername]}`;
  
  // Ensure uniqueness (in case of edge cases)
  let counter = 1;
  while (chatRoomIds.has(chatRoomName)) {
    chatRoomName = `${hostUsername}_parti_${userPartiCounts[hostUsername]}_${counter}`;
    counter++;
  }
  chatRoomIds.add(chatRoomName);

  const parti = {
    id: Date.now(),
    hostUsername,
    selectedGame,
    selectedLanguages,
    selectedTags,
    timeRange,
    chatRoomName, // Store the chat room name (ID)
    visibleName: null, // Custom visible name (null means use selectedGame.name)
    createdAt: new Date()
  };

  // Save to ALL PARTIS
  allPartis.push(parti);

  // Save to USER PARTIS
  if (!userPartis[hostUsername]) {
    userPartis[hostUsername] = [];
  }
  userPartis[hostUsername].push(parti);

  res.json({ success: true, message: "Parti created successfully", parti });
});

// Get partis for logged-in user
app.get("/api/my-partis", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ success: false, message: "Not logged in" });

  const username = req.session.user.username;
  res.json({
    success: true,
    partis: userPartis[username] || []
  });
});

// NEW: Get ALL partis
app.get("/api/all-partis", (req, res) => {
  res.json({
    success: true,
    partis: allPartis
  });
});

// Update parti (chatroom ID and visible name)
app.put("/api/update-parti", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ success: false, message: "Not logged in" });

  const { partiId, chatRoomName, visibleName } = req.body;
  const username = req.session.user.username;

  // Find the parti
  const parti = allPartis.find(p => p.id === partiId);
  if (!parti) {
    return res.status(404).json({ success: false, message: "Parti not found" });
  }

  // Check if user owns this parti
  if (parti.hostUsername !== username) {
    return res.status(403).json({ success: false, message: "You can only edit your own partis" });
  }

  // If chatRoomName is being changed, validate uniqueness
  if (chatRoomName && chatRoomName !== parti.chatRoomName) {
    // Check if the new ID is already taken
    if (chatRoomIds.has(chatRoomName)) {
      return res.status(400).json({ 
        success: false, 
        message: "This chatroom ID is already taken. Please choose a different one." 
      });
    }

    // Remove old ID and add new one
    chatRoomIds.delete(parti.chatRoomName);
    chatRoomIds.add(chatRoomName);
    parti.chatRoomName = chatRoomName;
  }

  // Update visible name if provided
  if (visibleName !== undefined) {
    parti.visibleName = visibleName || null; // Allow empty string to reset to null
  }

  res.json({ success: true, message: "Parti updated successfully", parti });
});



// -------------------- Start Server --------------------
httpServer.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
