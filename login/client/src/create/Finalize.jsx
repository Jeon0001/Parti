import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Finalize.css";

export default function Finalize() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    selectedGame,
    selectedLanguages,
    selectedTags,
    timeRange,
  } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const durationLabel = useMemo(() => {
    if (!timeRange || timeRange.startDate === "Any") return "Any duration";
    const start = Date.parse(`${timeRange.startDate}T${timeRange.startTime}`);
    const end = Date.parse(`${timeRange.endDate}T${timeRange.endTime}`);
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return "Custom";
    const diff = end - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.round((diff / (1000 * 60)) % 60);
    return `${hours}h ${minutes}m`;
  }, [timeRange]);

  const timeSummary = useMemo(() => {
    if (!timeRange) return "No time selected";
    if (timeRange.startDate === "Any") return "Any Time";
    return `${timeRange.startDate} ${timeRange.startTime} to ${timeRange.endDate} ${timeRange.endTime}`;
  }, [timeRange]);

  const languagesList = selectedLanguages?.length ? selectedLanguages : [];
  const tagsList = selectedTags?.length ? selectedTags : [];
  const hasAnyTime = timeRange?.startDate === "Any";

  const handleCreate = async () => {
    if (!selectedGame || !selectedLanguages || !selectedTags || !timeRange) {
      setError("All fields must be filled before creating a parti.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:3000/api/create-parti",
        { selectedGame, selectedLanguages, selectedTags, timeRange },
        { withCredentials: true }
      );

      if (res.data.success) {
        navigate("/mypartis");
      } else {
        setError(res.data.message || "Failed to create parti.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="finalize-page">
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

      <main className="finalize-wrapper">
        <header className="finalize-hero">
          <div>
            <p className="step-label">Final Step</p>
            <h1 className="create-title">Review your Parti</h1>
            <p className="sub-text">
              Make sure every detail feels on-brand before sharing your Parti with the community.
            </p>
          </div>
          <div className="duration-badge">
            <span>Duration</span>
            <strong>{durationLabel}</strong>
          </div>
        </header>

        {error && <p className="error-msg">{error}</p>}

        <section className="summary-grid">
          <article className="final-card hero-card">
            <div className="hero-media">
              {selectedGame?.image ? (
                <img src={selectedGame.image} alt={selectedGame.name} className="hero-image" />
              ) : (
                <div className="hero-placeholder">
                  <p>Add a cover to show off your Parti</p>
                </div>
              )}
              <div className="hero-overlay">
                <p className="eyebrow">Game</p>
                <h2>{selectedGame?.name || "Not selected"}</h2>
                <div className="hero-stats">
                  <span>{languagesList.length} languages</span>
                  <span>{tagsList.length} tags</span>
                </div>
              </div>
            </div>
          </article>

          <article className="final-card highlight-card">
            <p className="eyebrow">Parti snapshot</p>
            <h3>{selectedGame?.name || "Name your session"}</h3>
            <p className="final-helper-text">Double-check the essentials before you go live.</p>

            <div className="stat-grid">
              <div className="stat-tile">
                <span className="stat-label">Languages</span>
                <strong>{languagesList.length}</strong>
                <span className="stat-meta">selected</span>
              </div>
              <div className="stat-tile">
                <span className="stat-label">Tags</span>
                <strong>{tagsList.length}</strong>
                <span className="stat-meta">curated</span>
              </div>
              <div className="stat-tile">
                <span className="stat-label">Schedule</span>
                <strong>{hasAnyTime ? "Any" : "Custom"}</strong>
                <span className="stat-meta">{hasAnyTime ? "open invite" : "time-bound"}</span>
              </div>
            </div>

            <div className="pill-group">
              <span>{timeSummary}</span>
              <span>{durationLabel}</span>
            </div>
          </article>
        </section>

        <section className="details-grid">
          <article className="final-card info-card">
            <p className="eyebrow">Languages</p>
            {languagesList.length ? (
              <div className="chip-grid">
                {languagesList.map((lang, index) => (
                  <span key={`${lang}-${index}`} className="chip">
                    {lang}
                  </span>
                ))}
              </div>
            ) : (
              <p className="info-value">No languages selected</p>
            )}
          </article>

          <article className="final-card info-card tag-card">
            <p className="eyebrow">Tags</p>
            {tagsList.length ? (
              <div className="chip-grid">
                {tagsList.map((tag, index) => (
                  <span key={`${tag}-${index}`} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="info-value">No tags selected</p>
            )}
          </article>

          <article className="final-card info-card schedule-card">
            <p className="eyebrow">Schedule</p>
            {timeRange ? (
              hasAnyTime ? (
                <p className="info-value">Any time works for this Parti</p>
              ) : (
                <div className="schedule-grid">
                  <div>
                    <span className="stat-label">From</span>
                    <p>{`${timeRange.startDate} at ${timeRange.startTime}`}</p>
                  </div>
                  <div>
                    <span className="stat-label">To</span>
                    <p>{`${timeRange.endDate} at ${timeRange.endTime}`}</p>
                  </div>
                </div>
              )
            ) : (
              <p className="info-value">No time selected</p>
            )}
            <div className="duration-pill">{durationLabel}</div>
          </article>
        </section>

        <div className="final-actions">
          <button className="back-btn" onClick={() => navigate(-1)}>
            Back
          </button>
          <button className="next-btn" onClick={handleCreate} disabled={loading}>
            {loading ? "Creating..." : "Create Parti"}
          </button>
        </div>
      </main>
    </div>
  );
}
