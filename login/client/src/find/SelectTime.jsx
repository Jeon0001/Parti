// import React, { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import "./SelectTime.css"; // reuse same styling

// export default function SelectTime() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const { selectedGames, selectedLanguages, selectedTags } = location.state || {};

//   // Store date & time in a dictionary
//   const [timeRange, setTimeRange] = useState({
//     startDate: "",
//     startTime: "",
//     endDate: "",
//     endTime: "",
//   });
//   const [isAnyTime, setIsAnyTime] = useState(false);

//   const handleNext = () => {
    
//     const finalTimeRange = isAnyTime 
//       ? { startDate: "Any", startTime: "Any", endDate: "Any", endTime: "Any" }
//       : timeRange;
    
//     // console.log("Selected Game:", selectedGames);
//     // console.log("Selected Languages:", selectedLanguages);
//     // console.log("Selected Tags:", selectedTags);
//     // console.log("Selected Time:", finalTimeRange);

//     navigate("/allpartis", {
//       state: {
//         selectedGames,
//         selectedLanguages,
//         selectedTags,
//         timeRange: finalTimeRange,
//       },
//     });
//   };

//   const handleAnyTime = () => {
//     setIsAnyTime(true);
//     setTimeRange({
//       startDate: "",
//       startTime: "",
//       endDate: "",
//       endTime: "",
//     });
//   };

//   const handleCustomTime = () => {
//     setIsAnyTime(false);
//   };

//   // Check if all fields are filled (or if Any Time is selected)
//   const allFilled =
//     isAnyTime ||
//     (timeRange.startDate &&
//       timeRange.startTime &&
//       timeRange.endDate &&
//       timeRange.endTime);

//   // Check if start datetime is before end datetime
//   const isValidTime = () => {
//     if (!allFilled) return false;

//     const start = new Date(`${timeRange.startDate}T${timeRange.startTime}`);
//     const end = new Date(`${timeRange.endDate}T${timeRange.endTime}`);

//     return start < end;
//   };

//   return (
//     <div className="select-tags-page">

//       {/* Topbar */}
//       <nav className="dashboard-topbar">
//         <div className="dashboard-logo">Parti</div>
//         <div className="dashboard-buttons">
//           <button onClick={() => navigate("/dashboard")}>Home</button>
//           <button onClick={() => navigate("/mypartis")}>My Partis</button>
//           <button onClick={() => navigate("/findpartis")}>Find Partis</button>
//           <button onClick={() => navigate("/createparti")}>Create Parti</button>
//           <div className="account-bar">
//             <button onClick={() => navigate("/login")}>Logout</button>
//           </div>
//         </div>
//       </nav>

//       {/* Main Content */}
//       <div className="select-tags-content">
//         <h1 className="create-title">Step 4: Choose date & time</h1>

//         {/* <p>
//   Selected Games:{" "}
//   <span>
//     {selectedGames?.length > 0
//       ? selectedGames.map(g => g.name).join(", ")
//       : "None"}
//   </span>
// </p>
//           <p>
//             Selected Languages: <span>{selectedLanguages?.length > 0 ? selectedLanguages.join(", ") : "None"}</span>
//           </p> */}

//         {/* Any Time Button */}
//         <div style={{ marginBottom: '20px', textAlign: 'center' }}>
//           <button
//             onClick={handleAnyTime}
//             style={{
//               padding: '12px 24px',
//               background: isAnyTime ? '#ffffff' : 'transparent',
//               color: isAnyTime ? '#0d1f19' : '#ffffff',
//               border: '1px solid rgba(255, 255, 255, 0.4)',
//               borderRadius: '999px',
//               cursor: 'pointer',
//               fontSize: '15px',
//               fontWeight: isAnyTime ? '600' : '400',
//               transition: 'all 0.2s ease'
//             }}
//           >
//             Any Time
//           </button>
//         </div>

//         {isAnyTime && (
//           <p style={{ 
//             textAlign: 'center', 
//             color: '#9ed6b9', 
//             marginBottom: '20px',
//             fontSize: '14px'
//           }}>
//             Selected: Any Time
//           </p>
//         )}

//         {!isAnyTime && (
//           <p style={{ 
//             textAlign: 'center', 
//             color: '#9ed6b9', 
//             marginBottom: '20px',
//             fontSize: '14px'
//           }}>
//             Or select a specific time range:
//           </p>
//         )}

//         <div className="time-input-container" style={{ opacity: isAnyTime ? 0.5 : 1, pointerEvents: isAnyTime ? 'none' : 'auto' }}>

//           <div className="time-input-block">
//             <label>From</label>
//             <input
//               type="date"
//               value={timeRange.startDate}
//               onChange={(e) =>
//                 setTimeRange({ ...timeRange, startDate: e.target.value })
//               }
//               className="custom-tag-input"
//             />
//             <input
//               type="time"
//               value={timeRange.startTime}
//               onChange={(e) =>
//                 setTimeRange({ ...timeRange, startTime: e.target.value })
//               }
//               className="custom-tag-input"
//             />
//           </div>

//           <div className="time-input-block">
//             <label>To</label>
//             <input
//               type="date"
//               value={timeRange.endDate}
//               onChange={(e) =>
//                 setTimeRange({ ...timeRange, endDate: e.target.value })
//               }
//               className="custom-tag-input"
//             />
//             <input
//               type="time"
//               value={timeRange.endTime}
//               onChange={(e) =>
//                 setTimeRange({ ...timeRange, endTime: e.target.value })
//               }
//               className="custom-tag-input"
//             />
//           </div>

//         </div>

//         {!isAnyTime && (
//           <div style={{ textAlign: 'center', marginTop: '10px' }}>
//             <button
//               onClick={handleCustomTime}
//               style={{
//                 padding: '8px 16px',
//                 background: 'transparent',
//                 color: '#9ed6b9',
//                 border: '1px solid rgba(158, 214, 185, 0.4)',
//                 borderRadius: '999px',
//                 cursor: 'pointer',
//                 fontSize: '13px'
//               }}
//             >
//               Clear and select custom time
//             </button>
//           </div>
//         )}

//         {/* Error message */}
//         {!isAnyTime && allFilled && !isValidTime() && (
//           <p className="error-msg">Start time must be before end time!</p>
//         )}
//       </div>

//       {/* Navigation Buttons */}
//       <div className="back-next-container">
//         <button className="back-btn" onClick={() => navigate(-1)}>Back</button>

//         <button
//           className="next-btn"
//           onClick={handleNext}
//           disabled={!allFilled || (!isAnyTime && !isValidTime())} // Disable if not valid
//         >
//           Next
//         </button>
//       </div>

//     </div>
//   );
// }

//-----------------------------------------------------------------------------------

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SelectTime.css";

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
      <header className="step-hero">
          <h1 className="create-title-tags">
            <span className="step-prefix">Step 4:</span> Choose date & time
          </h1>
          <p className="sub-text">
          Decide when gamers can hop in. Go with a polished custom window or keep it open to any time.
          </p>
        </header>

        {/* <p>
  Selected Games:{" "}
  <span>
    {selectedGames?.length > 0
      ? selectedGames.map(g => g.name).join(", ")
      : "None"}
  </span>
</p>
          <p>
            Selected Languages: <span>{selectedLanguages?.length > 0 ? selectedLanguages.join(", ") : "None"}</span>
          </p> */}

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
