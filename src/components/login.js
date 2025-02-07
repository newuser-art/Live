// Inside Login.js

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/login.css';
import axios from 'axios';

const Login = ({ setIsLoggedIn, setUsername }) => {
  const [emailOrUsername, setEmailOrUsername] = useState(''); // Single input for email or username
  const [password, setPassword] = useState(''); // Local state for password input
  const [error, setError] = useState(''); // Local state for errors
  const navigate = useNavigate();

  // Add class to body when on login page
  useEffect(() => {
    document.body.classList.add('login-page'); // Add the class when this component mounts

    // Remove the class when the component unmounts (to avoid it affecting other pages)
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting login:', { emailOrUsername, password });
  
    try {
      const response = await axios.post('http://localhost:5000/login', {
        emailOrUsername,
        password,
      });
      console.log('Response received:', response);
  
      if (response.status === 200) {
        console.log('Login successful:', response.data.message);
  
        // Update parent state
        setError('');
        setIsLoggedIn(true);
        setUsername(response.data.username); // Set the logged-in username from response
        // setUserid(response.data.userid); // Set the logged-in user ID from response
        localStorage.setItem('username', response.data.username); 
        localStorage.setItem('userid', response.data.userid); // Store userid in localStorage
        console.log('Stored username in localStorage:', localStorage.getItem('username'));
        console.log('Stored user ID in localStorage:', localStorage.getItem('userid'));
  
        navigate('/'); // Redirect to the homepage
      } else {
        console.error('Unexpected status code:', response.status);
        setError('Unexpected response from the server.');
      }
    } catch (err) {
      console.error('Login error:', err.response?.data?.error || err.message);
      setError(err.response?.data?.error || 'Failed to login. Please try again.');
    }
  };
  

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            id="emailOrUsername"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            required
            placeholder="Email or Username"
          />
        </div>
        <div className="input-group">
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
          />
        </div>
        <button className="loginbu" type="submit">Login</button>
        <p className="eletext">Don't have an account?</p>
        <nav className="end">
          <Link className="end" to="/signup">Register</Link>
        </nav>
      </form>
    </div>
  );
};

export default Login;
