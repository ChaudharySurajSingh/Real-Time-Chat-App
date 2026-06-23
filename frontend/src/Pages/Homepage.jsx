import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../components/Authentication/Login";
import Signup from "../components/Authentication/Signup";

function Homepage() {
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) navigate("/chats", { replace: true });
  }, [navigate]);

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>SanDesh</h1>
        <div
          className={`tabs ${activeTab === "signup" ? "signup-active" : ""}`}
          role="tablist"
          aria-label="Authentication"
        >
          <button
            className={activeTab === "login" ? "tab active" : "tab"}
            onClick={() => setActiveTab("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={activeTab === "signup" ? "tab active" : "tab"}
            onClick={() => setActiveTab("signup")}
            type="button"
          >
            Sign Up
          </button>
        </div>
        {activeTab === "login" ? <Login /> : <Signup />}
      </section>
    </main>
  );
}

export default Homepage;
