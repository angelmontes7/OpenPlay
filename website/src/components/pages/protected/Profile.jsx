import React, { useState, useEffect } from "react";
import { useUser, useAuth, getClerkInstance } from "@clerk/clerk-react";
import { useHistory } from "react-router-dom";
import { fetchAPI } from "../../../../lib/fetch";

const Profile = () => {
    const { user } = useUser();
    const { signOut } = useAuth();
    const history = useHistory();
    const client = getClerkInstance();
    const [profilePic, setProfilePic] = useState(user?.imageUrl || '/defaultProfile.jpg');
    const [activeSection, setActiveSection] = useState("profile");
    const [isPrivate, setIsPrivate] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(false);
    const [smsNotifications, setsmsNotifications] = useState(false);
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [errorPassword, setErrorPassword] = useState(false);

    const getUserPreferences = async (clerkId) => {
        const data = await fetchAPI(`/api/database/preferences?clerkId=${clerkId}`);
        return data;
    };

    const updateUserPreferences = async (clerkId, prefs) => {
        const data = await fetchAPI("/api/database/preferences", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ clerkId, ...prefs }),
        });

        return data;
    };

    useEffect(() => {
        const fetchProfilePic = async () => {
            try {
                const response = await fetchAPI(`/api/database/profile-pic?clerkId=${user?.id}`, {
                    method: "GET",
                });

                if (response && response.profilePicUrl !== undefined) {
                    setProfilePic(response.profilePicUrl);
                } else {
                    setProfilePic('/defaultProfile.jpg');
                }

            } catch (error) {
                console.error("Error fetching profile pic:", error);
            }
        };

        fetchProfilePic();
    }, [user?.id]);

    const handlePasswordReset = async () => {
        if (newPassword !== confirmNewPassword) {
            setErrorPassword(true);
            alert("Passwords do not match.");
            return;
        }
        if (newPassword.length < 8) {
            alert("Password must be at least 8 characters long.");
            return;
        }
        if (user && newPassword === confirmNewPassword) {
            setErrorPassword(false);
            try {
                await user.updatePassword({ password: newPassword });
                alert("Password updated successfully.");
                setIsChangingPassword(false);
            } catch (error) {
                alert(error.message || "Something went wrong.");
            }
        }
    };

    const renderContent = () => {
        switch (activeSection) {
            case "privacy":
                return (
                    <div className="section">
                        <h2>Privacy Settings</h2>
                        <div>
                            <label>Location</label>
                            <input
                                type="checkbox"
                                checked={locationEnabled}
                                onChange={(e) => handlePreferenceToggle("location_enabled", e.target.checked)}
                            />
                        </div>
                        <div>
                            <label>Username</label>
                            <p>{user?.username}</p>
                        </div>
                        <div>
                            <label>Email</label>
                            <p>{user?.primaryEmailAddress?.emailAddress}</p>
                        </div>
                        <div>
                            <label>Password</label>
                            <p>****</p>
                        </div>
                        <button onClick={() => setIsChangingPassword(!isChangingPassword)}>
                            {isChangingPassword ? "Cancel" : "Change Password"}
                        </button>
                        {isChangingPassword && (
                            <div>
                                <input
                                    type="password"
                                    placeholder="Enter old password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                />
                                <input
                                    type="password"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <input
                                    type="password"
                                    placeholder="Re-enter new password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                />
                                {errorPassword && <p>Passwords do not match.</p>}
                                <button onClick={handlePasswordReset}>Submit New Password</button>
                            </div>
                        )}
                    </div>
                );

            case "notifications":
                return (
                    <div className="section">
                        <h2>Notification Preferences</h2>
                        <div>
                            <label>Email Notifications</label>
                            <input
                                type="checkbox"
                                checked={emailNotifications}
                                onChange={(e) => handlePreferenceToggle("email_notifications", e.target.checked)}
                            />
                        </div>
                        <div>
                            <label>Push Notifications</label>
                            <input
                                type="checkbox"
                                checked={pushNotifications}
                                onChange={(e) => handlePreferenceToggle("push_notifications", e.target.checked)}
                            />
                        </div>
                        <div>
                            <label>SMS Notifications</label>
                            <input
                                type="checkbox"
                                checked={smsNotifications}
                                onChange={(e) => handlePreferenceToggle("sms_notifications", e.target.checked)}
                            />
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="section">
                        <h2>Profile</h2>
                        <img src={profilePic} alt="Profile" onClick={pickImage} />
                        <p>{user?.username}</p>
                        <p>Member since {user?.createdAt?.getFullYear()}</p>
                        <button onClick={() => setActiveSection("privacy")}>Privacy Settings</button>
                        <button onClick={() => setActiveSection("notifications")}>Notification Preferences</button>
                        <button
                            onClick={async () => {
                                try {
                                    await signOut();
                                    history.replace("/sign-in");
                                } catch (error) {
                                    alert("Failed to log out. Please try again.");
                                }
                            }}
                        >
                            Log Out
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="profile-container">
            <h1>Profile</h1>
            {renderContent()}
        </div>
    );
};

export default Profile;
