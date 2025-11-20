import React, { useEffect, useState } from "react";
import './Dashboard.css';
import lebron from "./assets/lebron.jpg"; // relative to Dashboard.jsx


export default function Dashboard() {
  
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/dashboard", { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Not authorized");
        return res.json();
      })
      .then(json => setData(json.data))
      .catch(err => setError("Please login first"));
  }, []);

  if (error) return <p>{error}</p>;
  if (!data) return <p>Loading...</p>;
  // console.log(data);
  return (

    /* I keep this code because this is legacy!!! LEBRON JAMES!!!!! */
    
    // <div
    //   className="dashboard-container"
    //   style={{ backgroundImage: `url(${lebron})` }} // dynamic import
    // >
    //   <div className="dashboard-overlay">
    //     <h1>Welcome, {data.username}!</h1>
    //     <p>Enjoy the game!</p>
    //   </div>
    // </div>

    <div className="dashboard-page">
      {/* Top Navigation Bar */}
      <nav className="dashboard-topbar">
        <div className="dashboard-logo">Parti</div>
        <div className="dashboard-buttons">
          <button>Home</button>
          <button>My Partis</button>
          <button>Find Partis</button>
          <button>Create Parti</button>
          <button>Socials</button>
          <button>Logout</button>
        </div>
      </nav>

      {/* Main Content */}
      {/* <div className="dashboard-content">
        <h1>Welcome, {data.username}!</h1>
        <p>Your email: {data.email}</p>
        <p>Enjoy the game!</p>
      </div> */}

      <div className="welcome-page">
      <h1 className="welcome-title">Welcome to Parti, {data.username}!</h1>
      <p className="welcome-subtitle">Connect, Create, and Share your Partis</p>
      <h2 className="games-title">Popular Games</h2>

<div className="games-grid">
  <div className="game-card">
    <img src="../games/lol.jpg" className="game-image" alt="League of Legends" />
    <p>League of Legends</p>
  </div>
  <div className="game-card">
    <img src="../games/valorant.avif" className="game-image" alt="Valorant" />
    <p>Valorant</p>
  </div>
  <div className="game-card">
    <img src="../games/fifa.jpg" className="game-image" alt="EA FC/FIFA" />
    <p>EA FC26</p>
  </div>
  <div className="game-card">
    <img src="../games/minecraft.avif" className="game-image" alt="Minecraft" />
    <p>Minecraft</p>
  </div>
  <div className="game-card">
    <img src="../games/r6.jpg" className="game-image" alt="Rainbow Six Siege" />
    <p>R6 Siege</p>
  </div>
  <div className="game-card">
    <img src="../games/fortnite.jpg" className="game-image" alt="Fortnite" />
    <p>Fortnite</p>
  </div>
  <div className="game-card">
    <img src="../games/apex.avif" className="game-image" alt="Apex Legends" />
    <p>Apex Legends</p>
  </div>

  <div className="game-card">
    <img src="../games/cs2.jpeg" className="game-image" alt="Counter-Strike 2" />
    <p>CS2</p>
  </div>

  <div className="game-card">
    <img src="../games/dota2.webp" className="game-image" alt="DOTA 2" />
    <p>DOTA 2</p>
  </div>

  <div className="game-card">
    <img src="../games/rl.jpeg" className="game-image" alt="Rocket League" />
    <p>Rocket League</p>
  </div>

  <div className="game-card">
    <img src="../games/cod.avif" className="game-image" alt="Call of Duty" />
    <p>Call of Duty</p>
  </div>

  <div className="game-card">
    <img src="../games/overwatch.jpg" className="game-image" alt="Overwatch 2" />
    <p>Overwatch 2</p>
  </div>

  <div className="game-card">
    <img src="../games/pubg.webp" className="game-image" alt="PUBG" />
    <p>PUBG</p>
  </div>

  <div className="game-card">
    <img src="../games/genshin.avif" className="game-image" alt="Genshin Impact" />
    <p>Genshin Impact</p>
  </div>

  <div className="game-card">
    <img src="../games/roblox.jpg" className="game-image" alt="Roblox" />
    <p>Roblox</p>
  </div>

  <div className="game-card">
    <img src="../games/tarkov.jpg" className="game-image" alt="Escape from Tarkov" />
    <p>Escape from Tarkov</p>
  </div>

  <div className="game-card">
    <img src="../games/eldenring.jpg" className="game-image" alt="Elden Ring" />
    <p>Elden Ring</p>
  </div>

  <div className="game-card">
    <img src="../games/spiderman.avif" className="game-image" alt="Spider-Man" />
    <p>Spider-Man</p>
  </div>

  <div className="game-card">
    <img src="../games/rdr2.png" className="game-image" alt="Red Dead Redemption 2" />
    <p>RDR2</p>
  </div>

  <div className="game-card">
    <img src="../games/gtav.jpg" className="game-image" alt="GTA V" />
    <p>GTA V</p>
  </div>

  <div className="game-card">
    <img src="../games/lethal.jpg" className="game-image" alt="Lethal Company" />
    <p>Lethal Company</p>
  </div>

  <div className="game-card">
    <img src="../games/palworld.jpg" className="game-image" alt="Palworld" />
    <p>Palworld</p>
  </div>

  <div className="game-card">
    <img src="../games/mhw.jpg" className="game-image" alt="Palworld" />
    <p>Monster Hunter</p>
  </div>

  <div className="game-card">
    <img src="../games/nba.avif" className="game-image" alt="NBA 2K25" />
    <p>NBA 2K25</p>
  </div>

</div>

<div style={{ textAlign: "center" }}>
          <button className="see-more-btn">
            See More
          </button>
        </div>

</div>
    
</div>
    
  
  );
}
