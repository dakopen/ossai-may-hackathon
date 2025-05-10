import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/DashboardLayout.css";

function Dashboard() {
    const navigate = useNavigate();
    const [newProject, setNewProject] = useState({
        name: "",
        description: "",
        repository_url: "",
    });
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:8000/api/projects/", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setProjects(data);
            } else {
                setError("Failed to fetch projects");
            }
        } catch (error) {
            setError("Error fetching projects: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleProjectSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

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
                const errorData = await response.json();
                setError(errorData.detail || "Failed to add project");
            }
        } catch (error) {
            setError("Error adding project: " + error.message);
        } finally {
            setLoading(false);
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
                    Project Pilot
                </div>
            </nav>

            <main className="dashboard-content">
                {error && <div className="error-message">{error}</div>}

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
                                    disabled={loading}
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
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="repository_url">Repository URL (optional)</label>
                                <input
                                    type="url"
                                    id="repository_url"
                                    name="repository_url"
                                    value={newProject.repository_url}
                                    onChange={handleInputChange}
                                    placeholder="https://github.com/username/repo"
                                    disabled={loading}
                                />
                            </div>
                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? "Adding..." : "Add Project"}
                            </button>
                        </form>
                    </div>

                    <div className="projects-list">
                        <h2>Your Projects</h2>
                        {loading ? (
                            <p className="loading">Loading projects...</p>
                        ) : projects.length === 0 ? (
                            <p className="no-projects">No projects added yet</p>
                        ) : (
                            <div className="projects-grid">
                                {projects.map((project) => (
                                    <Link
                                        key={project.project_id}
                                        to={`/dashboard/projects/${project.project_id}`}
                                        className="project-card-link"
                                        style={{ textDecoration: "none" }}
                                    >
                                        <div className="project-card">
                                            <h3>{project.name}</h3>
                                            <p>{project.description}</p>
                                            {project.repository_url && (
                                                <a
                                                    href={project.repository_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="repo-link"
                                                >
                                                    View Repository
                                                </a>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;
