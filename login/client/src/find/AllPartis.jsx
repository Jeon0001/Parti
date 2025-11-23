import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AllPartis.css";

export default function AllPartis() {
  const navigate = useNavigate();
  const [partis, setPartis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPartis = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/all-partis", {
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

  return (
    <div className="allpartis-page">
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

      <div className="allpartis-content">
        <h1 className="create-title">Partis for you</h1>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && partis.length === 0 && (
          <div className="no-partis">No partis available.</div>
        )}

        <div className="parti-grid">
          {Array.isArray(partis) &&
            partis.map((parti, index) => (
              <div 
                className="parti-card" 
                key={index}
                onClick={() => {
                  if (parti.chatRoomName) {
                    navigate('/chat', { state: { chatRoomName: parti.chatRoomName } });
                  }
                }}
                style={{ cursor: parti.chatRoomName ? 'pointer' : 'default' }}
              >
                {parti.selectedGame?.image && (
                  <img
                    src={parti.selectedGame.image}
                    alt={parti.selectedGame.name}
                    className="parti-image"
                  />
                )}
                <div className="parti-card-content">
                  <h3>{parti.visibleName || parti.selectedGame?.name}</h3>
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
                      ? (parti.timeRange.startDate === "Any"
                          ? "Any Time"
                          : `${parti.timeRange.startDate} ${parti.timeRange.startTime} - ${parti.timeRange.endDate} ${parti.timeRange.endTime}`)
                      : "No time selected"}
                  </p>
                  {parti.chatRoomName && (
                    <p style={{ marginTop: '10px', color: '#9ed6b9', fontSize: '14px' }}>
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
