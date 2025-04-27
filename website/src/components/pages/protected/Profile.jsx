import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom';
import { fetchAPI } from "../../../../lib/fetch";
import { Link } from 'react-router-dom';
import './Profile.css'

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
          <div className="priv-container">
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
        case "notifications":
        return (
          <div className="noti-container">
            <h2>Notification Settings</h2>
            <label>
              Email Notifications
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => handlePreferenceToggle("email_notifications", e.target.checked)}
              />
            </label>
            <label>
              Push Notifications
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => handlePreferenceToggle("push_notifications", e.target.checked)}
              />
            </label>
            <label>
              SMS Notifications
              <input
                type="checkbox"
                checked={smsNotifications}
                onChange={(e) => handlePreferenceToggle("sms_notifications", e.target.checked)}
              />
            </label>
            <label>
              Social Notifications
              <input
                type="checkbox"
                checked={socialNotifications}
                onChange={(e) => handlePreferenceToggle("social_notifications", e.target.checked)}
              />
            </label>
            <label>
              Game Notifications
              <input
                type="checkbox"
                checked={gameNotifications}
                onChange={(e) => handlePreferenceToggle("game_notifications", e.target.checked)}
              />
            </label>
          </div>
        );
        case "support":
        return (
            <div className="support-container">
            {/* FAQs Section */}
            <div className="card-section">
                <h2>FAQs</h2>
                {[
                { question: "How do I reset my password?", answer: "Go to Settings > Privacy and click 'Change Password'." },
                { question: "How can I contact support?", answer: "You can email us at support@openplay.com." },
                { question: "Where can I find OpenPlay’s Terms of Service?", answer: "Check our website at www.openplay.com/terms." }
                ].map((faq, index) => (
                <details key={index} className="faq-item">
                    <summary>{faq.question}</summary>
                    <p>{faq.answer}</p>
                </details>
                ))}
            </div>

            {/* Contact Us Section */}
            <div className="card-section">
                <h2>Contact Us</h2>
                <p>📩 <a href="mailto:support@openplay.com" className="link">support@openplay.com</a></p>
            </div>

            {/* Socials Section */}
            <section class='social-media'>
                <div class='social-media-wrap'>
                    <div class='footer-logo'>
                    <Link to='/' className='social-logo'>
                        OpenPlay
                        <i class='fab fa-typo3' />
                    </Link>
                    </div>
                    <small class='website-rights'>OpenPlay © 2025</small>
                    <div class='social-icons'>
                    <Link
                        class='social-icon-link facebook'
                        to='/'
                        target='_blank'
                        aria-label='Facebook'
                    >
                        <i class='fab fa-facebook-f' />
                    </Link>
                    <Link
                        class='social-icon-link instagram'
                        to='/'
                        target='_blank'
                        aria-label='Instagram'
                    >
                        <i class='fab fa-instagram' />
                    </Link>
                    <Link
                        class='social-icon-link youtube'
                        to='/'
                        target='_blank'
                        aria-label='Youtube'
                    >
                        <i class='fab fa-youtube' />
                    </Link>
                    <Link
                        class='social-icon-link twitter'
                        to='/'
                        target='_blank'
                        aria-label='Twitter'
                    >
                        <i class='fab fa-twitter' />
                    </Link>
                    <Link
                        class='social-icon-link twitter'
                        to='/'
                        target='_blank'
                        aria-label='LinkedIn'
                    >
                        <i class='fab fa-linkedin' />
                    </Link>
                    </div>
                </div>
            </section>

            {/* Community Forum Button */}
            <div className="community-button">
                <button onClick={() => window.open("https://community.openplay.com", "_blank")}>
                Join Community Forum
                </button>
            </div>
            </div>
        );
      default:
        return (
            <div className="section-list">
                <div
                className={`section-item ${activeSection === "privacy" ? "active" : ""}`}
                onClick={() => setActiveSection("privacy")}
                >
                Privacy
                </div>
                <div
                className={`section-item ${activeSection === "notifications" ? "active" : ""}`}
                onClick={() => setActiveSection("notifications")}
                >
                Notifications
                </div>
                <div
                className={`section-item ${activeSection === "support" ? "active" : ""}`}
                onClick={() => setActiveSection("support")}
                >
                Support
            </div>
            </div>
        );
    }
  };

  return (
    <div className="profile">
      <div className="card">
        <div className="header">
          <h1>OpenPlay</h1>
        </div>
  
        {renderContent()}
  
        <div className="action-buttons">
            
          <button onClick={() => setActiveSection("default")}>Back</button>
          <button title="Log Out" onClick={async () => await signOut()}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );  
};

export default Profile;
