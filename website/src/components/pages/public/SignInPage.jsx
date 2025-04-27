import { useState } from "react";
import { useSignIn } from "@clerk/clerk-react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import './SignInPage.css';  // Import the CSS file

const SignInPage = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const onSignInPress = async () => {
    if (!isLoaded) return;
    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        navigate("/dashboard");
      } else {
        console.error("Unexpected sign-in state:", signInAttempt);
      }
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || "Sign in failed");
    }
  };

  return (
    <div className="sign-in-container">
      <div className="form-container">
        <div>
          <h2 className="title">Welcome Back</h2>
          <p className="subtitle">Sign in to continue</p>
        </div>

        <div className="form-fields">
          {error && <p className="error-message">{error}</p>}

          <div className="input-field">
            <label>Email</label>
            <div className="input-wrapper">
              <User size={20} />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email address"
                className="input"
              />
            </div>
          </div>

          <div className="input-field">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={20} />
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Password"
                className="input"
              />
              <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button className="submit-btn" onClick={onSignInPress}>
            Log In
          </button>

          <div className="link-container">
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <div className="link-container">
            <p className="no-account">
              Don't have an account?{" "}
              <Link to="/sign-up" className="sign-up-link">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
