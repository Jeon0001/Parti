import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MyPartis.css";

export default function MyPartis() {
  const navigate = useNavigate();
  const [partis, setPartis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPartis = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/my-partis", {
          withCredentials: true,
        });

        if (res.data.success) {
          setPartis(res.data.partis);
        } else {
          setError(res.data.message || "Failed to fetch partis.");
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

  return (
    <div className="mypartis-page">
      {/* Topbar */}
      <nav className="dashboard-topbar">
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

      <div className="mypartis-content">
        <h1 className="create-title">My Partis</h1>

        {partis.length === 0 ? (
          <div className="no-partis">You haven’t created any partis yet!</div>
        ) : (
          <div className="parti-grid">
            {partis.map((parti, index) => (
              <div className="parti-card" key={index}>
                {parti.selectedGame?.image && (
                  <img src={parti.selectedGame.image} alt={parti.selectedGame.name} />
                )}
                <div className="parti-card-content">
                  <h3>{parti.selectedGame?.name}</h3>
                  <p><strong>Host:</strong> {parti.hostUsername}</p>
                  <p><strong>Languages:</strong> {parti.selectedLanguages.join(", ")}</p>
                  <p className="tags">
                    {parti.selectedTags.map((tag, i) => (
                      <span key={i}>{tag}</span>
                    ))}
                  </p>
                  <p className="time-range">
                    {parti.timeRange.startDate} {parti.timeRange.startTime} - {parti.timeRange.endDate} {parti.timeRange.endTime}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
