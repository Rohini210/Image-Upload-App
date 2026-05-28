import { useState } from "react";
import UploadFile from "./UploadFile";
import AdminPanel from "./AdminPanel";
import "./App.css";

function App() {
  const [activePanel, setActivePanel] = useState("home");

  return (
    <div className="app">
      <nav className="navbar">
        <span className="navbar-brand">Image Upload</span>
        <div className="navbar-links">
          <button
            type="button"
            className={activePanel === "home" ? "nav-link active" : "nav-link"}
            onClick={() => setActivePanel("home")}
          >
            Home
          </button>
          <button
            type="button"
            className={activePanel === "admin" ? "nav-link active" : "nav-link"}
            onClick={() => setActivePanel("admin")}
          >
            Admin Panel
          </button>
        </div>
      </nav>

      <main className="panel-content">
        {activePanel === "home" ? <UploadFile /> : <AdminPanel />}
      </main>
    </div>
  );
}

export default App;
