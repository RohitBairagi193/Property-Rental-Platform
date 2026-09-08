import React, { useState } from "react";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationPopup from "../Components/NotificationPopup";
import {
  registerUserWithFirebase,
  signInWithGoogleWithFirebase,
} from "../firebase/auth";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Tenant");
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [isRegistering, setIsRegistering] = useState(false);

  const showPopup = (message, type = "success") => {
    setPopupMessage(message);
    setPopupType(type);
    setPopupOpen(true);
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      showPopup("Please fill all fields", "error");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      showPopup("Enter valid gmail", "error");
      return;
    }

    setIsRegistering(true);

    try {
      await registerUserWithFirebase({
        name,
        email,
        password,
        role,
      });

      showPopup(
        "Verification email sent to your Gmail. Please confirm it before logging in.",
        "success",
      );

      setTimeout(() => {
        navigate("/login");
      }, 2200);
    } catch (error) {
      showPopup(error.message || "Registration failed", "error");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const user = await signInWithGoogleWithFirebase(role);
      showPopup("Google registration successful", "success");
      setTimeout(() => {
        navigate(role === "Admin" && user.role === "Admin" ? "/adminDashboard" : "/userDashboard");
      }, 1000);
    } catch (error) {
      showPopup(error.message || "Google registration failed", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <NotificationPopup
        isOpen={popupOpen}
        message={popupMessage}
        type={popupType}
        onClose={() => setPopupOpen(false)}
      />

      <div className="card w-112.5">
        <h1 className="text-3xl font-bold mb-2">
          <Home className="inline mb-1" /> GharDhundho
        </h1>

        <p className="text-on-surface-variant mb-6">Create your account</p>

        <div className="space-y-4">
          <div>
            <label className="input-label">Full Name</label>

            <input
              type="text"
              placeholder="Enter your name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label">Email</label>

            <input
              type="email"
              placeholder="name@gmail.com"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label">Password</label>

            <input
              type="password"
              placeholder="••••••••"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="input-label">Select Role</label>

            <select
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value)}>
              <option value="Tenant">Tenant</option>

              <option value="Admin">Admin</option>
            </select>
          </div>

          <button
            onClick={handleRegister}
            className="btn btn-primary w-full mt-4"
            disabled={isRegistering}>
            {isRegistering ? "Sending verification..." : "Register & Verify Email"}
          </button>

          <button
            onClick={handleGoogleRegister}
            className="btn btn-tertiary w-full mt-3">
            Continue with Google
          </button>
        </div>

        <div className="text-center mt-5">
          <p className="text-sm text-on-surface-variant">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-primary-container font-semibold cursor-pointer hover:underline">
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
