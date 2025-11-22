import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import heroImage from "./assets/lebron.jpg";
import { popularGames, languageOptions } from "./data/options";

const quickLookupGames = popularGames.map(game => game.name);
const gameImageMap = popularGames.reduce((map, game) => {
  map[game.name] = game.image;
  return map;
}, {});

const partiTabs = [
  {
    id: "popular",
    label: "Popular Partis",
    count: 24,
    cards: [
      { id: "cs2-premier", title: "CS2 Premier Lobby", game: "Counter-Strike 2", occupied: 28, total: 50 },
      { id: "valorant-mm", title: "Valorant MM", game: "Valorant", occupied: 24, total: 25 },
      { id: "minecraft-speedrun", title: "Minecraft Speedrun", game: "Minecraft", occupied: 6, total: 10 },
      { id: "apex-tryhards", title: "Apex Tryhards", game: "Apex Legends", occupied: 15, total: 20 }
    ]
  },
  {
    id: "large",
    label: "Large Partis",
    count: 12,
    cards: [
      { id: "lol-worlds", title: "LoL Worlds Queue", game: "League of Legends", occupied: 42, total: 50 },
      { id: "pubg-marathon", title: "PUBG Marathon", game: "PUBG", occupied: 30, total: 40 },
      { id: "cod-raid", title: "COD MWII Raid", game: "Call of Duty", occupied: 32, total: 35 },
      { id: "overwatch-esports", title: "Overwatch Esports", game: "Overwatch 2", occupied: 18, total: 25 }
    ]
  },
  {
    id: "small",
    label: "Small Partis",
    count: 9,
    cards: [
      { id: "genshin-cozy", title: "Genshin Cozy Night", game: "Genshin Impact", occupied: 4, total: 6 },
      { id: "roblox-builders", title: "Roblox Builders", game: "Roblox", occupied: 5, total: 8 },
      { id: "dota-draft", title: "DOTA Draft", game: "DOTA 2", occupied: 7, total: 9 },
      { id: "rocket-ranked", title: "Rocket Ranked", game: "Rocket League", occupied: 3, total: 4 }
    ]
  },
  {
    id: "favorites",
    label: "Favorites",
    count: 5,
    cards: [
      { id: "r6-defense", title: "R6 Defensive Squad", game: "R6 Siege", occupied: 10, total: 12 },
      { id: "tarkov-labs", title: "Tarkov Labs", game: "Escape from Tarkov", occupied: 6, total: 8 },
      { id: "elden-coop", title: "Elden Coop", game: "Elden Ring", occupied: 2, total: 4 },
      { id: "nba-scrim", title: "NBA 2K Scrim", game: "NBA 2K25", occupied: 8, total: 10 }
    ]
  }
];

