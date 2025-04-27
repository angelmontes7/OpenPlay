import { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate, Link } from "react-router-dom";
import { fetchAPI } from "../../../../lib/fetch";
import { CheckCircle, Eye, EyeOff, Lock, Calendar, User } from "lucide-react";
import './SignUpPage.css';  

const SignUpPage = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
  });

  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formatDOB = (value) => {
    value = value.replace(/\D/g, "");
    if (value.length > 2 && value.length <= 4) {
      value = value.slice(0, 2) + "-" + value.slice(2);
    } else if (value.length > 4) {
      value = value.slice(0, 2) + "-" + value.slice(2, 4) + "-" + value.slice(4, 8);
    }
    return value;
  };

  const validateDOB = (dob) => {
    if (!dob) return false;
    const [month, day, year] = dob.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    return year >= 1900 && date <= today;
  };

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    if (!validateDOB(form.dob)) {
      alert("Invalid date of birth");
      return;
    }
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      await signUp.create({
        emailAddress: form.email,
        username: form.username,
        password: form.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerification({ ...verification, state: "pending" });
    } catch (err) {
      alert(err.errors?.[0]?.longMessage || "Something went wrong");
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });
      if (signUpAttempt.status === "complete") {
        await fetchAPI("/api/database/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: form.username,
            email: form.email,
            dob: form.dob,
            clerkId: signUpAttempt.createdUserId,
          }),
        });

        const response = await fetchAPI("/api/stripe/connected-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerkId: signUpAttempt.createdUserId,
            email: form.email,
          }),
        });

        if (response.onboardingLink) {
          window.open(response.onboardingLink, "_blank");
        }

        await setActive({ session: signUpAttempt.createdSessionId });
        navigate("/home");
      } else {
        setVerification({ ...verification, error: "Verification failed", state: "failed" });
      }
    } catch (err) {
      setVerification({ ...verification, error: err.errors?.[0]?.longMessage || "Verification failed", state: "failed" });
    }
  };

  return (
    <div className="sign-up-container">
      <div className="form-container">
        <div>
          <h2 className="title">Create your account</h2>
          <p className="subtitle">
            Join the sports betting community!
          </p>
        </div>

        {verification.state === "pending" ? (
          <div className="verification-form">
            <div>
              <label htmlFor="verificationCode" className="label">Verification Code</label>
              <div className="input-wrapper">
                <Lock size={20} />
                <input
                  id="verificationCode"
                  type="text"
                  value={verification.code}
                  onChange={(e) => setVerification({ ...verification, code: e.target.value })}
                  placeholder="Enter 6-digit code"
                  className="input"
                />
              </div>
              {verification.error && (
                <p className="error-message">{verification.error}</p>
              )}
            </div>
            <Button className="verify-button" onClick={onVerifyPress}>
              Verify Email
            </Button>
          </div>
        ) : (
          <>
            <div className="form-fields">
              {/* Username */}
              <div className="input-field">
                <label>Username</label>
                <div className="input-wrapper">
                  <User size={20} />
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="Unique username"
                    className="input"
                  />
                </div>
              </div>

              {/* Email */}
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

              {/* Password */}
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
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="input-field">
                <label>Confirm Password</label>
                <div className="input-wrapper">
                  <Lock size={20} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    className="input"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {form.password && form.confirmPassword && (
                <p className={`password-match-message ${form.password === form.confirmPassword ? "valid" : "invalid"}`}>
                  {form.password === form.confirmPassword ? "Passwords match" : "Passwords do not match"}
                </p>
              )}

              {/* Date of Birth */}
              <div className="input-field">
                <label>Date of Birth (MM-DD-YYYY)</label>
                <div className="input-wrapper">
                  <Calendar size={20} />
                  <input
                    type="text"
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: formatDOB(e.target.value) })}
                    placeholder="MM-DD-YYYY"
                    className="input"
                  />
                </div>
              </div>

              <p className="age-verification">* Age verification required for betting features.</p>
            </div>

            <button className="submit-button" onClick={onSignUpPress}>
              Create Account
            </button>

            <div className="sign-in-link-container">
              <p className="sign-in-link">
                Already have an account?{" "}
                <Link to="/sign-in" className="link">
                  Sign In
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;
