import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SelectTime.css"; // reuse same styling

export default function SelectTime() {
  const navigate = useNavigate();
  const location = useLocation();

  const { selectedGames, selectedLanguages, selectedTags } = location.state || {};

  // Store date & time in a dictionary
  const [timeRange, setTimeRange] = useState({
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });
  const [isAnyTime, setIsAnyTime] = useState(false);

  const handleNext = () => {
    
    const finalTimeRange = isAnyTime 
      ? { startDate: "Any", startTime: "Any", endDate: "Any", endTime: "Any" }
      : timeRange;
    
    console.log("Selected Game:", selectedGames);
    console.log("Selected Languages:", selectedLanguages);
    console.log("Selected Tags:", selectedTags);
    console.log("Selected Time:", finalTimeRange);

    navigate("/allpartis", {
      state: {
        selectedGames,
        selectedLanguages,
        selectedTags,
        timeRange: finalTimeRange,
      },
    });
  };

  const handleAnyTime = () => {
    setIsAnyTime(true);
    setTimeRange({
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
    });
  };

  const handleCustomTime = () => {
    setIsAnyTime(false);
  };

  // Check if all fields are filled (or if Any Time is selected)
  const allFilled =
    isAnyTime ||
    (timeRange.startDate &&
      timeRange.startTime &&
      timeRange.endDate &&
      timeRange.endTime);

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
          <button onClick={() => navigate("/mypartis")}>My Partis</button>
          <button onClick={() => navigate("/findpartis")}>Find Partis</button>
          <button onClick={() => navigate("/create")}>Create Parti</button>
          <div className="account-bar">
            <button onClick={() => navigate("/login")}>Logout</button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="select-tags-content">
        <h1 className="create-title">Step 4: Choose date & time</h1>

        {/* Any Time Button */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <button
            onClick={handleAnyTime}
            style={{
              padding: '12px 24px',
              background: isAnyTime ? '#ffffff' : 'transparent',
              color: isAnyTime ? '#0d1f19' : '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '999px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: isAnyTime ? '600' : '400',
              transition: 'all 0.2s ease'
            }}
          >
            Any Time
          </button>
        </div>

        {isAnyTime && (
          <p style={{ 
            textAlign: 'center', 
            color: '#9ed6b9', 
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            Selected: Any Time
          </p>
        )}

        {!isAnyTime && (
          <p style={{ 
            textAlign: 'center', 
            color: '#9ed6b9', 
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            Or select a specific time range:
          </p>
        )}

        <div className="time-input-container" style={{ opacity: isAnyTime ? 0.5 : 1, pointerEvents: isAnyTime ? 'none' : 'auto' }}>

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

        {!isAnyTime && (
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <button
              onClick={handleCustomTime}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                color: '#9ed6b9',
                border: '1px solid rgba(158, 214, 185, 0.4)',
                borderRadius: '999px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Clear and select custom time
            </button>
          </div>
        )}

        {/* Error message */}
        {!isAnyTime && allFilled && !isValidTime() && (
          <p className="error-msg">Start time must be before end time!</p>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="back-next-container">
        <button className="back-btn" onClick={() => navigate(-1)}>Back</button>

        <button
          className="next-btn"
          onClick={handleNext}
          disabled={!allFilled || (!isAnyTime && !isValidTime())} // Disable if not valid
        >
          Next
        </button>
      </div>

    </div>
  );
}
