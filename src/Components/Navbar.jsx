import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, ShieldUser, User, X } from "lucide-react";
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

  const [menuOpen, setMenuOpen] = useState(false);

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
      <div className="flex items-center justify-between gap-3 p-4 bg-white shadow-md fixed w-full h-16 z-50">
        <a href="/">
          <div>
            <h2 className="text-primary-logo ml-0 lg:ml-16 xl:ml-40 font-bold cursor-pointer">
              GharDhundho
            </h2>
          </div>
        </a>

        {/* Desktop links */}
        <div className="hidden md:block">
          <ul className="flex gap-4 lg:gap-8">
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

        <div className="flex items-center gap-3 mr-0 lg:mr-16 xl:mr-40">
          {admin || user ? (
            <div
              onClick={handleProfileClick}
              className={`w-11 h-11 rounded-full text-white overflow-hidden flex items-center justify-center cursor-pointer hover:scale-105 transition ${
                admin ? "bg-red-600" : "bg-primary-container"
              }`}>
              {(admin?.photoURL || user?.photoURL) ? (
                <img
                  src={admin?.photoURL || user?.photoURL}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : admin ? (
                <ShieldUser size={22} />
              ) : (
                <User size={22} />
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="btn-primary btn font-serif">
              Login
            </button>
          )}

          {/* Hamburger (mobile only) */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="md:hidden p-2 rounded-md text-primary-container cursor-pointer">
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-white shadow-md z-40 border-t border-outline-variant">
          <ul className="flex flex-col p-4 gap-1">
            {NAV_LINKS.map(({ path, label }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block py-3 px-2 rounded-md text-body-md ${
                      isActive
                        ? "bg-primary-fixed text-primary-container font-semibold"
                        : "text-on-surface-variant"
                    }`
                  }>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default Navbar;
