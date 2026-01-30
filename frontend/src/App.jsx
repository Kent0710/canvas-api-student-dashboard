import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import "./App.css";

function App() {
    const [message, setMessage] = useState("Loading...");

    useEffect(() => {
        fetch("/api")
            .then((res) => res.json())
            .then((data) => setMessage(data.message))
            .catch((err) => setMessage("Error connecting to backend"));
    }, []);

    return (
        <Router>
            <div className="App">
                <nav>
                    <Link to="/">Home</Link> |{" "}
                    <Link to="/dashboard">Dashboard</Link>
                </nav>

                <Routes>
                    <Route
                        path="/"
                        element={
                            <header className="App-header">
                                <h1>Canvas API Student Dashboard</h1>
                                <p>{message}</p>
                            </header>
                        }
                    />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
