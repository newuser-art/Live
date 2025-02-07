import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/profile.css";
import Header from './Header'; // Import the Header component

function Profile() {
    const [userData, setUserData] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState('personalDetails'); // Track active tab
    const [isEditing, setIsEditing] = useState(false); // Toggle edit mode
    const [isChangingPassword, setIsChangingPassword] = useState(false); // Toggle change password mode
    
    const [formData, setFormData] = useState({
        username: "",
        name: "",
        email: "",
        currentPassword: "", // Store current password
        newPassword: "", // Store new password
        confirmPassword: "" // Store confirmed password
    });

    useEffect(() => {
        const storedUserId = localStorage.getItem("userid");
        if (storedUserId) {
            setIsLoggedIn(true);
            fetchUserProfile(storedUserId);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    const fetchUserProfile = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/user/${userId}`);
            setUserData(response.data);
            setFormData({
                username: response.data.username,
                name: response.data.name,
                email: response.data.email,
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleChangePasswordToggle = () => {
        setIsChangingPassword(!isChangingPassword);
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab); // Switch between tabs
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isChangingPassword) {
            // Validate the new password and current password match
            if (formData.newPassword !== formData.confirmPassword) {
                alert("New password and confirm password do not match.");
                return;
            }

            try {
                const storedUserId = localStorage.getItem("userid");
                const response = await axios.put(`http://localhost:5000/api/user/change-password/${storedUserId}`, {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                });
                alert(response.data.message);
                setIsChangingPassword(false); // Close the change password form
                setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" });
            } catch (error) {
                console.error("Error changing password:", error);
                alert("There was an error changing your password.");
            }
        } else {
            try {
                const storedUserId = localStorage.getItem("userid");
                const response = await axios.put(`http://localhost:5000/api/user/${storedUserId}`, formData);
                alert(response.data.message);
                setIsEditing(false); // Close the edit form
                fetchUserProfile(storedUserId); // Refresh profile data
            } catch (error) {
                console.error("Error updating user profile:", error);
                alert("There was an error updating your profile.");
            }
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('username');
        localStorage.removeItem('userid');
        window.location.href = '/';
    };

    if (!isLoggedIn) {
        return <div className="login-message">Please log in to view your profile.</div>;
    }

    if (!userData) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div>
            <Header
                isLoggedIn={isLoggedIn}
                username={userData.username}
                handleLogout={handleLogout}
            />
            <div className="profile-container1">
                <div className="profile-card">
                    <div className="profile-header">
                        <h1>Welcome, {userData.username}!</h1>
                    </div>

                    {/* Flex Container for Tabs and Content */}
                    <div className="profile-content">
                        {/* Vertical Tabs */}
                        <div className="tabs">
                            <div className={`tab ${activeTab === 'personalDetails' ? 'active' : ''}`} onClick={() => handleTabClick('personalDetails')}>
                                Personal Details
                            </div>
                            {/* <div className={`tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => handleTabClick('about')}>
                                About
                            </div> */}
                            <div className={`tab ${activeTab === 'github' ? 'active' : ''}`} onClick={() => handleTabClick('github')}>
                                GitHub
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="profile-info">
                            {activeTab === 'personalDetails' && (
                                <div>
                                    {isEditing ? (
                                        <form onSubmit={handleSubmit}>
                                            <div className="form-group">
                                                <label htmlFor="username">Username:</label>
                                                <input
                                                    type="text"
                                                    id="username"
                                                    name="username"
                                                    value={formData.username}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="name">Name:</label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label htmlFor="email">Email:</label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                            <button type="submit" className="submit-btn">Save Changes</button>
                                        </form>
                                    ) : (
                                        <>
                                            <p><strong>Username:</strong> {userData.username}</p>
                                            <p><strong>Name:</strong> {userData.name}</p>
                                            <p><strong>Email:</strong> {userData.email}</p>
                                            <button onClick={handleEditToggle} className="edit-btn">Edit Profile</button>
                                        </>
                                    )}

                                    {/* Change Password Section */}
                                    <div className="change-password-section">
                                        <button onClick={handleChangePasswordToggle} className="change-password-btn">
                                            {isChangingPassword ? "Cancel Change Password" : "Change Password"}
                                        </button>

                                        {isChangingPassword && (
                                            <form onSubmit={handleSubmit}>
                                                <div className="form-group">
                                                    <label htmlFor="currentPassword">Current Password:</label>
                                                    <input
                                                        type="password"
                                                        id="currentPassword"
                                                        name="currentPassword"
                                                        value={formData.currentPassword}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="newPassword">New Password:</label>
                                                    <input
                                                        type="password"
                                                        id="newPassword"
                                                        name="newPassword"
                                                        value={formData.newPassword}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="confirmPassword">Confirm New Password:</label>
                                                    <input
                                                        type="password"
                                                        id="confirmPassword"
                                                        name="confirmPassword"
                                                        value={formData.confirmPassword}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <button type="submit" className="submit-btn">Change Password</button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'about' && (
                                <div>
                                    <p><strong>About Me:</strong></p>
                                    <p>{userData.about || "No about information available"}</p>
                                </div>
                            )}

                            {activeTab === 'github' && (
                                <div>
                                    <p><strong>GitHub:</strong></p>
                                    <p>this feature will available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;