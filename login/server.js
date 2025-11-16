require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcrypt");

const app = express();

// ===== In-memory "database" (replace with real DB later) =====
const users = []; 
// user = { id, email, passwordHash, googleId }

// ===== Express setup =====
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "changeme",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ===== Passport Local Strategy (email/password) =====
passport.use(
  new LocalStrategy(
    { usernameField: "email" }, // use "email" instead of default "username"
    async (email, password, done) => {
      const user = users.find((u) => u.email === email);
      if (!user) {
        return done(null, false, { message: "Incorrect email or password." });
      }
      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) {
        return done(null, false, { message: "Incorrect email or password." });
      }
      return done(null, user);
    }
  )
);

// ===== Passport Google Strategy =====
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      // Try to find existing user by googleId
      let user = users.find((u) => u.googleId === profile.id);

      if (!user) {
        // Optionally match by email, if available
        const email =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : null;

        if (email) {
          user = users.find((u) => u.email === email);
        }

        if (!user) {
          // Create new user
          user = {
            id: String(users.length + 1),
            email: email,
            passwordHash: null, // no password for Google-only accounts
            googleId: profile.id,
          };
          users.push(user);
        } else {
          // Link Google account to existing email-based user
          user.googleId = profile.id;
        }
      }

      return done(null, user);
    }
  )
);

// ===== Passport session handling =====
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find((u) => u.id === id);
  done(null, user || false);
});

// ===== Helpers =====
function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  res.redirect("/login");
}

// ===== Routes =====

// Home → redirect depending on login status
app.get("/", (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    res.redirect("/dashboard");
  } else {
    res.redirect("/login");
  }
});

// ----- Register -----
app.get("/register", (req, res) => {
  res.render("register", { error: null });
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render("register", { error: "Email and password required." });
  }

  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.render("register", { error: "Email already in use." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: String(users.length + 1),
    email,
    passwordHash,
    googleId: null,
  };
  users.push(newUser);
  res.redirect("/login");
});

// ----- Login -----
app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  })
);

// ----- Google OAuth -----
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: "/dashboard",
  })
);

// ----- Dashboard (protected) -----
app.get("/dashboard", ensureLoggedIn, (req, res) => {
  res.render("dashboard", { user: req.user });
});

// ----- Logout -----
app.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.redirect("/login");
    });
  });
});

// ===== Start server =====
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
