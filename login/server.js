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

  const parti = {
    id: Date.now(),
    hostUsername,
    selectedGame,
    selectedLanguages,
    selectedTags,
    timeRange,
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



// -------------------- Start Server --------------------
httpServer.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
