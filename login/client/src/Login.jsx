import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.success) {
        navigate("/Dashboard");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Server error. Try again later.");
    }
  };

  const handleGoogleLogin = () => {
    // Open the backend Google OAuth endpoint
    window.location.href = "http://localhost:3000/auth/google";
  };

  return (
    <div className="login-container">
      <h1 className="header-login">Parti</h1>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p className="error-msg">{error}</p>}
      <p>or</p>
      <button className="google-btn"
      >
        Login with Google
      </button>
      <p>
        Don't have an account? <a href="/register">Sign Up</a>
      </p>
    </div>
  );
}
