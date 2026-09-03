import { CalendarCheck, ChevronDown, Contact, Eye, EyeOff, Headset, Home, Verified } from "lucide-react";
import React, { useState } from "react";
import Footer from "../Components/Footer";
import { useNavigate } from "react-router-dom";
import PageLoader from "../Components/PageLoader";
import usePageLoader from "../assets/usePageLoader";
import NotificationPopup from "../Components/NotificationPopup";
import {
  loginUserWithFirebase,
  resendVerificationEmail,
  signInWithGoogleWithFirebase,
} from "../firebase/auth";

const SERVER_ACCOUNT = {
  email: "rohitbairagi255@gmail.com",
  password: "@99Apple",
};

const LoginPage = () => {
  const loading = usePageLoader();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Tenant");
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const showPopup = (message, type = "success") => {
    setPopupMessage(message);
    setPopupType(type);
    setPopupOpen(true);
  };

  const handleResendVerification = async () => {
    if (!email || !password) {
      showPopup("Enter your email and password to resend the verification email.", "error");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
      showPopup("Enter valid gmail", "error");
      return;
    }

    setIsSendingVerification(true);

    try {
      const result = await resendVerificationEmail({ email, password });

      if (result?.alreadyVerified) {
        showPopup("This email is already verified. You can sign in now.", "success");
      } else {
        showPopup("Verification email sent again. Please check your Gmail inbox.", "success");
      }
    } catch (error) {
      showPopup(error.message || "Could not resend verification email", "error");
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleLogin = async (role = "Tenant") => {
    if (!email || !password) {
      showPopup("Please fill all fields", "error");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(email) && role !== "Server") {
      showPopup("Enter valid gmail", "error");
      return;
    }

    if (role === "Server") {
      const normalizedEmail = email.trim().toLowerCase();
      if (
        normalizedEmail !== SERVER_ACCOUNT.email ||
        password !== SERVER_ACCOUNT.password
      ) {
        showPopup("Invalid server credentials", "error");
        return;
      }

      const serverUser = {
        uid: "server-super-admin",
        name: "Server Admin",
        email: SERVER_ACCOUNT.email,
        role: "Server",
        bookings: 0,
        wishlist: 0,
        renewal: "N/A",
      };

      showPopup("Server Login Successful", "success");
      setTimeout(() => {
        navigate("/serverDashboard", { state: { user: serverUser } });
      }, 1500);
      return;
    }

    try {
      const user = await loginUserWithFirebase({ email, password });

      if (role === "Admin" && user.role !== "Admin") {
        showPopup("Please login using Admin button", "error");
        return;
      }

      showPopup(
        role === "Admin" ? "Admin Login Successful" : "Login Successful",
        "success",
      );

      setTimeout(() => {
        navigate(role === "Admin" ? "/adminDashboard" : "/userDashboard");
      }, 1500);
    } catch (error) {
      const message = error.message || "Invalid credentials";

      if (message.toLowerCase().includes("verify your email")) {
        showPopup(
          "Email is not verified yet. Please use Resend verification and confirm the email from Gmail.",
          "error",
        );
        return;
      }

      showPopup(message, "error");
    }
  };

  const goToUserDashBoard = () => handleLogin(role);

  const handleGoogleLogin = async () => {
    if (role === "Server") {
      showPopup("Server login requires the server credentials.", "error");
      return;
    }

    try {
      const user = await signInWithGoogleWithFirebase(role);
      if (role === "Admin" && user.role !== "Admin") {
        showPopup("This Google account is not registered as an Admin.", "error");
        return;
      }

      showPopup("Google Login Successful", "success");
      setTimeout(() => {
        navigate(role === "Admin" ? "/adminDashboard" : "/userDashboard");
      }, 1000);
    } catch (error) {
      showPopup(error.message || "Google login failed", "error");
    }
  };

  const goToRegister = () => {
    navigate("/register");
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      <div className="min-h-screen flex">
        <NotificationPopup
          isOpen={popupOpen}
          message={popupMessage}
          type={popupType}
          onClose={() => setPopupOpen(false)}
        />
        <div className="w-1/2 bg-primary-container text-white flex flex-col justify-center px-16">
          <h1 className="display-lg mb-4 text-white">
            <Home className="inline mb-1" size={35} /> GharDhundho
          </h1>

          <p className="text-body-md text-on-primary-container mb-10">
            Premium rentals for modern living.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-white">
                <Verified className="inline mb-1" size={28} /> Verified
                Properties
              </h3>

              <p className="text-body-sm text-on-primary-container">
                Every listing is physically inspected for your peace of mind.
              </p>
            </div>

            <div>
              <h3 className="text-white">
                <Contact className="inline mb-1" size={28} /> Direct Owner
                Contact
              </h3>

              <p className="text-body-sm text-on-primary-container">
                Skip the middleman. Connect directly with landlords.
              </p>
            </div>

            <div>
              <h3 className="text-white">
                <CalendarCheck className="inline mb-1" size={28} /> Easy Booking
              </h3>

              <p className="text-body-sm text-on-primary-container">
                Schedule visits and sign agreements digitally in minutes.
              </p>
            </div>

            <div>
              <h3 className="text-white">
                <Headset className="inline mb-1" size={28} /> 24/7 Support
              </h3>

              <p className="text-body-sm text-on-primary-container">
                Our concierge team is always here to help your transition.
              </p>
            </div>
          </div>
        </div>

        <div className="w-1/2 flex items-center justify-center bg-surface">
          <div className="card w-105">
            <h2 className="mb-2">Welcome Back</h2>

            <p className="text-body-sm text-on-surface-variant mb-6">
              Please enter your credentials to access your account.
            </p>

            <form className="space-y-4">
              <div>
                <label className="input-label">Email Address</label>

                <input
                  type="email"
                  required
                  maxLength="64"
                  pattern=".+@gmail\.com$"
                  placeholder="name@gmail.com"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="input-label">Password</label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="input pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </form>

            <div className="flex justify-between items-center mb-6 text-body-sm mt-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                Remember Me
              </label>

              <span
                onClick={handleResendVerification}
                className="text-primary-container cursor-pointer">
                {isSendingVerification ? "Sending..." : "Resend verification"}
              </span>
            </div>

            <div className="mb-4">
              <label className="input-label">Login as</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="input appearance-none pr-10">
                  <option value="Tenant">Tenant</option>
                  <option value="Admin">Admin</option>
                  <option value="Server">Server</option>
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                />
              </div>
            </div>

            <button
              onClick={goToUserDashBoard}
              className="btn btn-primary w-full mb-4">
              Login
            </button>

            <button
              onClick={handleGoogleLogin}
              className="btn btn-tertiary w-full mb-4">
              Continue with Google
            </button>

            <div className="text-center mt-5">
              <p className="text-sm text-on-surface-variant">
                Don't have an account?{" "}
                <span
                  onClick={goToRegister}
                  className="text-primary-container font-semibold cursor-pointer hover:underline">
                  Register
                </span>
              </p>
            </div>
            <p className="text-center text-label-caps text-on-surface-variant mt-6">
              © 2024 GharDhundho
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default LoginPage;
