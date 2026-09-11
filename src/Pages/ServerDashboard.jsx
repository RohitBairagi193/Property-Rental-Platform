import React, { useEffect, useState } from "react";
import {
  Bell,
  Building2,
  CalendarCheck,
  CheckCircle2,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Trash2,
  UserRoundPenIcon,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../Components/Footer";
import NotificationPopup from "../Components/NotificationPopup";
import PageLoader from "../Components/PageLoader";
import defaultProperties from "../assets/property";
import usePageLoader from "../assets/usePageLoader";
import {
  addPropertyToFirebase,
  deleteBookingFromFirebase,
  deletePropertyFromFirebase,
  subscribeToAllBookings,
  subscribeToProperties,
  updatePropertyInFirebase,
} from "../firebase/properties";
import { uploadPropertyImage } from "../supabase/storage";

const SERVER_ACCOUNT_EMAIL = "rohitbairagi255@gmail.com";

const ServerDashbord = () => {
  const loading = usePageLoader();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [serverUser, setServerUser] = useState(location.state?.user || null);
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState(defaultProperties);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [editId, setEditId] = useState(null);
  const [newProperty, setNewProperty] = useState({
    type: "",
    title: "",
    price: "",
    location: "",
    image: "",
    imageFile: null,
    feats: "",
    description: "",
    amenities: "",
    owner: "",
    ownerPhone: "",
    ownerEmail: "",
    memberSince: "",
    serviceFee: "",
    securityDeposit: "",
  });

  useEffect(() => {
    const currentUser = location.state?.user;

    if (!currentUser || currentUser.role !== "Server") {
      navigate("/login");
      return;
    }

    if (currentUser.email?.toLowerCase() !== SERVER_ACCOUNT_EMAIL) {
      navigate("/login");
      return;
    }

    setServerUser(currentUser);

    // Realtime listeners: dashboard updates live (no manual refresh) as
    // soon as any property or booking changes anywhere.
    const unsubscribeProperties = subscribeToProperties(
      (firebaseProperties) => {
        setProperties(firebaseProperties.length > 0 ? firebaseProperties : defaultProperties);
      },
      () => setProperties(defaultProperties),
    );
    const unsubscribeBookings = subscribeToAllBookings(setBookings);

    return () => {
      unsubscribeProperties();
      unsubscribeBookings();
    };
  }, [location.state, navigate]);

  const showPopup = (message, type = "success") => {
    setPopupMessage(message);
    setPopupType(type);
    setPopupOpen(true);
  };

  const handleLogout = () => {
    showPopup("Server logout successful", "success");
    setTimeout(() => {
      navigate("/login");
    }, 1200);
  };

  const handleAddProperty = async () => {
    if (
      !newProperty.type ||
      !newProperty.title ||
      !newProperty.price ||
      !newProperty.location
    ) {
      showPopup("Please fill all required fields", "error");
      return;
    }

    let imageUrl = newProperty.image;
    try {
      if (newProperty.imageFile) {
        imageUrl = await uploadPropertyImage(newProperty.imageFile);
      }
    } catch (error) {
      showPopup(error.message || "Image could not be uploaded", "error");
      return;
    }

    const property = {
      id: Date.now(),
      type: newProperty.type,
      title: newProperty.title,
      price: Number(newProperty.price),
      location: newProperty.location,
      image: imageUrl || "https://images.unsplash.com/photo-1494526585095-c41746248156",
      feats: newProperty.feats
        ? newProperty.feats.split(",").map((item) => item.trim()).filter(Boolean)
        : ["2 BHK", "2 Bath", "1200 sq.ft"],
      available: true,
      isLiked: false,
      description: newProperty.description,
      amenities: newProperty.amenities
        ? newProperty.amenities.split(",").map((item) => item.trim()).filter(Boolean)
        : [],
      owner: newProperty.owner,
      ownerPhone: newProperty.ownerPhone,
      ownerEmail: newProperty.ownerEmail,
      createdByUid: serverUser.uid,
      createdByEmail: serverUser.email,
      memberSince: newProperty.memberSince,
      serviceFee: Number(newProperty.serviceFee || 0),
      securityDeposit: Number(newProperty.securityDeposit || 0),
    };

    try {
      const savedProperty = await addPropertyToFirebase(property);
      setProperties((prev) => [savedProperty, ...prev]);
      showPopup("Property added by server admin", "success");
    } catch (error) {
      showPopup(error.message || "Property could not be added", "error");
      return;
    }
    setNewProperty({
      type: "",
      title: "",
      price: "",
      location: "",
      image: "",
      imageFile: null,
      feats: "",
      description: "",
      amenities: "",
      owner: "",
      ownerPhone: "",
      ownerEmail: "",
      memberSince: "",
      serviceFee: "",
      securityDeposit: "",
    });
  };

  const handleDeleteProperty = async (propertyId) => {
    try {
      const property = properties.find((item) => item.id === propertyId);
      if (typeof propertyId === "string") {
        await deletePropertyFromFirebase(propertyId, property?.image);
      }
      setProperties((prev) => prev.filter((property) => property.id !== propertyId));
      showPopup("Property deleted successfully", "success");
    } catch (error) {
      showPopup(error.message || "Property could not be deleted", "error");
    }
  };

  const handleEditProperty = (property) => {
    setEditId(property.id);
    setNewProperty({
      type: property.type,
      title: property.title,
      price: property.price,
      location: property.location,
      image: property.image,
      feats: property.feats.join(", "),
      description: property.description,
      amenities: property.amenities.join(", "),
      owner: property.owner,
      ownerPhone: property.ownerPhone || "",
      ownerEmail: property.ownerEmail || "",
      memberSince: property.memberSince,
      serviceFee: property.serviceFee,
      securityDeposit: property.securityDeposit,
    });
    setActiveTab("Add Property");
  };

  const handleUpdateProperty = async () => {
    const item = properties.find((property) => property.id === editId);
    if (!item) return;

    const updatedProperty = {
      ...item,
      ...newProperty,
      id: item.id,
      price: Number(newProperty.price || item.price),
      serviceFee: Number(newProperty.serviceFee || item.serviceFee),
      securityDeposit: Number(newProperty.securityDeposit || item.securityDeposit),
      feats: newProperty.feats.split(",").map((value) => value.trim()).filter(Boolean),
      amenities: newProperty.amenities.split(",").map((value) => value.trim()).filter(Boolean),
    };
    delete updatedProperty.imageFile;

    try {
      if (newProperty.imageFile) {
        updatedProperty.image = await uploadPropertyImage(newProperty.imageFile);
      }
      await updatePropertyInFirebase(item.id, updatedProperty);
      setProperties((prev) => prev.map((property) =>
        property.id === item.id ? updatedProperty : property,
      ));
      setEditId(null);
      showPopup("Property updated successfully", "success");
    } catch (error) {
      showPopup(error.message || "Property could not be updated", "error");
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await deleteBookingFromFirebase(bookingId);
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
      showPopup("Booking cancelled successfully", "success");
    } catch (error) {
      showPopup(error.message || "Booking could not be cancelled", "error");
    }
  };

  const navItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={18} className="inline mb-1" /> },
    { label: "Notifications", icon: <Bell size={18} className="inline mb-1" /> },
    { label: "Bookings", icon: <CalendarCheck size={18} className="inline mb-1" /> },
    { label: "Add Property", icon: <PlusCircle size={18} className="inline mb-1" /> },
    { label: "Properties", icon: <Building2 size={18} className="inline mb-1" /> },
  ];

  if (loading || !serverUser) {
    return <PageLoader />;
  }

  return (
    <>
      <NotificationPopup
        isOpen={popupOpen}
        message={popupMessage}
        type={popupType}
        onClose={() => setPopupOpen(false)}
      />

      <div className="min-h-screen flex bg-surface pt-16">
        <div className="w-65 h-120 bg-primary-container text-white flex flex-col justify-between p-6 fixed mt-2">
          <div>
            <h2 className="display-lg text-white mb-8">GharDhundho</h2>

            <div className="mb-6">
              <h3 className="text-white">
                <UserRoundPenIcon size={24} className="inline mb-1" /> {serverUser.name}
              </h3>
              <p className="text-on-primary-container text-body-sm">Server Admin</p>
            </div>

            <nav className="flex flex-col gap-4">
              {navItems.map(({ label, icon }) => (
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

          <button onClick={handleLogout} className="btn btn-secondary mt-5">
            <LogOut size={18} className="inline mr-2" />
            Logout
          </button>
        </div>

        <div className="flex-1 p-10">
          {activeTab === "Dashboard" && (
            <div className="ml-70">
              <div className="mb-8">
                <h1>Hello, {serverUser.name}!</h1>
                <p className="text-on-surface-variant text-body-sm">
                  This page is only for the one server admin.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-10">
                <div className="card">
                  <p className="label-caps mb-2">Total Properties</p>
                  <h2>{properties.length}</h2>
                </div>
                <div className="card">
                  <p className="label-caps mb-2">Available Properties</p>
                  <h2>{properties.filter((property) => property.available).length}</h2>
                </div>
                <div className="card">
                  <p className="label-caps mb-2">Bookings</p>
                  <h2>{bookings.length}</h2>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Properties" && (
            <div className="ml-70">
              <h2 className="mb-6">Server Property Controls</h2>
              <div className="grid grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div key={property.id} className="card rounded-2xl overflow-hidden">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="h-52 w-full object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-lg">{property.title}</h3>
                      <p className="text-sm text-on-surface-variant">{property.location}</p>
                      <div className="flex justify-between items-center mt-4">
                        <p className="font-bold text-xl">₹{property.price}</p>
                        {property.available ? (
                          <span className="badge badge-primary">Available</span>
                        ) : (
                          <span className="badge badge-secondary">Rented</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleEditProperty(property)}
                        className="btn btn-primary w-full mt-4">
                        Edit Property
                      </button>
                      <button
                        onClick={() => handleDeleteProperty(property.id)}
                        className="btn btn-secondary w-full mt-2">
                        <Trash2 size={18} className="inline mr-2" />
                        Delete Property
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "Bookings" && (
            <div className="card ml-70">
              <h2 className="mb-6">All Bookings</h2>

              {bookings.length > 0 ? (
                bookings.map((booking, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center border-b pb-4 mb-4">
                    <div>
                      <p className="font-semibold">{booking.title}</p>
                      <p className="text-sm text-on-surface-variant">{booking.location}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-on-surface-variant">Renewal</p>
                      <p className="font-semibold">{booking.renewal}</p>
                    </div>

                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="btn btn-secondary flex items-center gap-1">
                      <Trash2 size={16} />
                      Cancel
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-on-surface-variant">No bookings found</p>
              )}
            </div>
          )}

          {activeTab === "Add Property" && (
            <div className="card max-w-2xl ml-70">
              <h2 className="mb-6">Add New Property</h2>
              <div className="space-y-4">
                {[
                  {
                    key: "type",
                    placeholder: "Property Type (Apartment / Villa / PG)",
                    type: "text",
                  },
                  { key: "title", placeholder: "Property Title", type: "text" },
                  { key: "location", placeholder: "Location", type: "text" },
                  {
                    key: "price",
                    placeholder: "Price (monthly rent)",
                    type: "number",
                  },
                  { key: "image", placeholder: "Image URL", type: "text" },
                  {
                    key: "feats",
                    placeholder:
                      "Features (comma separated: 3 BHK, 2 Bath, 1800 sq.ft)",
                    type: "text",
                  },
                  {
                    key: "amenities",
                    placeholder:
                      "Amenities (comma separated: Gym, Parking, WiFi)",
                    type: "text",
                  },
                  { key: "owner", placeholder: "Owner Name", type: "text" },
                  { key: "ownerPhone", placeholder: "Owner Phone Number", type: "tel" },
                  { key: "ownerEmail", placeholder: "Owner Email", type: "email" },
                  {
                    key: "memberSince",
                    placeholder: "Member Since (e.g. Jan 2020)",
                    type: "text",
                  },
                  {
                    key: "serviceFee",
                    placeholder: "Service Fee",
                    type: "number",
                  },
                  {
                    key: "securityDeposit",
                    placeholder: "Security Deposit",
                    type: "number",
                  },
                ].map(({ key, placeholder, type }) => (
                  <input
                    key={key}
                    type={type}
                    placeholder={placeholder}
                    className="input"
                    value={newProperty[key]}
                    onChange={(e) =>
                      setNewProperty({ ...newProperty, [key]: e.target.value })
                    }
                  />
                ))}

                <label className="block text-sm text-on-surface-variant">
                  Upload property image (Supabase)
                  <input
                    type="file"
                    accept="image/*"
                    className="input mt-2"
                    onChange={(event) =>
                      setNewProperty({
                        ...newProperty,
                        imageFile: event.target.files?.[0] || null,
                      })
                    }
                  />
                </label>

                <textarea
                  placeholder="Description"
                  className="input h-28"
                  value={newProperty.description}
                  onChange={(e) =>
                    setNewProperty({
                      ...newProperty,
                      description: e.target.value,
                    })
                  }
                />

                <button
                  onClick={editId ? handleUpdateProperty : handleAddProperty}
                  className="btn btn-primary w-full">
                  <PlusCircle size={18} className="inline mr-2" />
                  {editId ? "Update Property as Server" : "Add Property as Server"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "Notifications" && (
            <div className="card ml-70">
              <h2 className="mb-6">Server Notifications</h2>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-green-500" />
                <p>{bookings.length} bookings received on platform.</p>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <CheckCircle2 className="text-green-500" />
                <p>
                  {properties.filter((property) => property.available).length} properties
                  currently available.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ServerDashbord;
