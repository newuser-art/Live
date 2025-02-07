import React, { useState } from 'react';
import Login from './components/login';
import Profile from './components/profile';
import Home from './components/home';
import Watchlist from './components/watchlist'
import Signup from './components/signup';
import './App.css'; // Import the CSS file for styling
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ItemDetail from './components/ItemDetail';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // Local state for login status
  const [username, setUsername] = useState('');  // Local state for the logged-in username

  return (
    <Router>
      <Routes>
        {/* Define your routes */}
        <Route
          path="/"
          element={<Home isLoggedIn={isLoggedIn} username={username} />}
        />
        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} setUsername={setUsername} />}
        />
        <Route path='/watchlist' element={<Watchlist />} />
        <Route path='/profile' element={<Profile />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/item/:id" element={<ItemDetail />} />  {/* Route for item details */}
      </Routes>
    </Router>
  );
};

export default App;
