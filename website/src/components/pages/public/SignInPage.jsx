import { useState } from "react";
import { useSignIn } from "@clerk/clerk-react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { Button } from "../../Button";

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to continue
          </p>
        </div>

        <div className="space-y-6">
          {error && (
            <p className="text-red-500 text-center text-sm">{error}</p>
          )}

          <div className="flex flex-col gap-1">
            <label>Email</label>
            <div className="flex items-center gap-2">
              <User size={20} />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email address"
                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 relative">
            <label>Password</label>
            <div className="flex items-center gap-2">
              <Lock size={20} />
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Password"
                className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={onSignInPress}>
            Log In
          </Button>

          <div className="text-center mt-4">
            <Link to="/forgot-password" className="text-blue-600 text-sm hover:underline">
              Forgot password?
            </Link>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/sign-up" className="text-blue-600 font-semibold hover:underline">
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
