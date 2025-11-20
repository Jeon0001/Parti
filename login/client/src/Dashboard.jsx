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
    <div
      className="dashboard-container"
      style={{ backgroundImage: `url(${lebron})` }} // dynamic import
    >
      <div className="dashboard-overlay">
        <h1>Welcome, {data.username}!</h1>
        <p>Enjoy the game!</p>
      </div>
    </div>
  );
}
