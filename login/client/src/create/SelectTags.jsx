import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SelectTags.css";

export default function SelectTags() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedGame, selectedLanguages } = location.state || {};

  const popularTags = [
    "Chill", "Fun", "Ranked", "Casual", "Competitive",
    "Co-op", "Solo", "Party", "Challenge", "Relax",
    "Beginner-Friendly",
    "Tryhard",
    "No-Mic",
    "Mic-Only",
    "Late-Night",
    "Friendly",
    "Toxic-Free",
    "Pro",
    "Warmup",
    "Strategy",
    "Fast-Paced",
    "Slow-Paced",
    "Learning",
    "Speedrun",
    "Just Vibes",
    "Tilt-Proof",
    "Coach Needed",
    "Looking for Team",
    "Event",
    "Duo",
    "Trio",
    "Squad",
    "High-Energy",
    "Low-Energy",
    "No-Sweat",
    "Sweaty",
    "Tryouts",
    "AFK-Friendly",
    "Story Mode",
    "Grind",
    "Loot",
    "Questing",
    "Practice",
    "Streaming",
  ];
  

  const [searchQuery, setSearchQuery] = useState("");
  const [customTag, setCustomTag] = useState("");

  const [selectedTags, setSelectedTags] = useState([]);

  const filteredTags = popularTags.filter(tag =>
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag)
      ? prev.filter(t => t !== tag)
      : [...prev, tag]
    );
  };

  const handleNext = () => {
    // console.log("Selected Game:", selectedGame);
    // console.log("Selected Languages:", selectedLanguages);
    // console.log("Selected Tags:", selectedTags);
    navigate("/selecttime", { state: { selectedGame, selectedLanguages, selectedTags } });
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

      {/* Main content */}
      <div className="select-tags-content">
        <h1 className="create-title">Step 3: Choose your tags</h1>

        {/* Show selected game & languages */}
        <div className="selected-game-label">

          {/* FOR DEBUGGING PURPOSES */}
          
          
          <p>
            Selected Game: <span>{selectedGame?.name || "None"}</span>
          </p>
          <p>
            Selected Languages: <span>{selectedLanguages?.length > 0 ? selectedLanguages.join(", ") : "None"}</span>
          </p>
          


        </div>

        {/* Search bar */}
        <input
          type="text"
          placeholder="Search tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="language-search"
        />

        {/* Tags grid */}
        <div className="language-list">
          {filteredTags.map(tag => (
            <div
              key={tag}
              className={`tag-card ${selectedTags.includes(tag) ? "selected" : ""}`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* Custom tag input */}

{/* <div className="custom-tag-container">
  <input
    type="text"
    placeholder="Create your own tag..."
    value={customTag}
    onChange={(e) => setCustomTag(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter" && customTag.trim() !== "") {
        if (!selectedTags.includes(customTag.trim())) {
          setSelectedTags([...selectedTags, customTag.trim()]);
        }
        setCustomTag(""); // clear input
      }
    }}
    className="custom-tag-input"
  />
  <button
    className="add-tag-btn"
    disabled={customTag.trim() === ""}
    onClick={() => {
      if (customTag.trim() !== "" && !selectedTags.includes(customTag.trim())) {
        setSelectedTags([...selectedTags, customTag.trim()]);
        setCustomTag("");
      }
    }}
  >
    Add Tag
  </button> */
/* </div> */}


      </div>

      {/* Back & Next buttons */}
      <div className="back-next-container">
          <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
          <button
            className="next-btn"
            onClick={handleNext}
            // Tag shouldn't be mandatory
            // disabled={selectedTags.length === 0}
          >
            Next
          </button>
        </div>
    </div>
  );
}
