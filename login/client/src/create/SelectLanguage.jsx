import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SelectLanguage.css";
import { languageOptions } from "../data/options";

export default function SelectLanguage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const languages = languageOptions;
      
      const filteredLanguages = languages.filter(lang =>
        lang.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lang.native.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      

      const handleSelect = (lang) => {
        if (selectedLanguages.includes(lang)) {
          setSelectedLanguages(selectedLanguages.filter(l => l !== lang));
        } else {
          setSelectedLanguages([...selectedLanguages, lang]);
        }
      };
      

  const navigate = useNavigate();
  const location = useLocation();
  const { selectedGame } = location.state || {};

  return (
    <div className="language-page">

      {/* Top Navigation Bar */}
      <nav className="dashboard-topbar">
        <div className="dashboard-logo">Parti</div>

        <div className="dashboard-buttons">
          <button onClick={() => navigate("/dashboard")}>Home</button>
          <button onClick={() => navigate("/my-partis")}>My Partis</button>
          <button onClick={() => navigate("/find-partis")}>Find Partis</button>
          <button onClick={() => navigate("/create")}>Create Parti</button>
          <button onClick={() => navigate("/socials")}>Socials</button>

          <div className="account-bar">
            <img src="/profile.jpg" alt="pfp" />
            <button onClick={() => navigate("/account")}>Logout</button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="language-content">
        <h1 className="create-title">Step 2: Choose your languages</h1>

        {/* Search bar */}
        <input
          type="text"
          placeholder="Search language..."
          className="language-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Language list */}
        <div className="language-list">
        {filteredLanguages.map((lang) => (
    <div
      key={lang.english}
      className={`language-card ${selectedLanguages.includes(lang.english) ? "selected" : ""}`}
      onClick={() => handleSelect(lang.english)}
    >
      <strong className="lang-english">{lang.english}</strong>
      <br />
      <span className="lang-native">{lang.native}</span>
    </div>
  ))}

        </div>

    
      </div>

      <div className="back-next-container">
        {/* Back Button */}
        <button className="back-btn" onClick={() => navigate(-1)}>
          Back
        </button>

        {/* Next Button */}
        <button
  className="next-btn"
  disabled={selectedLanguages.length === 0}
  onClick={() => navigate("/selecttags", { state: { selectedGame, selectedLanguages } })}
>
  Next
</button>
</div>

    </div>
  );
}
