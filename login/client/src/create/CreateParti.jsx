import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateParti.css";

// Goated games frrrr
const popularGames = [
    { name: "Counter-Strike 2", image: "../games/cs2.jpeg" },
    { name: "League of Legends", image: "../games/lol.jpg" },
    { name: "Valorant", image: "../games/valorant.avif" },
    { name: "EA FC26", image: "../games/fifa.jpg" },
    { name: "Minecraft", image: "../games/minecraft.avif" },
    { name: "R6 Siege", image: "../games/r6.jpg" },
    { name: "Fortnite", image: "../games/fortnite.jpg" },
    { name: "Apex Legends", image: "../games/apex.avif" },
    { name: "DOTA 2", image: "../games/dota2.webp" },
    { name: "Rocket League", image: "../games/rl.jpeg" },
    { name: "Call of Duty", image: "../games/cod.avif" },
    { name: "Overwatch 2", image: "../games/overwatch.jpg" },
    { name: "PUBG", image: "../games/pubg.webp" },
    { name: "Genshin Impact", image: "../games/genshin.avif" },
    { name: "Roblox", image: "../games/roblox.jpg" },
    { name: "Escape from Tarkov", image: "../games/tarkov.jpg" },
    { name: "Elden Ring", image: "../games/eldenring.jpg" },
    { name: "Spider-Man", image: "../games/spiderman.avif" },
    { name: "Red Dead Redemption 2", image: "../games/rdr2.png" },
    { name: "GTA V", image: "../games/gtav.jpg" },
    { name: "Lethal Company", image: "../games/lethal.jpg" },
    { name: "Palworld", image: "../games/palworld.jpg" },
    { name: "Monster Hunter", image: "../games/mhw.jpg" },
    { name: "NBA 2K25", image: "../games/nba.avif" }
];

export default function CreateParti() {
  const [searchQuery, setSearchQuery] = useState("");

  /* For game selection bruuuuh */
  const [selectedGame, setSelectedGame] = useState(null);
  const handleSelect = (game) => {
    setSelectedGame(prev => prev?.name === game.name ? null : game);
  };

  const navigate = useNavigate();

  const handleNext = () => {
    if (!selectedGame) return;
    navigate("/selectlanguage", {
      state: { selectedGame }
    });
  };

  const filteredGames = popularGames.filter(game =>
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
        <h1 className="create-title">Step 1: Choose a game</h1>

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
