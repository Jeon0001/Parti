import express from "express";
import cors from "cors";
import session from "express-session";

const app = express();
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

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
