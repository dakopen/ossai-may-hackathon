import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const TASK_STATUSES = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    IN_REVIEW: "In Review",
    COMPLETED: "Completed",
    BLOCKED: "Blocked",
};

function ProjectDetails() {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        status: TASK_STATUSES.TODO,
        estimated_effort: "",
    });
    const [showAddTask, setShowAddTask] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedProject, setEditedProject] = useState({
        name: "",
        description: "",
        repository_url: "",
    });
    const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [generatedPrompt, setGeneratedPrompt] = useState(null);
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

    useEffect(() => {
        fetchProject();
        fetchTasks();
    }, [projectId]);

    useEffect(() => {
        if (project) {
            setEditedProject({
                name: project.name,
                description: project.description,
                repository_url: project.repository_url || "",
            });
        }
    }, [project]);

    const fetchProject = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/projects/${projectId}/`);
            if (response.ok) {
                const data = await response.json();
                setProject(data);
            } else {
                setError("Project not found");
            }
        } catch (err) {
            setError("Error fetching project");
        }
    };

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8000/api/tasks/?project=${projectId}`);
            if (response.ok) {
                const data = await response.json();
                // Group tasks by status
                const groupedTasks = data.reduce((acc, task) => {
                    if (!acc[task.status]) {
                        acc[task.status] = [];
                    }
                    acc[task.status].push(task);
                    return acc;
                }, {});
                setTasks(groupedTasks);
            }
        } catch (err) {
            setError("Error fetching tasks");
        } finally {
            setLoading(false);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:8000/api/tasks/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...newTask,
                    project: projectId,
                }),
            });

            if (response.ok) {
                const task = await response.json();
                setTasks((prev) => ({
                    ...prev,
                    [task.status]: [...(prev[task.status] || []), task],
                }));
                setNewTask({
                    title: "",
                    description: "",
                    status: TASK_STATUSES.TODO,
                    estimated_effort: "",
                });
                setShowAddTask(false);
            }
        } catch (err) {
            setError("Error adding task");
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            const response = await fetch(`http://localhost:8000/api/tasks/${taskId}/`, {
                method: "DELETE",
            });

            if (response.ok) {
                // Remove task from the state
                setTasks((prev) => {
                    const newTasks = { ...prev };
                    Object.keys(newTasks).forEach((status) => {
                        newTasks[status] = newTasks[status].filter(
                            (task) => task.task_id !== taskId
                        );
                    });
                    return newTasks;
                });
            }
        } catch (err) {
            setError("Error deleting task");
        }
    };

    const handleDragStart = (e, taskId) => {
        e.dataTransfer.setData("taskId", taskId);
    };

    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("taskId");

        try {
            const response = await fetch(`http://localhost:8000/api/tasks/${taskId}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                const updatedTask = await response.json();
                // Update tasks state
                setTasks((prev) => {
                    const newTasks = { ...prev };
                    // Remove from old status
                    Object.keys(newTasks).forEach((status) => {
                        newTasks[status] = newTasks[status].filter(
                            (task) => task.task_id !== taskId
                        );
                    });
                    // Add to new status
                    if (!newTasks[newStatus]) {
                        newTasks[newStatus] = [];
                    }
                    newTasks[newStatus].push(updatedTask);
                    return newTasks;
                });
            } else {
                const errorData = await response.json();
                setError(`Error updating task status: ${errorData.detail || "Unknown error"}`);
            }
        } catch (err) {
            setError("Error updating task status");
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleProjectEdit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8000/api/projects/${projectId}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editedProject),
            });

            if (response.ok) {
                const updatedProject = await response.json();
                setProject(updatedProject);
                setIsEditing(false);
            } else {
                setError("Failed to update project");
            }
        } catch (err) {
            setError("Error updating project");
        }
    };

    const handleDeleteProject = async () => {
        if (
            window.confirm(
                "Are you sure you want to delete this project? This action cannot be undone."
            )
        ) {
            try {
                const response = await fetch(`http://localhost:8000/api/projects/${projectId}/`, {
                    method: "DELETE",
                });

                if (response.ok) {
                    navigate("/dashboard");
                } else {
                    setError("Failed to delete project");
                }
            } catch (err) {
                setError("Error deleting project");
            }
        }
    };

    const handleGenerateTasks = async () => {
        try {
            setIsGeneratingTasks(true);
            const response = await fetch(
                `http://localhost:8000/api/projects/${projectId}/generate_tasks/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                // Update tasks state with new tasks
                setTasks((prev) => {
                    const updatedTasks = { ...prev };
                    data.tasks.forEach((task) => {
                        if (!updatedTasks[TASK_STATUSES.TODO]) {
                            updatedTasks[TASK_STATUSES.TODO] = [];
                        }
                        // Ensure task has all required fields including task_id
                        const taskWithId = {
                            ...task,
                            task_id: task.task_id || task.id, // Handle both possible ID field names
                            status: TASK_STATUSES.TODO,
                        };
                        updatedTasks[TASK_STATUSES.TODO].push(taskWithId);
                    });
                    return updatedTasks;
                });
            } else {
                setError("Failed to generate tasks");
            }
        } catch (err) {
            setError("Error generating tasks");
        } finally {
            setIsGeneratingTasks(false);
        }
    };

    const handleGeneratePrompt = async (task) => {
        try {
            setIsGeneratingPrompt(true);
            setSelectedTask(task);
            const response = await fetch(
                `http://localhost:8000/api/tasks/${task.task_id}/generate_prompt/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setGeneratedPrompt(data.prompt);
            } else {
                setError("Failed to generate prompt");
            }
        } catch (err) {
            setError("Error generating prompt");
        } finally {
            setIsGeneratingPrompt(false);
        }
    };

    const closePromptModal = () => {
        setSelectedTask(null);
        setGeneratedPrompt(null);
    };

    if (loading) return <div className="loading">Loading project...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!project) return null;

    return (
        <div className="dashboard">
            <nav className="dashboard-nav">
                <div className="logo" onClick={() => navigate("/")}>
                    Project Pilot
                </div>
                <button className="dashboard-btn" onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                </button>
            </nav>
            <main className="dashboard-content">
                <div className="dashboard-header">
                    {isEditing ? (
                        <form onSubmit={handleProjectEdit} className="edit-project-form">
                            <div className="form-group">
                                <label htmlFor="project-name">Project Name</label>
                                <input
                                    type="text"
                                    id="project-name"
                                    value={editedProject.name}
                                    onChange={(e) =>
                                        setEditedProject({ ...editedProject, name: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="project-description">Description</label>
                                <textarea
                                    id="project-description"
                                    value={editedProject.description}
                                    onChange={(e) =>
                                        setEditedProject({
                                            ...editedProject,
                                            description: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="project-repo">Repository URL (optional)</label>
                                <input
                                    type="url"
                                    id="project-repo"
                                    value={editedProject.repository_url}
                                    onChange={(e) =>
                                        setEditedProject({
                                            ...editedProject,
                                            repository_url: e.target.value,
                                        })
                                    }
                                    placeholder="https://github.com/username/repo"
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="submit-btn">
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setIsEditing(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <div className="project-header-actions">
                                <h1>{project.name}</h1>
                                <div className="project-actions">
                                    <button
                                        className="edit-project-btn"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit Project
                                    </button>
                                    <button
                                        className="delete-project-btn"
                                        onClick={handleDeleteProject}
                                    >
                                        Delete Project
                                    </button>
                                </div>
                            </div>
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
                            <p className="project-date">
                                Created: {new Date(project.creation_date).toLocaleString()}
                            </p>
                            <p className="project-date">
                                Last Updated: {new Date(project.last_update_date).toLocaleString()}
                            </p>
                        </>
                    )}
                </div>

                <div className="kanban-board">
                    <div className="kanban-header">
                        <h2>Tasks</h2>
                        <div className="kanban-actions">
                            <button
                                className="ai-task-btn"
                                onClick={handleGenerateTasks}
                                disabled={isGeneratingTasks}
                            >
                                {isGeneratingTasks ? "Generating..." : "Break project into tasks"}
                            </button>
                            <button className="add-task-btn" onClick={() => setShowAddTask(true)}>
                                Add Task
                            </button>
                        </div>
                    </div>

                    {showAddTask && (
                        <div className="add-task-form">
                            <h3>Add New Task</h3>
                            <form onSubmit={handleAddTask}>
                                <div className="form-group">
                                    <label htmlFor="title">Title</label>
                                    <input
                                        type="text"
                                        id="title"
                                        value={newTask.title}
                                        onChange={(e) =>
                                            setNewTask({ ...newTask, title: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description">Description</label>
                                    <textarea
                                        id="description"
                                        value={newTask.description}
                                        onChange={(e) =>
                                            setNewTask({ ...newTask, description: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="estimated_effort">
                                        Estimated Effort (hours)
                                    </label>
                                    <input
                                        type="number"
                                        id="estimated_effort"
                                        value={newTask.estimated_effort}
                                        onChange={(e) =>
                                            setNewTask({
                                                ...newTask,
                                                estimated_effort: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="submit-btn">
                                        Add Task
                                    </button>
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => setShowAddTask(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="kanban-columns">
                        {Object.values(TASK_STATUSES).map((status) => (
                            <div
                                key={status}
                                className="kanban-column"
                                onDrop={(e) => handleDrop(e, status)}
                                onDragOver={handleDragOver}
                            >
                                <h3>{status}</h3>
                                <div className="task-list">
                                    {tasks[status]?.map((task) => (
                                        <div
                                            key={task.task_id}
                                            className="task-card"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, task.task_id)}
                                        >
                                            <h4>{task.title}</h4>
                                            <p>{task.description}</p>
                                            {task.estimated_effort && (
                                                <div className="effort-container">
                                                    <span className="effort">
                                                        Est. Effort: {task.estimated_effort}h
                                                    </span>
                                                </div>
                                            )}
                                            <div className="task-actions">
                                                <button
                                                    className="generate-prompt-btn"
                                                    onClick={() => handleGeneratePrompt(task)}
                                                    disabled={isGeneratingPrompt}
                                                >
                                                    {isGeneratingPrompt &&
                                                    selectedTask?.task_id === task.task_id
                                                        ? "Generating..."
                                                        : "Generate AI Prompt"}
                                                </button>
                                                <button
                                                    className="delete-task-btn"
                                                    onClick={() => handleDeleteTask(task.task_id)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Prompt Modal */}
            {selectedTask && (
                <div className="prompt-modal-overlay" onClick={closePromptModal}>
                    <div className="prompt-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="prompt-modal-header">
                            <h3>AI Prompt for: {selectedTask.title}</h3>
                            <button className="close-modal-btn" onClick={closePromptModal}>
                                ×
                            </button>
                        </div>
                        <div className="prompt-modal-content">
                            {isGeneratingPrompt ? (
                                <div className="loading-prompt">Generating prompt...</div>
                            ) : generatedPrompt ? (
                                <div className="prompt-content">
                                    <pre>{generatedPrompt}</pre>
                                    <button
                                        className="copy-prompt-btn"
                                        onClick={() => {
                                            navigator.clipboard.writeText(generatedPrompt);
                                        }}
                                    >
                                        Copy to Clipboard
                                    </button>
                                </div>
                            ) : (
                                <div className="error-message">Failed to generate prompt</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProjectDetails;