const howItWorks = [
  {
    id: "01",
    title: "Set your preferences",
    copy:
      "Choose the game, language, and vibe that work best for you so we can surface tailored parties."
  },
  {
    id: "02",
    title: "Choose your parti",
    copy:
      "Browse curated parties and pick the one that matches your skill level, availability, and mood."
  },
  {
    id: "03",
    title: "Join your parti",
    copy:
      "Hop into voice, meet like-minded teammates, and jump straight into the next session together."
  }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [selectedGame, setSelectedGame] = useState(quickLookupGames[0] || "");
  const [language, setLanguage] = useState(languageOptions[0]?.english || "English");
  const [skillLevel, setSkillLevel] = useState("Select your skill");
  const [timeFrame, setTimeFrame] = useState("Select your time");
  const [activePartiTab, setActivePartiTab] = useState(partiTabs[0].id);

  useEffect(() => {
    fetch("http://localhost:3000/api/dashboard", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Not authorized");
        return res.json();
      })
      .then((json) => setData(json.data))
      .catch(() => setError("Please login first"));
  }, []);

  const handleLookup = (event) => {
    event.preventDefault();
    navigate("/findpartis", {
      state: { selectedGame, language, skillLevel, timeFrame }
    });
  };

  if (error) return <p>{error}</p>;
  if (!data) return <p>Loading...</p>;

  return (
    <div className="dashboard-page">
      <nav className="dashboard-topbar">
        <div className="dashboard-logo">Parti</div>
        <div className="dashboard-buttons">
          <button onClick={() => navigate("/dashboard")}>Home</button>
          <button onClick={() => navigate("/mypartis")}>My Partis</button>
          <button onClick={() => navigate("/findpartis")}>Find Partis</button>
          <button onClick={() => navigate("/createparti")}>Create Parti</button>
          <button onClick={() => navigate("/socials")}>Socials</button>
        </div>
        <div className="dashboard-actions">
          <button className="ghost-btn" onClick={() => navigate("/register")}>
            Register
          </button>
          <button className="primary-btn" onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="hero-tagline">Gaming shouldn't be lonely.</p>
            <h1>
              Find your perfect parti, {data.username?.split(" ")[0] || "friend"}
            </h1>
            <p className="hero-description">
              Find like-minded players and instantly match with someone to play
              anytime, anywhere. Set your vibe, pick your game, and join a party
              curated just for you.
            </p>
            <div className="hero-cta">
              <button
                className="primary-btn"
                onClick={() => navigate("/findpartis")}
              >
                Find a Parti
              </button>
              <button className="ghost-btn" onClick={() => navigate("/chat")}>
                See all Partis
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-image-wrapper">
              <img src={heroImage} alt="Gamers celebrating" />
            </div>
          </div>
        </section>

        <section className="lookup-section">
          <form className="lookup-card" onSubmit={handleLookup}>
            <div className="lookup-header">
              <span className="lookup-eyebrow">Parti Quick Lookup</span>
              <h3>Jump back into your favorite games faster.</h3>
            </div>
            <div className="lookup-grid">
              <label>
                <span>Game</span>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                >
                  {quickLookupGames.map((game) => (
                    <option key={game} value={game}>
                      {game}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Language</span>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                  {languageOptions.map((lang) => (
                    <option key={lang.english} value={lang.english}>
                      {lang.english}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Skill</span>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                >
                  <option value="Select your skill">Select your skill</option>
                  <option value="Casual">Casual</option>
                  <option value="Competitive">Competitive</option>
                  <option value="Pro-ready">Pro-ready</option>
                </select>
              </label>
              <label>
                <span>Time</span>
                <select
                  value={timeFrame}
                  onChange={(e) => setTimeFrame(e.target.value)}
                >
                  <option value="Select your time">Select your time</option>
                  <option value="Now">Now</option>
                  <option value="Tonight">Tonight</option>
                  <option value="This Weekend">This Weekend</option>
                </select>
              </label>
              <button type="submit" className="primary-btn lookup-submit">
                Search
              </button>
            </div>
          </form>
        </section>

        <section className="how-section">
          <h2>How does Parti work?</h2>
          <p className="how-description">
            Set preferences for your game, communication style, and time that
            works best. We will match you with parties that meet your interests,
            so you are never queuing alone again.
          </p>
          <div className="how-grid">
            {howItWorks.map((step) => (
              <div className="how-card" key={step.title}>
                <div className="how-icon">{step.id}</div>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="popular-section">
          <div className="popular-header">
            <h2>Popular Games</h2>
            <button className="ghost-btn" onClick={() => navigate("/findpartis")}>
              See More
            </button>
          </div>
          <div className="popular-grid">
            {popularGames.map((game) => (
              <div className="game-card" key={game.name}>
                <img
                  src={game.image}
                  className="game-image"
                  alt={game.name}
                />
                <p>{game.name}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="parti-tabs-section">
          <h2>Popular Partis</h2>
          <p className="parti-tabs-subtitle">
            See the list of active Partis that match your vibe.
          </p>

          <div className="parti-tabs">
            {partiTabs.map((tab) => (
              <button
                key={tab.id}
                className={`parti-tab ${activePartiTab === tab.id ? "active" : ""}`}
                onClick={() => setActivePartiTab(tab.id)}
              >
                <span>{tab.label}</span>
                <span className="parti-tab-count">{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="parti-card-grid">
            {partiTabs
              .find((tab) => tab.id === activePartiTab)
              ?.cards.map((card) => (
                <div className="parti-card" key={card.id}>
                  <div className="parti-card-header">
                    <h4>{card.title}</h4>
                    <button className="fav-btn" title="Save to favorites">
                      ♡
                    </button>
                  </div>
                  <div className="parti-card-image">
                    <img
                      src={gameImageMap[card.game] || heroImage}
                      alt={card.title}
                    />
                  </div>
                  <div className="parti-card-meta">
                    <span>
                      {card.occupied}/{card.total}
                    </span>
                    <button className="primary-btn join-btn">Join Now</button>
                  </div>
                </div>
              ))}
          </div>

          <div className="parti-tabs-footer">
            <button className="ghost-btn show-more-btn">Show more Partis</button>
          </div>
        </section>

        <footer className="dashboard-footer">
          <div className="footer-columns">
            <div className="footer-brand">
              <div className="footer-logo">Parti</div>
              <p>Our vision is to provide a way for gamers to never game alone.</p>
              <div className="footer-avatars">
                <span className="avatar-circle">A</span>
                <span className="avatar-circle">B</span>
                <span className="avatar-circle">C</span>
                <span className="avatar-circle">D</span>
              </div>
            </div>
            <div className="footer-links">
              <div>
                <h4>About</h4>
                <a>How it works</a>
                <a>Featured</a>
                <a>Partnership</a>
                <a>Business Relation</a>
              </div>
              <div>
                <h4>Community</h4>
                <a>Events</a>
                <a>Blog</a>
                <a>Podcast</a>
                <a>Invite a Friend</a>
              </div>
              <div>
                <h4>Socials</h4>
                <a>Discord</a>
                <a>Instagram</a>
                <a>Twitter</a>
                <a>Facebook</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>©2025 Parti Inc. All rights reserved</span>
            <button className="ghost-btn back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              Back to Top
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
