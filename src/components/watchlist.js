import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/home.css";
import Header from "./Header";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark as solidBookmark } from '@fortawesome/free-solid-svg-icons';

function Watchlist() {
    const [watchlistItems, setWatchlistItems] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [userid, setUserid] = useState("");

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        const storedUserid = localStorage.getItem("userid");

        if (storedUsername && storedUserid) {
            setIsLoggedIn(true);
            setUsername(storedUsername);
            setUserid(storedUserid);

            fetchWatchlist(storedUserid);
        }
    }, []);

    const fetchWatchlist = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/watchlist?userid=${userId}`);
            setWatchlistItems(response.data.watchlist || []);
        } catch (error) {
            console.error("Error fetching watchlist:", error);
        }
    };

    const toggleWatchlist = async (itemId) => {
        try {
            await axios.post("http://localhost:5000/api/watchlist", { userid, itemId });

            // Remove item from the list if it exists
            setWatchlistItems((prevWatchlist) =>
                prevWatchlist.filter((item) => item._id !== itemId)
            );
        } catch (error) {
            console.error("Error updating watchlist:", error);
        }
    };

    return (
        <div className="page-container">
            <Header isLoggedIn={isLoggedIn} username={username} handleLogout={() => setIsLoggedIn(false)} />

            <h1 className="page-title">My Watchlist</h1>

            <div className="mainsection">
                <div className="card-container">
                    {watchlistItems.length > 0 ? (
                        watchlistItems.map((item) => (
                            <div key={item._id} className="card">
                                <div className="image-container">
                                    <Link to={`/item/${item._id}`} className="card-link">
                                        <img src={item.imageurl} alt={item.title} className="card-img" />
                                    </Link>

                                    <div
                                        className="watchlist-icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleWatchlist(item._id);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={solidBookmark} />
                                    </div>
                                </div>

                                <p className="card-tools">Tools - {Array.isArray(item.tools) ? item.tools.join(", ") : "None"}</p>
                                <h2 className="card-title">{item.title}</h2>
                                <p className="card-description">{item.description}</p>
                            </div>
                        ))
                    ) : (
                        <div className="center-container"><p>No items in watchlist</p></div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Watchlist;
