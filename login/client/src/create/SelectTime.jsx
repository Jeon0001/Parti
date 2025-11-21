import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SelectTime.css"; // reuse same styling

export default function SelectTime() {
  const navigate = useNavigate();
  const location = useLocation();

  const { selectedGame, selectedLanguages, selectedTags } = location.state || {};

  // Store date & time in a dictionary
  const [timeRange, setTimeRange] = useState({
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });

  const handleNext = () => {
    navigate("/create-summary", {
      state: {
        selectedGame,
        selectedLanguages,
        selectedTags,
        timeRange, // send dictionary object
      },
    });
  };

  // Check if all fields are filled
  const allFilled =
    timeRange.startDate &&
    timeRange.startTime &&
    timeRange.endDate &&
    timeRange.endTime;

  // Check if start datetime is before end datetime
  const isValidTime = () => {
    if (!allFilled) return false;

    const start = new Date(`${timeRange.startDate}T${timeRange.startTime}`);
    const end = new Date(`${timeRange.endDate}T${timeRange.endTime}`);

    return start < end;
  };

  return (
    <div className="select-tags-page">

      {/* Topbar */}
      <nav className="dashboard-topbar">
        <div className="dashboard-logo">Parti</div>
        <div className="dashboard-buttons">
          <button onClick={() => navigate("/dashboard")}>Home</button>
          <button onClick={() => navigate("/my-partis")}>My Partis</button>
          <button onClick={() => navigate("/find-partis")}>Find Partis</button>
          <button onClick={() => navigate("/create")}>Create Parti</button>
          <div className="account-bar">
            <button onClick={() => navigate("/login")}>Logout</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="select-tags-content">
        <h1 className="create-title">Step 4: Choose date & time</h1>

        <div className="time-input-container">

          <div className="time-input-block">
            <label>From</label>
            <input
              type="date"
              value={timeRange.startDate}
              onChange={(e) =>
                setTimeRange({ ...timeRange, startDate: e.target.value })
              }
              className="custom-tag-input"
            />
            <input
              type="time"
              value={timeRange.startTime}
              onChange={(e) =>
                setTimeRange({ ...timeRange, startTime: e.target.value })
              }
              className="custom-tag-input"
            />
          </div>

          <div className="time-input-block">
            <label>To</label>
            <input
              type="date"
              value={timeRange.endDate}
              onChange={(e) =>
                setTimeRange({ ...timeRange, endDate: e.target.value })
              }
              className="custom-tag-input"
            />
            <input
              type="time"
              value={timeRange.endTime}
              onChange={(e) =>
                setTimeRange({ ...timeRange, endTime: e.target.value })
              }
              className="custom-tag-input"
            />
          </div>

        </div>

        {/* Error message */}
        {allFilled && !isValidTime() && (
          <p className="error-msg">Start time must be before end time!</p>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="back-next-container">
        <button className="back-btn" onClick={() => navigate(-1)}>Back</button>

        <button
          className="next-btn"
          onClick={handleNext}
          disabled={!allFilled || !isValidTime()} // Disable if not valid
        >
          Next
        </button>
      </div>

    </div>
  );
}
