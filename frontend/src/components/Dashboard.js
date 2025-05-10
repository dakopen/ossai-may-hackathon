import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();

    return (
        <div className="dashboard">
            <nav className="dashboard-nav">
                <div className="logo" onClick={() => navigate("/")}>
                    OSSAI
                </div>
                <div className="nav-links">
                    <button className="nav-btn active">Overview</button>
                    <button className="nav-btn">Projects</button>
                    <button className="nav-btn">Analytics</button>
                </div>
            </nav>

            <main className="dashboard-content">
                <div className="dashboard-header">
                    <h1>Dashboard</h1>
                    <p>Welcome to your OSSAI dashboard</p>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card">
                        <h3>Active Projects</h3>
                        <p className="card-value">0</p>
                    </div>
                    <div className="dashboard-card">
                        <h3>Contributions</h3>
                        <p className="card-value">0</p>
                    </div>
                    <div className="dashboard-card">
                        <h3>AI Insights</h3>
                        <p className="card-value">0</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
