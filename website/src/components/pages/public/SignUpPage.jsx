import { useState } from "react";
import { useSignUp } from "@clerk/clerk-react";
import { useNavigate, Link } from "react-router-dom";
import { fetchAPI } from "../../../../lib/fetch";
import { CheckCircle, Eye, EyeOff, Lock, Calendar, User } from "lucide-react";
import { Button } from "../../Button";

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join the sports betting community!
          </p>
        </div>

        {verification.state === "pending" ? (
          <div className="space-y-6">
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                Verification Code
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Lock size={20} />
                <input
                  id="verificationCode"
                  type="text"
                  value={verification.code}
                  onChange={(e) => setVerification({ ...verification, code: e.target.value })}
                  placeholder="Enter 6-digit code"
                  className="flex-1 p-2 border rounded"
                />
              </div>
              {verification.error && (
                <p className="text-red-500 text-sm mt-2">{verification.error}</p>
              )}
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={onVerifyPress}>
              Verify Email
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {/* Username */}
              <div className="flex flex-col gap-1">
                <label>Username</label>
                <div className="flex items-center gap-2">
                  <User size={20} />
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="Unique username"
                    className="flex-1 p-2 border rounded"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label>Email</label>
                <div className="flex items-center gap-2">
                  <User size={20} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Email address"
                    className="flex-1 p-2 border rounded"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1 relative">
                <label>Password</label>
                <div className="flex items-center gap-2">
                  <Lock size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Password"
                    className="flex-1 p-2 border rounded"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1 relative">
                <label>Confirm Password</label>
                <div className="flex items-center gap-2">
                  <Lock size={20} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="Confirm password"
                    className="flex-1 p-2 border rounded"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {form.password && form.confirmPassword && (
                <p className={`text-sm ${form.password === form.confirmPassword ? "text-green-500" : "text-red-500"}`}>
                  {form.password === form.confirmPassword ? "Passwords match" : "Passwords do not match"}
                </p>
              )}

              {/* Date of Birth */}
              <div className="flex flex-col gap-1">
                <label>Date of Birth (MM-DD-YYYY)</label>
                <div className="flex items-center gap-2">
                  <Calendar size={20} />
                  <input
                    type="text"
                    value={form.dob}
                    onChange={(e) => setForm({ ...form, dob: formatDOB(e.target.value) })}
                    placeholder="MM-DD-YYYY"
                    className="flex-1 p-2 border rounded"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500">* Age verification required for betting features.</p>
            </div>

            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700" onClick={onSignUpPress}>
              Create Account
            </Button>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/sign-in" className="text-blue-600 font-semibold hover:underline">
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
