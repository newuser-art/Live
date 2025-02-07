import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header'; // Import the Header component
import '../styles/itemDetail.css'; // Assuming you will update the CSS in this file

const ItemDetail = () => {
  const { id } = useParams(); // Get the item id from the URL params
  const [item, setItem] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state
  const [username, setUsername] = useState(''); // Store logged-in username
  const [currentOutputIndex, setCurrentOutputIndex] = useState(0); // Track current output index
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is logged in
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    }

    // Fetch the item details using the id from the URL
    axios
      .get(`http://localhost:5000/api/items/${id}`)
      .then((response) => {
        setItem(response.data); // Store the item details in state
      })
      .catch((error) => {
        console.error('Error fetching item details:', error);
      });
  }, [id]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    localStorage.removeItem('username');
    navigate('/'); // Redirect to home after logout
  };

  const handleNextOutput = () => {
    if (item && currentOutputIndex < item.output.length - 1) {
      setCurrentOutputIndex(currentOutputIndex + 1);
    }
  };

  const handlePreviousOutput = () => {
    if (currentOutputIndex > 0) {
      setCurrentOutputIndex(currentOutputIndex - 1);
    }
  };

  if (!item) {
    return <div>Loading...</div>; // Show loading message while the item is being fetched
  }

  return (
    <div className="root">
    {/* Header Section */}
      <Header isLoggedIn={isLoggedIn} username={username} handleLogout={handleLogout} />
   
  
    {/* Main Content Section */}
    <div className="content-container">
      <div className="item-detail">
        <img src={item.imageurl} alt={item.title} className="item-img" />
        <h1 className="title">{item.title}</h1>
        <p className="tools">Tools: {item.tools?.join(', ')}</p>
  
        <p className="description">{item.description}</p>
  
        {/* Output Section */}
        <div className="output-section">
          <h1 className="output-title">Output for this project</h1>
          {item.output?.length > 0 ? (
            <>
              <img
                src={item.output[currentOutputIndex]}
                alt={`Output ${currentOutputIndex + 1}`}
                className="output-image"
              />
              <div className="output-navigation">
                <button
                  className="prev-button"
                  onClick={handlePreviousOutput}
                  disabled={currentOutputIndex === 0}
                >
                  &#9664;
                </button>
                <button
                  className="next-button"
                  onClick={handleNextOutput}
                  disabled={currentOutputIndex === item.output.length - 1}
                >
                  &#9654;
                </button>
              </div>
            </>
          ) : (
            <p>Output for this project is not updated yet</p>
          )}
        </div>
  
        {/* Download Section */}
        {isLoggedIn ? (
          <a href={item.file} className="download-btn" download>
            Download Project
          </a>
        ) : (
          <button
            className="download-btn"
            onClick={() => navigate('/login?redirect=/item/' + id)}
          >
            Login to Download
          </button>
        )}
      </div>
    </div>
  </div>
  
  
  );
};

export default ItemDetail;
