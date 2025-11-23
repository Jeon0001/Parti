import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./FindParti.css";
import { popularGames } from "../data/options";

export default function FindParti() {
  const [searchQuery, setSearchQuery] = useState("");

  // Store selected games as a dictionary
  const [selectedGames, setSelectedGames] = useState({});

  const toggleGame = (game) => {
    setSelectedGames((prev) => {
      const copy = { ...prev };

      if (copy[game.name]) {
        delete copy[game.name]; // remove game
      } else {
        copy[game.name] = game; // add game
      }

      return copy;
    });
  };

  const navigate = useNavigate();

  const handleNext = () => {
    if (Object.keys(selectedGames).length === 0) return;
    navigate("/find/selectlanguage", { state: { selectedGames } });
  };

  const filteredGames = popularGames.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="create-page">

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
        <h1 className="create-title">Step 1: Select your games</h1>

        <input
          type="text"
          placeholder="Search for a game..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="game-search"
        />

        <div className="games-grid">
          {filteredGames.map((game) => {
            const isSelected = !!selectedGames[game.name];

            return (
              <div
                key={game.name}
                className={`game-card ${isSelected ? "selected" : ""}`}
                onClick={() => toggleGame(game)}
              >
                <img src={game.image} alt={game.name} className="game-image" />
                <p>{game.name}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="back-next-container">
        <button className="back-btn" onClick={() => navigate(-1)}>Back</button>
        <button
          className="next-btn"
          disabled={Object.keys(selectedGames).length === 0}
          onClick={handleNext}
        >
          Next
        </button>
      </div>

    </div>
  );
}
