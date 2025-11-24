import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { languageOptions } from "./data/options";
import "./ManageParti.css";

const normalizeAssetPath = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return path;
  return `/${path.replace(/^(\.\/|\.\.\/)+/, "")}`;
};

const popularTags = [
  "Chill", "Fun", "Ranked", "Casual", "Competitive",
  "Co-op", "Solo", "Party", "Challenge", "Relax",
  "Beginner-Friendly", "Tryhard", "No-Mic", "Mic-Only",
  "Late-Night", "Friendly", "Toxic-Free", "Pro", "Warmup",
  "Strategy", "Fast-Paced", "Slow-Paced", "Learning", "Speedrun",
  "Just Vibes", "Tilt-Proof", "Coach Needed", "Looking for Team",
  "Event", "Duo", "Trio", "Squad", "High-Energy", "Low-Energy",
  "No-Sweat", "Sweaty", "Tryouts", "AFK-Friendly", "Story Mode",
  "Grind", "Loot", "Questing", "Practice", "Streaming"
];

export default function ManageParti() {
  const navigate = useNavigate();
  const location = useLocation();
  const { partiId } = useParams();

  const initialParti = location.state?.parti || null;

  const [parti, setParti] = useState(initialParti);
  const [chatRoomName, setChatRoomName] = useState(initialParti?.chatRoomName || "");
  const [visibleName, setVisibleName] = useState(initialParti?.visibleName || "");
  const [loading, setLoading] = useState(!initialParti);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedLanguagesState, setSelectedLanguages] = useState(initialParti?.selectedLanguages || []);
  const [selectedTagsState, setSelectedTags] = useState(initialParti?.selectedTags || []);
  const [voiceDisabled, setVoiceDisabled] = useState(false);
  const [publicDisabled, setPublicDisabled] = useState(false);
  const [invitedFriends, setInvitedFriends] = useState([
    { id: "fatsybear", name: "FATSYBEAR" }
  ]);
  const [inviteInput, setInviteInput] = useState("");
  const [languageSearch, setLanguageSearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");

  // Derive friendly duration label for display
  const scheduleLabel = useMemo(() => {
    if (!parti?.timeRange) return "No schedule defined";
    if (parti.timeRange.startDate === "Any") return "Any Time - Open invite";
    const { startDate, startTime, endDate, endTime } = parti.timeRange;
    return `${startDate} ${startTime} -> ${endDate} ${endTime}`;
  }, [parti]);

  const coverSrc = useMemo(() => normalizeAssetPath(parti?.selectedGame?.image), [parti]);
  const filteredLanguages = useMemo(() => {
    return languageOptions.filter(
      (lang) =>
        lang.english.toLowerCase().includes(languageSearch.toLowerCase()) ||
        lang.native.toLowerCase().includes(languageSearch.toLowerCase())
    );
  }, [languageSearch]);

  const filteredTags = useMemo(() => {
    return popularTags.filter((tag) =>
      tag.toLowerCase().includes(tagSearch.toLowerCase())
    );
  }, [tagSearch]);

  const syncPartiField = (field, value) => {
    setParti((current) => (current ? { ...current, [field]: value } : current));
  };

  const toggleLanguage = (lang) => {
    setSelectedLanguages((prev) => {
      const next = prev.includes(lang)
        ? prev.filter((l) => l !== lang)
        : [...prev, lang];
      syncPartiField("selectedLanguages", next);
      return next;
    });
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) => {
      const next = prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag];
      syncPartiField("selectedTags", next);
      return next;
    });
  };

  const toggleVoiceSetting = () => setVoiceDisabled((prev) => !prev);
  const togglePublicSetting = () => setPublicDisabled((prev) => !prev);

  const handleAddInvite = () => {
    const trimmed = inviteInput.trim();
    if (!trimmed) return;
    setInvitedFriends((prev) => [
      ...prev,
      { id: `${Date.now()}`, name: trimmed.toUpperCase() }
    ]);
    setInviteInput("");
  };

  const handleRemoveInvite = (id) => {
    setInvitedFriends((prev) => prev.filter((friend) => friend.id !== id));
  };

  useEffect(() => {
    if (initialParti) return;

    let ignore = false;
    setLoading(true);
    axios
      .get("http://localhost:3000/api/my-partis", { withCredentials: true })
      .then((res) => {
        if (!res.data.success || !Array.isArray(res.data.partis)) {
          throw new Error(res.data.message || "Unable to load partis");
        }
        const fetchedParti = res.data.partis.find((p) => `${p.id}` === partiId);
        if (!fetchedParti) {
          throw new Error("Parti not found or you no longer have access to it.");
        }
        if (!ignore) {
          setParti(fetchedParti);
          setChatRoomName(fetchedParti.chatRoomName || "");
          setVisibleName(fetchedParti.visibleName || "");
          setSelectedLanguages(fetchedParti.selectedLanguages || []);
          setSelectedTags(fetchedParti.selectedTags || []);
          setError("");
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.response?.data?.message || err.message || "Failed to load parti.");
        }
      })
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [initialParti, partiId]);

  const handleSave = async () => {
    if (!chatRoomName.trim()) {
      setError("Chatroom ID is required.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await axios.put(
        "http://localhost:3000/api/update-parti",
        {
          partiId: Number(partiId),
          chatRoomName: chatRoomName.trim(),
          visibleName: visibleName.trim() || null,
          selectedLanguages: selectedLanguagesState,
          selectedTags: selectedTagsState
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        setSuccess("Changes saved.");
        setParti(res.data.parti);
        navigate("/mypartis", { state: { updatedParti: res.data.parti } });
      } else {
        setError(res.data.message || "Failed to update parti.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error. Try again later.");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate("/mypartis");
  };

  if (loading) {
    return (
      <div className="manage-parti-page">
        <div className="manage-topbar skeleton" />
        <div className="manage-card">
          <p>Loading parti...</p>
        </div>
      </div>
    );
  }

  if (error && !parti) {
    return (
      <div className="manage-parti-page">
        <div className="manage-card">
          <p className="error-msg">{error}</p>
          <button className="ghost-btn" onClick={handleBack}>
            Back to My Partis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-parti-page">
      <nav className="dashboard-topbar manage-topbar">
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

      <main className="manage-content">
        <button className="ghost-btn back-link" onClick={handleBack}>
            Back to My Partis
        </button>

        <header className="manage-header">
          <div>
            <p className="eyebrow">Manage Parti</p>
            <h1>{parti?.visibleName || parti?.selectedGame?.name || "Untitled Parti"}</h1>
            <p className="sub-text">
              Update chatroom info, share links, and review the session configuration for this parti.
            </p>
          </div>
          <div className="status-pill">
            <span>Chatroom</span>
            <strong>{parti?.chatRoomName || "Not set"}</strong>
          </div>
        </header>

        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}

        <section className="manage-review">
          <article className="manage-card hero-card">
            <div className="hero-media">
              {coverSrc ? (
                <img
                  src={coverSrc}
                  alt={parti?.selectedGame?.name || "Parti cover"}
                  className="hero-image"
                />
              ) : (
                <div className="hero-placeholder">
                  <p>No cover image available</p>
                </div>
              )}
              <div className="hero-overlay">
                <p className="eyebrow">Game</p>
                <h2>{parti?.selectedGame?.name || "Untitled Parti"}</h2>
                <div className="hero-stats">
                  <span>{selectedLanguagesState.length} languages</span>
                  <span>{selectedTagsState.length} tags</span>
                </div>
              </div>
            </div>
          </article>

          <article className="manage-card highlight-card">
            <p className="eyebrow">Snapshot</p>
            <h3>{parti?.visibleName || parti?.selectedGame?.name || "Untitled Parti"}</h3>


            <div className="stat-grid">
              <div className="stat-tile">
                <span className="stat-label">Languages</span>
                <strong>{selectedLanguagesState.length}</strong>
                <span className="stat-meta">selected</span>
              </div>
              <div className="stat-tile">
                <span className="stat-label">Tags</span>
                <strong>{selectedTagsState.length}</strong>
                <span className="stat-meta">curated</span>
              </div>
              <div className="stat-tile">
                <span className="stat-label">Schedule</span>
                <strong>{parti?.timeRange?.startDate === "Any" ? "Any" : "Custom"}</strong>
                <span className="stat-meta">
                  {parti?.timeRange?.startDate === "Any" ? "open invite" : "time-bound"}
                </span>
              </div>
            </div>

            <div className="pill-group">
              <span>{scheduleLabel}</span>
              <span>{parti?.timeRange?.startDate === "Any" ? "Any duration" : "Exact window"}</span>
            </div>
          </article>
        </section>

        <section className="manage-grid">
          <article className="manage-card edit-card">
            <h2>Identity & Access</h2>
            <p className="helper-text">
              Customize how your parti appears to others and control the unique chatroom handle players will join.
            </p>

            <label>
              <span>Visible name</span>
              <input
                type="text"
                placeholder="Defaults to selected game"
                value={visibleName}
                onChange={(e) => setVisibleName(e.target.value)}
              />
            </label>

            <label>
              <span>Chatroom ID</span>
              <div className="chatroom-field">
                <input
                  type="text"
                  value={chatRoomName}
                  onChange={(e) => setChatRoomName(e.target.value)}
                  placeholder="my-awesome-parti"
                />
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(chatRoomName)}
                  disabled={!chatRoomName}
                >
                  Copy
                </button>
              </div>
            </label>

            <div className="access-controls">
              <div className="control-toggle">
                <div className="toggle-label">
                  <span>Voice Chat</span>
                  <small>{voiceDisabled ? "Disabled" : "Enabled"}</small>
                </div>
                <button
                  type="button"
                  className={`slide-toggle ${voiceDisabled ? "off" : "on"}`}
                  onClick={toggleVoiceSetting}
                >
                  <span className="slide-option">On</span>
                  <span className="slide-option">Off</span>
                  <span className="slide-knob" />
                </button>
              </div>

              <div className="control-toggle">
                <div className="toggle-label">
                  <span>Public View</span>
                  <small>{publicDisabled ? "Hidden" : "Visible"}</small>
                </div>
                <button
                  type="button"
                  className={`slide-toggle ${publicDisabled ? "off" : "on"}`}
                  onClick={togglePublicSetting}
                >
                  <span className="slide-option">On</span>
                  <span className="slide-option">Off</span>
                  <span className="slide-knob" />
                </button>
              </div>

              <div className="invite-row">
                <span className="pill-toggle muted">Invite Friends</span>
                <div className="invite-controls">
                  <input
                    type="text"
                    value={inviteInput}
                    onChange={(e) => setInviteInput(e.target.value)}
                    placeholder="Enter handle"
                    className="invite-input"
                  />
                  <button
                    type="button"
                    className="invite-add"
                    onClick={handleAddInvite}
                    disabled={!inviteInput.trim()}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="friend-list">
                {invitedFriends.length === 0 ? (
                  <p className="helper-text">No invites yet. Add someone above.</p>
                ) : (
                  invitedFriends.map((friend) => (
                    <div key={friend.id} className="friend-entry">
                      <div className="friend-avatar">
                        {friend.name.slice(0, 2)}
                      </div>
                      <span className="friend-name">{friend.name}</span>
                      <button
                        type="button"
                        className="friend-remove"
                        onClick={() => handleRemoveInvite(friend.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

          </article>

          <article className="manage-card details-card">
            <div className="detail-row">
              <span>Game</span>
              <strong>{parti?.selectedGame?.name || "Not set"}</strong>
            </div>
            <div className="detail-row">
              <span>Languages</span>
              <div>
                {selectedLanguagesState.length
                  ? selectedLanguagesState.map((lang) => <span key={lang} className="chip">{lang}</span>)
                  : <p className="helper-text">No languages selected</p>}
              </div>
            </div>
            <div className="detail-row">
              <span>Tags</span>
              <div>
                {selectedTagsState.length
                  ? selectedTagsState.map((tag) => <span key={tag} className="chip">{tag}</span>)
                  : <p className="helper-text">No tags selected</p>}
              </div>
            </div>
            <div className="detail-row">
              <span>Schedule</span>
              <strong>{scheduleLabel}</strong>
            </div>
          </article>
        </section>

        <section className="manage-grid secondary-grid">
          <article className="manage-card language-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Languages</p>
                <h3>Edit communication preferences</h3>
              </div>
              <span className="count-pill">{selectedLanguagesState.length} selected</span>
            </div>

            <input
              type="text"
              className="manage-search"
              placeholder="Search language..."
              value={languageSearch}
              onChange={(e) => setLanguageSearch(e.target.value)}
            />

            <div className="language-grid-manage">
              {filteredLanguages.map((lang) => {
                const isSelected = selectedLanguagesState.includes(lang.english);
                return (
                  <button
                    key={lang.english}
                    type="button"
                    className={`tag-chip language-chip ${isSelected ? "selected" : ""}`}
                    onClick={() => toggleLanguage(lang.english)}
                  >
                    <span>{lang.english}</span>
                    <small>{lang.native}</small>
                  </button>
                );
              })}
            </div>
          </article>

          <article className="manage-card tags-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Tags</p>
                <h3>Adjust the parti vibe</h3>
              </div>
              <span className="count-pill">{selectedTagsState.length} selected</span>
            </div>

            <input
              type="text"
              className="manage-search"
              placeholder="Search tags..."
              value={tagSearch}
              onChange={(e) => setTagSearch(e.target.value)}
            />

            <div className="tags-grid-manage">
              {filteredTags.map((tag) => {
                const isSelected = selectedTagsState.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`tag-chip ${isSelected ? "selected" : ""}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </article>
        </section>

        <div className="manage-footer">
          <button className="ghost-btn" onClick={handleBack} disabled={saving}>
            Cancel
          </button>
          <button className="primary-btn" onClick={handleSave} disabled={saving || !chatRoomName.trim()}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </main>
    </div>
  );
}



