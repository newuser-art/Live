import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/home.css";
import Header from "./Header";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark as regularBookmark } from '@fortawesome/free-regular-svg-icons';
import { faBookmark as solidBookmark } from '@fortawesome/free-solid-svg-icons';

function Home() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [userid, setUserid] = useState("");
  const [bookmarkedItems, setBookmarkedItems] = useState(new Set()); // Watchlist storage
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedTools, setSelectedTools] = useState([]);
  const filterRef = useRef(null);
  const navigate = useNavigate();

  // Fetch items and check login status
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedUserid = localStorage.getItem("userid");

    if (storedUsername && storedUserid) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      setUserid(storedUserid);
    } else {
      setIsLoggedIn(false);
    }

    axios.get("http://localhost:5000/api/items")
      .then((response) => {
        setItems(response.data);
        setFilteredItems(response.data);
      })
      .catch((error) => console.error("Error fetching data:", error));

    if (storedUserid) {
      fetchWatchlist(storedUserid); // Load watchlist
    }

    const savedSelectedTools = JSON.parse(localStorage.getItem("selectedTools")) || [];
    setSelectedTools(savedSelectedTools);
  }, []);

  // Fetch user's watchlist from UserWatchlist collection
  const fetchWatchlist = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/watchlist?userid=${userId}`);
      if (response.data && Array.isArray(response.data.watchlist)) {
        const watchlistIds = new Set(response.data.watchlist.map((item) => item._id)); // Store _id only
        setBookmarkedItems(watchlistIds);
      }
    } catch (error) {
      console.error("Error fetching watchlist:", error);
    }
  };

  // Logout function
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setUserid("");
    setBookmarkedItems(new Set()); // Clear watchlist on logout
    localStorage.removeItem("username");
    localStorage.removeItem("userid");
    navigate("/");
  };

  // Search function
  const handleSearch = (value) => {
    const searchResults = items.filter((item) =>
      item.title.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredItems(searchResults);
  };

  // Filter logic
  const handleFilterChange = (e) => {
    const { name, checked } = e.target;
    setSelectedTools((prev) => checked ? [...prev, name] : prev.filter((tool) => tool !== name));
  };

  useEffect(() => {
    const filteredResults = items.filter((item) =>
      selectedTools.length === 0 || selectedTools.every((tool) => item.tools?.includes(tool))
    );
    setFilteredItems(filteredResults);
  }, [selectedTools, items]);

  // Close filter menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Toggle Bookmark (Watchlist) with instant UI update
  const toggleBookmark = async (itemId) => {
    if (!userid) {
      alert("You must be logged in to use the watchlist!");
      return;
    }

    // Optimistically update UI
    setBookmarkedItems((prev) => {
      const newBookmarks = new Set(prev);
      newBookmarks.has(itemId) ? newBookmarks.delete(itemId) : newBookmarks.add(itemId);
      return newBookmarks;
    });

    try {
      await axios.post("http://localhost:5000/api/watchlist", { userid, itemId });
    } catch (error) {
      console.error("Error updating watchlist:", error);
      // Revert change if failed
      setBookmarkedItems((prev) => {
        const newBookmarks = new Set(prev);
        newBookmarks.has(itemId) ? newBookmarks.delete(itemId) : newBookmarks.add(itemId);
        return newBookmarks;
      });
    }
  };

  return (
    <div className="page-container">
      <Header isLoggedIn={isLoggedIn} username={username} handleLogout={handleLogout} />

      <div className="search-box-container">
        <input
          type="text"
          className="search-box"
          placeholder="Search"
          onInput={(e) => handleSearch(e.target.value)}
        />

        <div className="filter-button-container" ref={filterRef}>
          <button onClick={(e) => { e.stopPropagation(); setShowFilterMenu((prev) => !prev); }}>
            Filter
          </button>

          {showFilterMenu && (
            <div className="filter-menu">
              <form>
                {["HTML", "CSS", "JavaScript", "python", "reactjs", "nodejs", "expressjs", "mongodb"].map((tool) => (
                  <label key={tool}>
                    <input
                      type="checkbox"
                      name={tool}
                      checked={selectedTools.includes(tool)}
                      onChange={handleFilterChange}
                    />
                    {tool.toUpperCase()}
                  </label>
                ))}
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="mainsection">
        <div className="card-container">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div key={item._id} className="card">
                <div className="image-container">
                  <Link to={`/item/${item._id}`} className="card-link">
                    <img src={item.imageurl} alt={item.title} className="card-img" />
                  </Link>

                  <div
                    className="watchlist-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(item._id);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={bookmarkedItems.has(item._id) ? solidBookmark : regularBookmark}
                    />
                  </div>
                </div>

                <p className="card-tools">Tools - {item.tools?.join(", ") || "None"}</p>
                <h2 className="card-title">{item.title}</h2>
                <p className="card-description">{item.description}</p>
              </div>
            ))
          ) : (
            <div className="center-container"><p>No items found</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
