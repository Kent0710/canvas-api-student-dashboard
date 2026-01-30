import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import "./App.css";
import PageTemplate from "./components/PageTemplate";
import Settings from './components/Settings'

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
            <Routes>
                <Route
                    path="/"
                    element={
                        <header className="App-header">
                            <h1 className="bg-blue-500 p-4 m-4 ">
                                Canvas API Student Dashboard
                            </h1>
                            <p>{message}</p>
                        </header>
                    }
                />
                <Route
                    path="/dashboard"
                    element={
                        <PageTemplate>
                            <Dashboard />
                        </PageTemplate>
                    }
                />
                        <Route
                    path="/settings"
                    element={
                        <PageTemplate>
                            <Settings />
                        </PageTemplate>
                    }
                />
            </Routes>
        </Router>
    );
}

export default App;
