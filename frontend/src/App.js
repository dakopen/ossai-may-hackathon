import React from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import Dashboard from "./components/Dashboard";

function Home() {
    const navigate = useNavigate();

    return (
        <div className="App">
            <nav className="navbar">
                <div className="logo">OSSAI</div>
                <button className="dashboard-btn" onClick={() => navigate("/dashboard")}>
                    Dashboard
                </button>
            </nav>

            <main className="hero">
                <div className="hero-content">
                    <h1>Welcome to OSSAI</h1>
                    <p className="subtitle">Your AI-powered open source assistant</p>
                    <p className="description">
                        Discover, analyze, and contribute to open source projects with the help of
                        artificial intelligence.
                    </p>
                    <button className="cta-button" onClick={() => navigate("/dashboard")}>
                        Get Started
                    </button>
                </div>
            </main>
        </div>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
