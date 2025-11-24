import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SelectTime.css";

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
  const [isAnyTime, setIsAnyTime] = useState(false);

  const handleNext = () => {
    const finalTimeRange = isAnyTime
      ? { startDate: "Any", startTime: "Any", endDate: "Any", endTime: "Any" }
      : timeRange;

    navigate("/create/finalize", {
      state: {
        selectedGame,
        selectedLanguages,
        selectedTags,
        timeRange: finalTimeRange,
      },
    });
  };

  const handleAnyTime = () => {
    if (isAnyTime) {
      setIsAnyTime(false);
    } else {
      setIsAnyTime(true);
      setTimeRange({
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
      });
    }
  };

  const clearCustomTime = () => {
    setIsAnyTime(false);
    setTimeRange({
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
    });
  };

  const allFilled =
    isAnyTime ||
    (timeRange.startDate &&
      timeRange.startTime &&
      timeRange.endDate &&
      timeRange.endTime);

  const isValidTime = () => {
    if (!allFilled || isAnyTime) return false;
    const start = new Date(`${timeRange.startDate}T${timeRange.startTime}`);
    const end = new Date(`${timeRange.endDate}T${timeRange.endTime}`);
    return start < end;
  };

  const adjustDuration = (minutes) => {
    if (isAnyTime || !timeRange.startDate || !timeRange.startTime) return;
    const startMs = Date.parse(`${timeRange.startDate}T${timeRange.startTime}`);
    if (Number.isNaN(startMs)) return;
    let endMs = Date.parse(`${timeRange.endDate}T${timeRange.endTime}`);
    if (Number.isNaN(endMs)) {
      endMs = startMs + 60 * 60 * 1000; // default +1h if none set
    }
    const minEnd = startMs + 60 * 1000;
    const newEndMs = Math.max(endMs + minutes * 60 * 1000, minEnd);
    const newEndDate = new Date(newEndMs);
    const pad = (n) => n.toString().padStart(2, "0");
    const formatted = {
      endDate: `${newEndDate.getFullYear()}-${pad(newEndDate.getMonth() + 1)}-${pad(newEndDate.getDate())}`,
      endTime: `${pad(newEndDate.getHours())}:${pad(newEndDate.getMinutes())}`,
    };
    setTimeRange((prev) => ({
      ...prev,
      ...formatted,
    }));
  };

  const getDurationText = () => {
    if (isAnyTime) return "Any duration";
    if (
      !timeRange.startDate ||
      !timeRange.startTime ||
      !timeRange.endDate ||
      !timeRange.endTime
    )
      return "";
    const startMs = Date.parse(`${timeRange.startDate}T${timeRange.startTime}`);
    const endMs = Date.parse(`${timeRange.endDate}T${timeRange.endTime}`);
    if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) return "";
    const diffMs = endMs - startMs;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.round((diffMs / (1000 * 60)) % 60);
    return `${hours}h ${minutes}m`;
  };

  const durationLabel = getDurationText();

  return (
    <div className="select-time-page">
      <nav className="dashboard-topbar">
        <div className="dashboard-logo">Parti</div>
        <div className="dashboard-buttons">
          <button onClick={() => navigate("/dashboard")}>Home</button>
          <button onClick={() => navigate("/mypartis")}>My Partis</button>
          <button onClick={() => navigate("/findpartis")}>Find Partis</button>
          <button onClick={() => navigate("/createparti")}>Create Parti</button>
          <div className="account-bar">
            <button onClick={() => navigate("/login")}>Logout</button>
          </div>
        </div>
      </nav>

      <main className="select-time-wrapper">
        {/* <header className="time-hero">
          <p className="step-label-time">Step 4</p>
          <h1 className="create-title-time">Choose date & time</h1>
          <p className="sub-text">
            Decide when gamers can hop in. Go with a polished custom window or keep it open to any time.
          </p>
        </header> */}

        <header className="step-hero">
          <h1 className="create-title-tags">
            <span className="step-prefix">Step 4:</span> Choose date & time
          </h1>
          <p className="sub-text">
          Decide when gamers can hop in. Go with a polished custom window or keep it open to any time.
          </p>
        </header>

        <section className="time-grid">
          <article className="time-card mode-card">
            <div>
              <p className="eyebrow">Availability</p>
              <h2>{isAnyTime ? "Any Time" : "Custom Range"}</h2>
              <p className="helper-text">
                Toggle between a relaxed 'Any Time' Parti or a precise schedule.
              </p>
            </div>
            <button
              className={`pill-toggle ${isAnyTime ? "active" : ""}`}
              onClick={handleAnyTime}
            >
              {isAnyTime ? "Any Time enabled" : "Use Any Time"}
            </button>
          </article>

          <article className={`time-card range-card ${isAnyTime ? "disabled" : ""}`}>
            <div className="range-columns">
              <div className="range-block">
                <p className="eyebrow">From</p>
                <div className="range-inputs">
                  <input
                    type="date"
                    value={timeRange.startDate}
                    onChange={(e) =>
                      setTimeRange({ ...timeRange, startDate: e.target.value })
                    }
                  />
                  <input
                    type="time"
                    value={timeRange.startTime}
                    onChange={(e) =>
                      setTimeRange({ ...timeRange, startTime: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="range-block">
                <p className="eyebrow">To</p>
                <div className="range-inputs">
                  <input
                    type="date"
                    value={timeRange.endDate}
                    onChange={(e) =>
                      setTimeRange({ ...timeRange, endDate: e.target.value })
                    }
                  />
                  <input
                    type="time"
                    value={timeRange.endTime}
                    onChange={(e) =>
                      setTimeRange({ ...timeRange, endTime: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <p className="helper-text">
              The Parti card will display the selected dates in your local timezone.
            </p>
          </article>

          {!isAnyTime && (
            <article className="time-card adjust-card">
              <div className="adjust-headline">
                <p className="eyebrow">Duration</p>
                <span className="duration-display">
                  {durationLabel || "Select a range"}
                </span>
              </div>

              <div className="quick-adjust">
                {[10, 30, 60].map((val) => (
                  <button key={`plus-${val}`} onClick={() => adjustDuration(val)}>
                    +{val}m
                  </button>
                ))}
                {[10, 30, 60].map((val) => (
                  <button
                    key={`neg-${val}`}
                    className="negative"
                    onClick={() => adjustDuration(-val)}
                  >
                    -{val}m
                  </button>
                ))}
              </div>

              <button className="clear-time-btn" onClick={clearCustomTime}>
                Clear and select custom time
              </button>
            </article>
          )}
        </section>

        {!isAnyTime && allFilled && !isValidTime() && (
          <p className="error-msg">Start time must be before end time.</p>
        )}
      </main>

      <div className="back-next-container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          Back
        </button>

        <button
          className="next-btn"
          onClick={handleNext}
          disabled={!allFilled || (!isAnyTime && !isValidTime())}
        >
          Next
        </button>
      </div>
    </div>
  );
}
