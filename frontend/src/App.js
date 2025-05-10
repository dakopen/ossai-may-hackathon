import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetch("http://localhost:8000/api/hello/")
            .then((response) => response.json())
            .then((data) => setMessage(data.message))
            .catch((error) => console.error("Error:", error));
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <h1>React + Django App</h1>
                <p>Message from backend: {message}</p>
            </header>
        </div>
    );
}

export default App;
