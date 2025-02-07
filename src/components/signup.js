import React, { useState, useEffect } from "react";
import "../styles/login.css";
import { Link } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Add login-page class to the body when Signup page is active
  useEffect(() => {
    document.body.classList.add("login-page"); // Add class when component mounts

    return () => {
      document.body.classList.remove("login-page"); // Remove class when component unmounts
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = { name, username, email, password };

    try {
      const response = await axios.post("http://localhost:5000/signup", user);
      setMessage(response.data.message);
    } catch (error) {
      console.error("Error signing up:", error);
      setMessage("Error signing up. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <h2>Signup</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter your Name"
          />
        </div>

        <div className="input-group">
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter your username"
          />
        </div>

        <div className="input-group">
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your Email"
          />
        </div>

        <div className="input-group">
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>

        <button className="loginbu" type="submit">Signup</button>
        <p className="eletext">Have an account? Click login</p>
        <nav className="end">
          <Link className="end" to="/login">Login</Link>
        </nav>
      </form>
    </div>
  );
};

export default Signup;
