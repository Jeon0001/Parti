import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SelectTime.css";

export default function SelectTime() {
  const navigate = useNavigate();
  const location = useLocation();

  // From previous page (language selection)
  const selectedGame = location.state?.selectedGame || null;
  const selectedLanguage = location.state?.selectedLanguage || null;

  const [selectedTime, setSelectedTime] = useState(null);

  const times = [
    "Morning", 
    "Afternoon", 
    "Evening", 
    "Late Night", 
    "Flexible", 
    "Weekend"
  ];

  const handleNext = () => {
    if (!selectedTime) return;

    navigate("/finalize", {
      state: {
        selectedGame,
        selectedLanguage,
        selectedTime
      }
    });
  };

  return (
    <div className="time-page">
      
      {/* Top Navigation Bar */}
      <nav className="dashboard-topbar">
        <div className="dashboard-logo">Parti</div>

        <div className="dashboard-buttons">
          <button onClick={() => navigate("/dashboard")}>Home</button>
          <button onClick={() => navigate("/mypartis")}>My Partis</button>
          <button onClick={() => navigate("/findpartis")}>Find Partis</button>
          <button onClick={() => navigate("/createparti")}>Create Parti</button>
          <button onClick={() => navigate("/socials")}>Socials</button>

          <div className="account-bar">
            <button onClick={() => navigate("/login")}>Logout</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="time-content">
        <h1 className="create-title">Step 3: Choose the play time</h1>

        <p className="selected-game-label">
          Selected game: <span>{selectedGame?.name}</span>
        </p>

        <p className="selected-lang-label">
          Language: <span>{selectedLanguage}</span>
        </p>

        <div className="time-grid">
          {times.map((t, index) => (
            <div
              key={index}
              className={`time-card ${selectedTime === t ? "selected" : ""}`}
              onClick={() => setSelectedTime(t)}
            >
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Back + Next Buttons */}
      <div className="back-next-container">
        <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
        <button
          className="next-btn"
          disabled={!selectedTime}
          onClick={handleNext}
        >
          Next
        </button>
      </div>

    </div>
  );
}
