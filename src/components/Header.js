import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Header.css';

const Header = ({ isLoggedIn, username, handleLogout }) => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Toggle dropdown menu
  const toggleMenu = () => {
    setShowMenu((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showMenu) return; // Run only when menu is open

    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showMenu]);

  // Dynamic Watchlist/Home Link
  const isWatchlistPage = location.pathname === "/watchlist";
  const isProfilePage = location.pathname === "/profile";
  
  const watchlistLinkText = isWatchlistPage || isProfilePage ? "Home" : "Watchlist";
  const watchlistLinkPath = isWatchlistPage || isProfilePage ? "/" : "/watchlist";


  return (
    <header className="header">
      <Link to="/" className="brand">
        ProjectA2Z
      </Link>

      <nav className="auth">
        <Link className="nav-link" to={watchlistLinkPath}>
          {watchlistLinkText}
        </Link>
        
        {isProfilePage && (
          <Link className="nav-link" to="/watchlist">
            Watchlist
          </Link>
        )}

        {isLoggedIn ? (
          <div className="profile-container" ref={dropdownRef}>
            <img
              src="https://raw.githubusercontent.com/newuser-art/image/main/pic.jpg
"
              alt="Profile"
              className="profile-image"
              onClick={toggleMenu}
            />
            {showMenu && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => navigate('/profile')}>
                  Profile
                </button>
                <button
                  className="dropdown-item"
                  onClick={() => {
                    handleLogout();
                    navigate('/');
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link className="nav-link" to="/login">Login</Link>
            <Link className="nav-link" to="/signup">Signup</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
