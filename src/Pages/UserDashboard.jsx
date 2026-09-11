import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageLoader from "../Components/PageLoader";
import usePageLoader from "../assets/usePageLoader";
import NotificationPopup from "../Components/NotificationPopup";
import {
  Bell,
  CalendarCheck,
  Heart,
  LayoutDashboard,
  User,
  UserRoundPenIcon,
  Trash2,
} from "lucide-react";
import { MyContext } from "../Context/MyContextProvder";
import CardItems from "../Components/CardItems";
import {
  logoutUserWithFirebase,
  subscribeToAuthState,
} from "../firebase/auth";
import {
  deleteBookingFromFirebase,
  subscribeToBookingsForUser,
  setPropertyAvailability,
} from "../firebase/properties";

const UserDashboard = () => {
  const loading = usePageLoader();
  const [user, setUser] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const wishlist = useContext(MyContext).wishlist;
  const navigate = useNavigate();

  const showPopup = (message, type = "success") => {
    setPopupMessage(message);
    setPopupType(type);
    setPopupOpen(true);
  };

  const goToHome = async () => {
    try {
      await logoutUserWithFirebase();
    } catch (error) {
      console.error(error);
    }

    setRecentBookings([]);

    showPopup("Logout Successful", "success");

    setTimeout(() => {
      navigate("/");
      window.location.reload();
    }, 1500);
  };

  useEffect(() => {
    // Realtime listener for this user's bookings so the dashboard updates
    // live (no manual refresh) as soon as a booking is added/cancelled.
    let unsubscribeBookings = () => {};

    const unsubscribeAuth = subscribeToAuthState((savedUser) => {
      unsubscribeBookings();

      if (savedUser) {
        setUser(savedUser);
        unsubscribeBookings = subscribeToBookingsForUser(savedUser.uid, setRecentBookings);
      } else {
        navigate("/login");
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeBookings();
    };
  }, [navigate]);

  const handleCancelBooking = async (bookingId) => {
    try {
      const booking = recentBookings.find((item) => item.id === bookingId);
      await deleteBookingFromFirebase(bookingId);

      // Only a real "booking" removes the property from the market, so only
      // a real booking's cancellation should put it back.
      if (booking?.type === "booking" && booking?.propertyId) {
        try {
          await setPropertyAvailability(booking.propertyId, true);
        } catch (availabilityError) {
          console.error("Failed to restore property availability", availabilityError);
        }
      }

      const updated = recentBookings.filter((item) => item.id !== bookingId);
      setRecentBookings(updated);
      window.dispatchEvent(new CustomEvent("ghardhundho-booking-updated", { detail: updated }));
      showPopup("Booking or Visit Cancelled Successfully", "success");
    } catch (error) {
      console.log(error);
      showPopup("Something went wrong", "error");
    }
  };

  if (loading || !user) return <PageLoader />;

  return (
    <div className="min-h-screen flex bg-surface pt-16">
      <NotificationPopup
        isOpen={popupOpen}
        message={popupMessage}
        type={popupType}
        onClose={() => setPopupOpen(false)}
      />

      <div className="w-65 bg-primary-container text-white flex flex-col justify-between p-6">
        <div>
          <h2 className="display-lg text-white mb-8">GharDhundho</h2>

          <div className="mb-6">
            <h3 className="text-white">
              <UserRoundPenIcon size={24} className="inline mb-1" /> {user.name}
            </h3>

            <p className="text-on-primary-container text-body-sm">Tenant</p>
          </div>

          <nav className="flex flex-col gap-4">
            {[
              {
                label: "Dashboard",
                icon: <LayoutDashboard size={18} className="inline mb-1" />,
              },

              {
                label: "My Bookings",
                icon: <CalendarCheck size={18} className="inline mb-1" />,
              },

              {
                label: "Wishlist",
                icon: <Heart size={18} className="inline mb-1" />,
              },

              {
                label: "My Profile",
                icon: <User size={18} className="inline mb-1" />,
              },

              {
                label: "Notifications",
                icon: <Bell size={18} className="inline mb-1" />,
              },
            ].map(({ label, icon }) => (
              <span
                key={label}
                onClick={() => setActiveTab(label)}
                className={`nav-link cursor-pointer ${
                  activeTab === label
                    ? "bg-white text-black rounded-lg px-3 py-2"
                    : "text-white"
                }`}>
                {icon} {label}
              </span>
            ))}
          </nav>
        </div>

        <button onClick={goToHome} className="btn btn-secondary">
          Logout
        </button>
      </div>

      <div className="flex-1 p-10">
        {activeTab === "Dashboard" && (
          <>
            <div className="mb-8">
              <h1>Hello, {user.name}!</h1>

              <p className="text-on-surface-variant text-body-sm">
                Welcome back to your premium rental hub.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-10">
              <div className="card">
                <p className="label-caps mb-2">Total Bookings</p>

                <h2>{recentBookings.length}</h2>
              </div>

              <div className="card">
                <p className="label-caps mb-2">Wishlist Items</p>

                <h2>{wishlist.length}</h2>
              </div>

              <div className="card">
                <p className="label-caps mb-2">Next Renewal</p>

                <h2>
                  {recentBookings.length > 0
                    ? recentBookings[0].renewal
                    : "N/A"}
                </h2>
              </div>
            </div>

            {recentBookings.length > 0 && (
              <div className="card">
                <h2 className="mb-4">Recent Bookings & Visit</h2>

                {recentBookings.slice(0, 3).map((booking, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center border-b pb-3 mb-3">
                    <div>
                      <p className="font-semibold">{booking.title}{booking.for_visit}</p>

                      <p className="text-body-sm text-on-surface-variant">
                        {booking.location}
                      </p>
                    </div>

                    <span className="badge badge-primary">ACTIVE</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "My Bookings" && (
          <div className="card">
            <h2 className="mb-6">My Bookings</h2>

            {recentBookings.length > 0 ? (
              recentBookings.map((booking, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center border-b pb-4 mb-4">
                  <div>
                    <p className="font-semibold">{booking.title}{booking.for_visit}</p>

                    <p className="text-body-sm text-on-surface-variant">
                      {booking.location}
                    </p>
                     <p className="text-body-sm text-on-surface-variant">
                Visiting Date: {booking.visitingdate}
                    </p>

                    <p className="text-body-sm text-on-surface-variant">
                      Renewal: {booking.renewal}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="price font-bold mb-2">₹{booking.total}</p>

                    <span className="badge badge-primary block mb-2 text-center">
                      ACTIVE
                    </span>

                    <button
                      onClick={() =>
                        handleCancelBooking(booking.id, booking.title)
                      }
                      className="btn btn-secondary btn-sm flex items-center gap-1">
                      <Trash2 size={14} />
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-on-surface-variant">No bookings yet</p>
            )}
          </div>
        )}

        {activeTab === "Wishlist" && (
          <div className="card">
            <h2 className="mb-4">Wishlist</h2>

            {wishlist.length > 0 ? (
              <CardItems wishlist={wishlist} />
            ) : (
              <p className="text-on-surface-variant">
                No saved properties yet.
              </p>
            )}
          </div>
        )}

        {activeTab === "My Profile" && (
          <div className="card">
            <h2 className="mb-4">My Profile</h2>

            <div className="space-y-3">
              <p>
                <strong>Name:</strong> {user.name}
              </p>

              <p>
                <strong>Email:</strong> {user.email}
              </p>

              <p>
                <strong>Role:</strong> {user.role}
              </p>
            </div>
          </div>
        )}

        {activeTab === "Notifications" && (
          <div className="card">
            <h2 className="mb-4">Notifications</h2>

            {recentBookings.length > 0 ? (
              <p>
                ✅ {recentBookings.length} active booking(s) on your account.
              </p>
            ) : (
              <p className="text-on-surface-variant">No new notifications.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;