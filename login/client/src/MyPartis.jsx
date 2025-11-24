import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./MyPartis.css";

export default function MyPartis() {
  const navigate = useNavigate();
  const location = useLocation();
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

  useEffect(() => {
    const updated = location.state?.updatedParti;
    if (!updated) return;

    setPartis((prev) => {
      const exists = prev.some((p) => p.id === updated.id);
      if (!exists) return prev;
      return prev.map((p) => (p.id === updated.id ? updated : p));
    });

    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  const goToManage = (parti, e) => {
    e.stopPropagation();
    navigate(`/mypartis/manage/${parti.id}`, { state: { parti } });
  };

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
          <button onClick={() => navigate("/socials")}>Socials</button>
          <div className="account-bar">
            <button onClick={() => navigate("/login")}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="mypartis-content">
        <h1 className="create-title">My Partis</h1>

        {partis.length === 0 ? (
          <div className="no-partis">You haven't created any partis yet!</div>
        ) : (
          <div className="parti-grid">
            {partis.map((parti) => (
              <div
                key={parti.id}
                className={`parti-card ${parti.chatRoomName ? "clickable" : ""}`}
                onClick={() => {
                  if (parti.chatRoomName) {
                    navigate("/chat", {
                      state: {
                        chatRoomName: parti.chatRoomName,
                        partiVisibleName:
                          parti.visibleName ||
                          parti.selectedGame?.name ||
                          "Parti Chat",
                        partiId: parti.id,
                      },
                    });
                  }
                }}
                style={{ cursor: parti.chatRoomName ? "pointer" : "default" }}
              >
                {parti.selectedGame?.image && (
                  <div className="parti-card-media">
                    <img src={parti.selectedGame.image} alt={parti.selectedGame.name} />
                    <span className="media-label">{parti.selectedGame.name}</span>
                  </div>
                )}
                <div className="parti-card-content">
                  <div className="card-top">
                    <div>
                      <p className="card-label">Chatroom</p>
                      <h3>{parti.visibleName || parti.selectedGame?.name}</h3>
                    </div>
                  </div>

                  <div className="card-meta">
                    <div className="meta-block">
                      <span className="meta-label">Host</span>
                      <strong>{parti.hostUsername}</strong>
                    </div>
                    <div className="meta-block">
                      <span className="meta-label">Languages</span>
                      <strong>{(parti.selectedLanguages || []).slice(0, 2).join(", ") || "N/A"}</strong>
                      {parti.selectedLanguages?.length > 2 && (
                        <small>+{parti.selectedLanguages.length - 2} more</small>
                      )}
                    </div>
                  </div>

                  <div className="tag-list">
                    {(parti.selectedTags || []).slice(0, 4).map((tag, index) => (
                      <span key={`${tag}-${index}`} className="tag-pill">{tag}</span>
                    ))}
                    {parti.selectedTags?.length > 4 && (
                      <span className="tag-pill muted">+{parti.selectedTags.length - 4}</span>
                    )}
                  </div>

                  <div className="card-footer">
                    <div>
                      <span className="meta-label">Chatroom ID</span>
                      <p className="meta-value">{parti.chatRoomName || "Not set"}</p>
                    </div>
                    <div>
                      <span className="meta-label">Time</span>
                      <p className="meta-value">
                        {parti.timeRange?.startDate === "Any"
                          ? "Any Time"
                          : `${parti.timeRange?.startDate} ${parti.timeRange?.startTime} - ${parti.timeRange?.endDate} ${parti.timeRange?.endTime}`}
                      </p>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      className="manage-btn"
                      onClick={(e) => goToManage(parti, e)}
                    >
                      Manage Parti
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
