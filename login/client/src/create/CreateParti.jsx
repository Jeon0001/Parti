import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateParti.css";
import { popularGames } from "../data/options";

export default function CreateParti() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState(null);

  const handleSelect = (game) => {
    setSelectedGame(prev => prev?.name === game.name ? null : game);
  };

  const navigate = useNavigate();
  const handleNext = () => {
    if (!selectedGame) return;
    navigate("/create/selectlanguage", { state: { selectedGame } });
  };

  const filteredGames = popularGames.filter(game =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="create-page">

      {/* Video background (only if wallpaper exists) */}
      {selectedGame?.wallpaper && (
    <>
      <video
        className="wallpaper-video"
        autoPlay
        loop
        muted
        src={selectedGame.wallpaper}
        type="video/mp4"
      />
      {/* Dim overlay */}
      <div className="video-overlay"></div>
    </>
  )}

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
      <div className="create-content">
        <header className="step-hero">
          <h1 className="create-title-game">
            <span className="step-prefix">Step 1:</span> Select your game
          </h1>
          <p className="sub-text">
            Browse curated hits and pick the title your Parti will rally behind.
          </p>
        </header>

        <input
          type="text"
          placeholder="Search for a game..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="game-search"
        />

        <div className="games-grid">
          {filteredGames.map((game, index) => (
            <div
              key={index}
              className={`game-card ${selectedGame?.name === game.name ? "selected" : ""}`}
              onClick={() => handleSelect(game)}
            >
              <img src={game.image} alt={game.name} className="game-image" />
              <p>{game.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="back-next-container">
        <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
        <button className="next-btn" disabled={!selectedGame} onClick={handleNext}>Next</button>
      </div>
    </div>
  );
}
