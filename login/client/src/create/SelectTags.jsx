import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./SelectTags.css";

export default function SelectTags() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedGame, selectedLanguages } = location.state || {};

  const tagCategories = {
    Vibe: ["Chill", "Fun", "Relax", "Just Vibes", "Friendly", "Toxic-Free", "Low-Energy", "No-Sweat", "Tilt-Proof", "Warmup"],
    Competitive: ["Ranked", "Casual", "Competitive", "Tryhard", "Pro", "Sweaty", "Tryouts", "High-Energy"],
    Group: ["Co-op", "Party", "Challenge", "Looking for Team", "Event", "Duo", "Trio", "Squad"],
    Playstyle: ["Solo", "Strategy", "Fast-Paced", "Slow-Paced", "Learning", "Story Mode", "Practice"],
    Logistics: ["Beginner-Friendly", "No-Mic", "Mic-Only", "Late-Night", "Coach Needed", "AFK-Friendly", "Streaming"],
    Objectives: ["Speedrun", "Grind", "Loot", "Questing"]
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [customTag, setCustomTag] = useState("");

  const [selectedTags, setSelectedTags] = useState([]);

  const filteredTags = Object.entries(tagCategories).reduce((acc, [group, tags]) => {
    const matches = tags.filter(tag =>
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (matches.length) acc.push({ group, tags: matches });
    return acc;
  }, []);

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
    navigate("/create/selecttime", { state: { selectedGame, selectedLanguages, selectedTags } });
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

      {/* Main content */}
      <div className="select-tags-content">
        <header className="step-hero">
          <h1 className="create-title">
            <span className="step-prefix">Step 3:</span> Choose your tags
          </h1>
          <p className="sub-text">
            Describe the vibe, skill, and goals of your Parti so the right players find you instantly.
          </p>
        </header>

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
          className="tag-search"
        />

        {/* Tags grid */}
        <div className="tags-grid">
          {filteredTags.map(({ group, tags }) => (
            <section key={group} className="tag-section">
              <h3>{group}</h3>
              <div className="tag-list">
                {tags.map(tag => (
                  <button
                    key={tag}
                    className={`tag-card ${selectedTags.includes(tag) ? "selected" : ""}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>
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
