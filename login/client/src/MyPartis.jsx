import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./MyPartis.css";

export default function MyPartis() {
  const navigate = useNavigate();
  const [partis, setPartis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingParti, setEditingParti] = useState(null);
  const [editChatRoomName, setEditChatRoomName] = useState("");
  const [editVisibleName, setEditVisibleName] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);

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

  const handleEditClick = (parti, e) => {
    e.stopPropagation(); // Prevent navigation when clicking edit
    setEditingParti(parti.id);
    setEditChatRoomName(parti.chatRoomName || "");
    setEditVisibleName(parti.visibleName || "");
    setEditError("");
  };

  const handleCancelEdit = () => {
    setEditingParti(null);
    setEditChatRoomName("");
    setEditVisibleName("");
    setEditError("");
  };

  const handleSaveEdit = async (partiId) => {
    setEditLoading(true);
    setEditError("");

    try {
      const res = await axios.put(
        "http://localhost:3000/api/update-parti",
        {
          partiId,
          chatRoomName: editChatRoomName.trim(),
          visibleName: editVisibleName.trim() || null,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        // Update the parti in the local state
        setPartis((prevPartis) =>
          prevPartis.map((p) =>
            p.id === partiId ? res.data.parti : p
          )
        );
        setEditingParti(null);
        setEditChatRoomName("");
        setEditVisibleName("");
      } else {
        setEditError(res.data.message || "Failed to update parti.");
      }
    } catch (err) {
      console.error(err);
      setEditError(
        err.response?.data?.message ||
          "Server error. Try again later."
      );
    } finally {
      setEditLoading(false);
    }
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
            {partis.map((parti, index) => (
              <div 
                className="parti-card" 
                key={index}
                onClick={() => {
                  if (parti.chatRoomName && editingParti !== parti.id) {
                    navigate('/chat', { 
                      state: { 
                        chatRoomName: parti.chatRoomName,
                        partiVisibleName: parti.visibleName || parti.selectedGame?.name || 'Parti Chat'
                      } 
                    });
                  }
                }}
                style={{ cursor: parti.chatRoomName && editingParti !== parti.id ? 'pointer' : 'default' }}
              >
                {parti.selectedGame?.image && (
                  <img src={parti.selectedGame.image} alt={parti.selectedGame.name} />
                )}
                <div className="parti-card-content">
                  {editingParti === parti.id ? (
                    <div className="edit-form" onClick={(e) => e.stopPropagation()}>
                      <h3>Edit Parti</h3>
                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#9ed6b9' }}>
                          Chatroom ID:
                        </label>
                        <input
                          type="text"
                          value={editChatRoomName}
                          onChange={(e) => setEditChatRoomName(e.target.value)}
                          placeholder="Enter custom ID"
                          style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            background: 'rgba(31, 55, 43, 0.5)',
                            color: '#f0f7f3',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#9ed6b9' }}>
                          Visible Name (optional):
                        </label>
                        <input
                          type="text"
                          value={editVisibleName}
                          onChange={(e) => setEditVisibleName(e.target.value)}
                          placeholder="Leave empty to use game name"
                          style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            background: 'rgba(31, 55, 43, 0.5)',
                            color: '#f0f7f3',
                            fontSize: '14px'
                          }}
                        />
                      </div>
                      {editError && (
                        <p style={{ color: '#ff6b6b', fontSize: '12px', marginBottom: '10px' }}>
                          {editError}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleSaveEdit(parti.id)}
                          disabled={editLoading || !editChatRoomName.trim()}
                          style={{
                            padding: '8px 16px',
                            background: editLoading || !editChatRoomName.trim() ? 'rgba(255, 255, 255, 0.3)' : '#ffffff',
                            color: editLoading || !editChatRoomName.trim() ? 'rgba(0, 0, 0, 0.5)' : '#0d1f19',
                            border: 'none',
                            borderRadius: '999px',
                            cursor: editLoading || !editChatRoomName.trim() ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}
                        >
                          {editLoading ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={editLoading}
                          style={{
                            padding: '8px 16px',
                            background: 'transparent',
                            color: '#ffffff',
                            border: '1px solid rgba(255, 255, 255, 0.4)',
                            borderRadius: '999px',
                            cursor: editLoading ? 'not-allowed' : 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h3>{parti.visibleName || parti.selectedGame?.name}</h3>
                        <button
                          onClick={(e) => handleEditClick(parti, e)}
                          style={{
                            background: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            color: '#9ed6b9',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Edit
                        </button>
                      </div>
                      <p><strong>Host:</strong> {parti.hostUsername}</p>
                      <p><strong>Chatroom ID:</strong> {parti.chatRoomName}</p>
                      <p><strong>Languages:</strong> {parti.selectedLanguages.join(", ")}</p>
                      <p className="tags">
                        {parti.selectedTags.map((tag, i) => (
                          <span key={i}>{tag}</span>
                        ))}
                      </p>
                  <p className="time-range">
                    {parti.timeRange?.startDate === "Any" 
                      ? "Any Time" 
                      : `${parti.timeRange.startDate} ${parti.timeRange.startTime} - ${parti.timeRange.endDate} ${parti.timeRange.endTime}`}
                  </p>
                      {parti.chatRoomName && (
                        <p style={{ marginTop: '10px', color: '#9ed6b9', fontSize: '14px' }}>
                          Click to join chat room
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
