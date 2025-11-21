import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SelectLanguage.css";

export default function SelectLanguage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const languages = [
        { english: "Arabic", native: "العربية" },
        { english: "Bengali", native: "বাংলা" },
        { english: "Chinese", native: "中文" },
        { english: "Dutch", native: "Nederlands" },
        { english: "English", native: "English" },
        { english: "Finnish", native: "Suomi" },
        { english: "French", native: "Français" },
        { english: "German", native: "Deutsch" },
        { english: "Greek", native: "Ελληνικά" },
        { english: "Hebrew", native: "עברית" },
        { english: "Hindi", native: "हिन्दी" },
        { english: "Indonesian", native: "Bahasa Indonesia" },
        { english: "Italian", native: "Italiano" },
        { english: "Japanese", native: "日本語" },
        { english: "Korean", native: "한국어" },
        { english: "Malay", native: "Bahasa Melayu" },
        { english: "Polish", native: "Polski" },
        { english: "Portuguese", native: "Português" },
        { english: "Russian", native: "Русский" },
        { english: "Spanish", native: "Español" },
        { english: "Swedish", native: "Svenska" },
        { english: "Tagalog", native: "Tagalog" },
        { english: "Tamil", native: "தமிழ்" },
        { english: "Thai", native: "ไทย" },
        { english: "Turkish", native: "Türkçe" },
        { english: "Ukrainian", native: "Українська" },
        { english: "Urdu", native: "اردو" },
        { english: "Vietnamese", native: "Tiếng Việt" },
      ];
      
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
