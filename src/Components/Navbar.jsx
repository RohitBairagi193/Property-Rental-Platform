import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ShieldUser, User } from "lucide-react";
import { subscribeToAuthState } from "../firebase/auth";

const NAV_LINKS = [
  { path: "/", label: "Home" },
  { path: "/properties", label: "Properties" },
  { path: "/wishlist", label: "Wishlist" },
  { path: "/about", label: "About Us" },
];

const Navbar = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((currentUser) => {
      const nextUser = currentUser && currentUser.role === "Admin" ? null : currentUser;
      const nextAdmin = currentUser && currentUser.role === "Admin" ? currentUser : null;
      setUser(nextUser);
      setAdmin(nextAdmin);
    });

    return () => unsubscribe();
  }, []);

  const handleProfileClick = () => {
    if (admin) {
      navigate("/adminDashboard");
    } else if (user) {
      navigate("/userDashboard");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-white shadow-md fixed w-full h-16 z-50">
        <a href="/">
          <div>
            <h2 className="text-primary-logo ml-40 font-bold cursor-pointer">
              GharDhundho
            </h2>
          </div>
        </a>
        <div>
          <ul className="flex gap-8">
            {NAV_LINKS.map(({ path, label }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3 mr-40">
          {admin || user ? (
            <div
              onClick={handleProfileClick}
              className={`w-11 h-11 rounded-full text-white flex items-center justify-center cursor-pointer hover:scale-105 transition ${
                admin ? "bg-red-600" : "bg-primary-container"
              }`}>
              {admin ? <ShieldUser size={22} /> : <User size={22} />}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="btn-primary btn font-serif">
              Login
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
