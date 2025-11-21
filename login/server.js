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

// In-memory user storage (replace with DB for production)
const users = []; // { email, password }

app.use(cors({
  origin: "http://localhost:5173", // your React dev server
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: "secret-key",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // secure:true if using HTTPS
}));

// -------- Register endpoint --------
app.post("/api/register", (req, res) => {
  const { username, email, password } = req.body;

  // Check if the user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.json({ success: false, message: "Email already registered" });
  }

  // Store user in memory
  users.push({ username, email, password });

  res.json({ success: true, message: "Account registered successfully" });
});

// // -------- Login endpoint --------
// app.post("/api/register", (req, res) => {
//   const { username, email, password } = req.body;

//   // Check if username already exists
//   const existingUsername = users.find(u => u.username === username);
//   if (existingUsername) {
//     return res.json({ success: false, message: "Username is taken" });
//   }

//   // Check if email already exists
//   const existingUser = users.find(u => u.email === email);
//   if (existingUser) {
//     return res.json({ success: false, message: "Email already registered" });
//   }

//   // Save user
//   users.push({ username, email, password });
//   res.json({ success: true, message: "Account registered successfully" });
// });

// Login endpoint
app.post("/api/login", (req, res) => {
  const { username, email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.json({ success: false, message: "Incorrect email or password" });

  req.session.user = { username: user.username, email: user.email };
  res.json({ success: true });
});

// Dashboard endpoint
app.get("/api/dashboard", (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false, message: "Not logged in" });

  res.json({ success: true, data: req.session.user });
});

// Store active calls and participants
const activeCalls = new Map(); // callId -> Set of socketIds

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-call', ({ callId, username }) => {
    socket.join(callId);
    
    if (!activeCalls.has(callId)) {
      activeCalls.set(callId, new Set());
    }
    activeCalls.get(callId).add(socket.id);

    const participants = Array.from(activeCalls.get(callId));
    const participantCount = participants.length;

    // Notify others in the call
    socket.to(callId).emit('user-joined', {
      username,
      participants: participantCount,
      socketId: socket.id
    });

    // Send list of existing participants to the new user
    const otherParticipants = participants.filter(id => id !== socket.id);
    if (otherParticipants.length > 0) {
      socket.emit('existing-participants', {
        participants: otherParticipants
      });
    }

    console.log(`User ${username} joined call ${callId}`);
  });

  socket.on('leave-call', ({ callId, username }) => {
    socket.leave(callId);
    
    if (activeCalls.has(callId)) {
      activeCalls.get(callId).delete(socket.id);
      if (activeCalls.get(callId).size === 0) {
        activeCalls.delete(callId);
      } else {
        const participants = Array.from(activeCalls.get(callId));
        socket.to(callId).emit('user-left', {
          username,
          participants: participants.length
        });
      }
    }

    console.log(`User ${username} left call ${callId}`);
  });

  socket.on('offer', ({ callId, offer, to }) => {
    socket.to(to).emit('offer', {
      offer,
      from: socket.id
    });
  });

  socket.on('answer', ({ callId, answer, to }) => {
    socket.to(to).emit('answer', {
      answer,
      from: socket.id
    });
  });

  socket.on('ice-candidate', ({ callId, candidate }) => {
    socket.to(callId).emit('ice-candidate', {
      candidate,
      from: socket.id
    });
  });

  socket.on('message', ({ callId, username, message }) => {
    io.to(callId).emit('message', {
      username,
      message,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Clean up from all calls
    for (const [callId, participants] of activeCalls.entries()) {
      if (participants.has(socket.id)) {
        participants.delete(socket.id);
        if (participants.size === 0) {
          activeCalls.delete(callId);
        } else {
          socket.to(callId).emit('user-left', {
            username: 'Unknown',
            participants: participants.size
          });
        }
      }
    }
  });
});

httpServer.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
