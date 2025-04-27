import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom';
import { fetchAPI } from "../../../../lib/fetch";

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

const Profile = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState(user?.imageUrl || "/path/to/defaultProfile.png");
  const [showModal, setShowModal] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [isPrivate, setIsPrivate] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [socialNotifications, setSocialNotifications] = useState(false);
  const [gameNotifications, setGameNotifications] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorPassword, setErrorPassword] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    const fetchProfilePic = async () => {
      try {
        const response = await fetchAPI(`/api/database/profile-pic?clerkId=${user?.id}`);
        if (response && response.profilePicUrl) {
          setProfilePic(response.profilePicUrl);
        } else {
          setProfilePic("/path/to/defaultProfile.png");
        }
      } catch (error) {
        console.error("Error fetching profile pic:", error);
      }
    };

    fetchProfilePic();
  }, [user?.id]);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user?.id) {
        console.error("User ID is missing");
        return;
      }

      try {
        const data = await getUserPreferences(user.id);

        setIsPrivate(data.is_private ?? false);
        setEmailNotifications(data.email_notifications ?? true);
        setPushNotifications(data.push_notifications ?? false);
        setLocationEnabled(data.location_enabled ?? false);
        setSmsNotifications(data.sms_notifications ?? false);
        setSocialNotifications(data.social_notifications ?? false);
        setGameNotifications(data.game_notifications ?? false);
      } catch (error) {
        console.error("Error loading preferences:", error);
      }
    };

    fetchPreferences();
  }, [user?.id]);

  const handlePreferenceToggle = (key, value) => {
    const newPrefs = {
      is_private: isPrivate,
      email_notifications: emailNotifications,
      push_notifications: pushNotifications,
      location_enabled: locationEnabled,
      sms_notifications: smsNotifications,
      social_notifications: socialNotifications,
      game_notifications: gameNotifications,
      [key]: value,
    };

    updateUserPreferences(user?.id, newPrefs).catch((err) =>
      console.error("Failed to update preferences", err)
    );

    switch (key) {
      case "is_private":
        setIsPrivate(value);
        break;
      case "email_notifications":
        setEmailNotifications(value);
        break;
      case "push_notifications":
        setPushNotifications(value);
        break;
      case "location_enabled":
        setLocationEnabled(value);
        break;
      case "sms_notifications":
        setSmsNotifications(value);
        break;
      case "social_notifications":
        setSocialNotifications(value);
        break;
      case "game_notifications":
        setGameNotifications(value);
        break;
    }
  };

  const handlePasswordReset = async (newPassword, confirmNewPassword) => {
    const user = client.user;
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
        await user.updatePassword(newPassword);
        alert("Password updated successfully.");
        setIsChangingPassword(!isChangingPassword);
      } catch (error) {
        alert("Error: " + error.message || "Something went wrong.");
      }
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case "privacy":
        return (
          <div className="container">
            <h2>Privacy Settings</h2>
            <label>
              Location
              <input
                type="checkbox"
                checked={locationEnabled}
                onChange={(e) => handlePreferenceToggle("location_enabled", e.target.checked)}
              />
            </label>
            <div>Username: {user?.username}</div>
            <div>Email: {user?.primaryEmailAddress?.emailAddress}</div>
            <div>Password: ****</div>
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
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrorPassword(false);
                  }}
                />
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmNewPassword}
                  onChange={(e) => {
                    setConfirmNewPassword(e.target.value);
                    setErrorPassword(false);
                  }}
                />
                {errorPassword && <div>Passwords do not match.</div>}
                <button onClick={() => handlePasswordReset(newPassword, confirmNewPassword)}>
                  Submit New Password
                </button>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="section-list">
            <div onClick={() => setActiveSection("privacy")}>Privacy</div>
            <div onClick={() => setActiveSection("notifications")}>Notifications</div>
          </div>
        );
    }
  };

  return (
    <div className="profile">
      <div className="header">
        <button onClick={() => navigate("/settings")}>Back</button>
        <h1>OpenPlay</h1>
      </div>
      {renderContent()}
      <div className="action-buttons">
        <button onClick={() => navigate("/settings")}>Settings</button>
        <button title="Log Out" onClick={async () => await signOut()} />
      </div>
    </div>
  );
};

export default Profile;
