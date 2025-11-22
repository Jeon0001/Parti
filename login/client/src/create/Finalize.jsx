import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Finalize.css";

export default function Finalize() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    selectedGame,
    selectedLanguages,
    selectedTags,
    timeRange,
  } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!selectedGame || !selectedLanguages || !selectedTags || !timeRange) {
      setError("All fields must be filled before creating a parti.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/create-parti",
        { selectedGame, selectedLanguages, selectedTags, timeRange },
        { withCredentials: true }
      );

      if (res.data.success) {
        navigate("/mypartis");
      } else {
        setError(res.data.message || "Failed to create parti.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="finalize-page">
      {/* Topbar */}
      <nav className="dashboard-topbar">
        <div className="dashboard-logo">Parti</div>
        <div className="dashboard-buttons">
          <button onClick={() => navigate("/dashboard")}>Home</button>
          <button onClick={() => navigate("/mypartis")}>My Partis</button>
          <button onClick={() => navigate("/findpartis")}>Find Partis</button>
          <button onClick={() => navigate("/create")}>Create Parti</button>
          <div className="account-bar">
            <button onClick={() => navigate("/login")}>Logout</button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="finalize-content">
        <h1 className="create-title">Finalize Your Parti</h1>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="final-box">
          {selectedGame?.image && (
            <img
              src={selectedGame.image}
              alt={selectedGame.name}
              className="final-game-image"
            />
          )}

          <div className="final-inner">
            <div className="final-section">
              <h2>Game</h2>
              <p>{selectedGame?.name || "Not selected"}</p>
            </div>

            <div className="final-section">
              <h2>Languages</h2>
              <p>{selectedLanguages?.join(", ") || "None selected"}</p>
            </div>

            <h2>Tags</h2>

            <p className="tags">
                    {selectedTags.map((tag, i) => (
                      <span key={i}>{tag}</span>
                    ))}
                  </p>

            <div className="final-section">
              <h3>Time</h3>
              {timeRange ? (
                <p className="time-range">
                {timeRange.startDate} {timeRange.startTime} - {timeRange.endDate} {timeRange.endTime}
              </p>
              ) : (
                <p>No time selected</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="back-next-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          Back
        </button>
        <button
          className="next-btn"
          onClick={handleCreate}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Parti"}
        </button>
      </div>
    </div>
  );
}
