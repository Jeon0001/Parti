import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./AllPartis.css";

export default function AllPartis() {
  const navigate = useNavigate();
  const location = useLocation();

  // Filters from navigation (optional)
  const filters = location.state || {};

  const [partis, setPartis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all partis
  useEffect(() => {
    const fetchPartis = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/allpartis", {
          withCredentials: true,
        });

        if (res.data.success && Array.isArray(res.data.partis)) {
          setPartis(res.data.partis);
        } else {
          setPartis([]);
          setError(res.data.message || "No partis found");
        }
      } catch (err) {
        console.error(err);
        setError("Server error. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPartis();
  }, []);

  // ============================
  //       FILTER LOGIC
  // ============================

  const filteredPartis = partis.filter((parti) => {
    // 1. Games filter
    if (filters.selectedGames && filters.selectedGames.length > 0) {
        const filterGameNames = filters.selectedGames.map(g => g.name);
        const partiGameName = parti.selectedGame?.name;
      
        // Keep the parti if its game is in the filter
        if (!filterGameNames.includes(partiGameName)) return false;
      }
      

    // 2. Languages filter
    if (filters.selectedLanguages?.length > 0) {
      if (!filters.selectedLanguages.some((lang) => parti.selectedLanguages?.includes(lang)))
        return false;
    }

    // // 3. Tags filter
    if (filters.selectedTags?.length > 0) {
        // If parti has no tags, consider it as "any" (passes the filter)
        if (parti.selectedTags?.length > 0) {
          if (!filters.selectedTags.some((tag) => parti.selectedTags.includes(tag))) return false;
        }
        // else: parti has no tags → passes automatically
      }
      

    // 4. Time range filter
    if (filters.timeRange && parti.timeRange) {
        // If either filter or parti has "Any" time, pass automatically
        if (
          filters.timeRange.startDate === "Any" ||
          filters.timeRange.endDate === "Any" ||
          parti.timeRange.startDate === "Any" ||
          parti.timeRange.endDate === "Any"
        ) {
          // pass through
        } else {
          const filterStart = new Date(`${filters.timeRange.startDate}T${filters.timeRange.startTime}`);
          const filterEnd = new Date(`${filters.timeRange.endDate}T${filters.timeRange.endTime}`);
      
          const partiStart = new Date(`${parti.timeRange.startDate}T${parti.timeRange.startTime}`);
          const partiEnd = new Date(`${parti.timeRange.endDate}T${parti.timeRange.endTime}`);
      
          // Filter range must be fully inside the parti range
          if (filterStart < partiStart || filterEnd > partiEnd) {
            return false;
          }
        }
      }
      
      

    return true;
  });

  // If no filter provided → show all partis
  const finalPartis =
    Object.keys(filters).length === 0 ? partis : filteredPartis;

    return (
        <div className="allpartis-page">
          {/* Topbar */}
          <nav className="dashboard-topbar" onClick={() => navigate("/dashboard")}>
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
    
          <div className="allpartis-content">
            <h1 className="create-title">Partis for you</h1>
    
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
    
            {!loading && finalPartis.length === 0 && (
              <div className="no-partis">No partis match your filters.</div>
            )}
    
            {/* Grid of parti cards */}
            <div className="parti-grid">
              {finalPartis.map((parti, index) => (
                <div
                  className="parti-card"
                  key={index}
                  onClick={() => {
                    if (parti.chatRoomName) {
                      navigate("/chat", {
                        state: { chatRoomName: parti.chatRoomName },
                      });
                    }
                  }}
                  style={{ cursor: parti.chatRoomName ? "pointer" : "default" }}
                >
                  {/* Game image */}
                  {parti.selectedGame && (
                    <img
                    src={parti.selectedGame.image}
                    alt={parti.selectedGame.name}
                    className="parti-image"
                  />
                  
                  )}
    
                  <div className="parti-card-content">
                    <h3>
                      {parti.visibleName ||
                        parti.selectedGame.name ||
                        "Unknown Game"}
                    </h3>
    
                    <p>
                      <strong>Host:</strong> {parti.hostUsername}
                    </p>
    
                    {parti.chatRoomName && (
                      <p>
                        <strong>Chatroom ID:</strong> {parti.chatRoomName}
                      </p>
                    )}
    
                    <p>
                      <strong>Languages:</strong>{" "}
                      {parti.selectedLanguages?.join(", ")}
                    </p>
    
                    <p className="tags">
                      {parti.selectedTags?.map((tag, i) => (
                        <span key={i}>{tag}</span>
                      ))}
                    </p>
    
                    <p className="time-range">
  {parti.timeRange
    ? parti.timeRange.startDate === "Any"
      ? "Any Time"
      : `${parti.timeRange.startDate} ${parti.timeRange.startTime} - ${parti.timeRange.endDate} ${parti.timeRange.endTime}`
    : "No time selected"}
</p>

    
                    {parti.chatRoomName && (
                      <p
                        style={{
                          marginTop: "10px",
                          color: "#9ed6b9",
                          fontSize: "14px",
                        }}
                      >
                        Click to join chat room
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }