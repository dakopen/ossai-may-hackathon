import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");
    const [newProject, setNewProject] = useState({
        name: "",
        description: "",
        repository_url: "",
    });
    const [projects, setProjects] = useState([]);

    const handleProjectSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:8000/api/projects/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newProject),
            });

            if (response.ok) {
                const data = await response.json();
                setProjects([...projects, data]);
                setNewProject({ name: "", description: "", repository_url: "" });
            } else {
                console.error("Failed to add project");
            }
        } catch (error) {
            console.error("Error adding project:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProject((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div className="dashboard">
            <nav className="dashboard-nav">
                <div className="logo" onClick={() => navigate("/")}>
                    OSSAI
                </div>
                <div className="nav-links">
                    <button
                        className={`nav-btn ${activeTab === "overview" ? "active" : ""}`}
                        onClick={() => setActiveTab("overview")}
                    >
                        Overview
                    </button>
                    <button
                        className={`nav-btn ${activeTab === "projects" ? "active" : ""}`}
                        onClick={() => setActiveTab("projects")}
                    >
                        Projects
                    </button>
                </div>
            </nav>

            <main className="dashboard-content">
                {activeTab === "overview" ? (
                    <>
                        <div className="dashboard-header">
                            <h1>Dashboard</h1>
                            <p>Welcome to your OSSAI dashboard</p>
                        </div>

                        <div className="dashboard-grid">
                            <div className="dashboard-card">
                                <h3>Active Projects</h3>
                                <p className="card-value">{projects.length}</p>
                            </div>
                            <div className="dashboard-card">
                                <h3>Contributions</h3>
                                <p className="card-value">0</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="projects-section">
                        <div className="dashboard-header">
                            <h1>Projects</h1>
                            <p>Manage your open source projects</p>
                        </div>

                        <div className="add-project-form">
                            <h2>Add New Project</h2>
                            <form onSubmit={handleProjectSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">Project Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={newProject.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter project name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={newProject.description}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Enter project description"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="repository_url">Repository URL</label>
                                    <input
                                        type="url"
                                        id="repository_url"
                                        name="repository_url"
                                        value={newProject.repository_url}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="https://github.com/username/repo"
                                    />
                                </div>
                                <button type="submit" className="submit-btn">
                                    Add Project
                                </button>
                            </form>
                        </div>

                        <div className="projects-list">
                            <h2>Your Projects</h2>
                            {projects.length === 0 ? (
                                <p className="no-projects">No projects added yet</p>
                            ) : (
                                <div className="projects-grid">
                                    {projects.map((project) => (
                                        <div key={project.id} className="project-card">
                                            <h3>{project.name}</h3>
                                            <p>{project.description}</p>
                                            <a
                                                href={project.repository_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="repo-link"
                                            >
                                                View Repository
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Dashboard;
