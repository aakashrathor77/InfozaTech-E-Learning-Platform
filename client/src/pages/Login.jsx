
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, Mail, Lock } from "lucide-react";
import API from "../api";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", {
        email,
        password
      });

      const user = response.data.user;

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "instructor") {
        navigate("/instructor");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <BookOpen size={28} />
        </div>

        <h1>Welcome Back!</h1>
        <p className="login-subtitle">
          Login to continue your learning journey.
        </p>

        <form onSubmit={handleLogin}>
          <label>Email Address</label>
          <div className="login-input">
            <Mail size={18} />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <label>Password</label>
          <div className="login-input">
            <Lock size={18} />
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="login-footer">
          New to InfozaTech? <Link to="/register">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
