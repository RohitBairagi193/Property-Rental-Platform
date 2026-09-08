import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  Users,
  PlusCircle,
  LogOut,
  Bell,
  UserRoundPenIcon,
  Trash2,
  CheckCircle2,
  WalletCards,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import Footer from "../Components/Footer";
import PageLoader from "../Components/PageLoader";
import usePageLoader from "../assets/usePageLoader";
import defaultProperties from "../assets/property";
import NotificationPopup from "../Components/NotificationPopup";
import { logoutUserWithFirebase, subscribeToAuthState } from "../firebase/auth";
import { auth } from "../firebase/config";
import {
  addPropertyToFirebase,
  deletePropertyFromFirebase,
  deleteBookingFromFirebase,
  getBookingsForPropertyOwner,
  getPropertiesFromFirebase,
  updatePropertyInFirebase,
  saveAdminPayoutDetails,
} from "../firebase/properties";
import { uploadPropertyImage } from "../supabase/storage";

const AdminDashboard = () => {
  const loading = usePageLoader();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [admin, setAdmin] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [editId, setEditId] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("success");
  const [payoutDetails, setPayoutDetails] = useState({
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    bankName: "",
  });
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

  const showPopup = (message, type = "success") => {
    setPopupMessage(message);
    setPopupType(type);
    setPopupOpen(true);
  };

  const isOwnedByAdmin = (property) =>
    property?.createdByUid === (admin?.uid || auth?.currentUser?.uid) ||
    (property?.createdByEmail &&
      property.createdByEmail.trim().toLowerCase() ===
        (admin?.email || auth?.currentUser?.email || "").trim().toLowerCase());

  const loadAllBookings = async (adminUid, adminEmail) => {
    try {
      setBookings(await getBookingsForPropertyOwner(adminUid, adminEmail));
    } catch (error) {
      console.error("Failed to load bookings", error);
      setBookings([]);
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (savedAdmin) => {
      if (!savedAdmin || savedAdmin.role !== "Admin") {
        navigate("/login");
        return;
      }

      setAdmin(savedAdmin);

      try {
        const firebaseProperties = await getPropertiesFromFirebase();
        setProperties(firebaseProperties.length > 0 ? firebaseProperties : defaultProperties);
      } catch (error) {
        setProperties(defaultProperties);
      }

      setUsers([]);
      await loadAllBookings(savedAdmin.uid, savedAdmin.email);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logoutUserWithFirebase();
    } catch (error) {
      console.error(error);
    }

    showPopup("Logout Successful", "success");

    setTimeout(() => {
      navigate("/login");
      window.location.reload();
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

    try {
      let imageUrl = newProperty.image || "";
      if (newProperty.imageFile) {
        imageUrl = await uploadPropertyImage(newProperty.imageFile);
      }

      const property = {
        id: Date.now(),
        type: newProperty.type,
        title: newProperty.title,
        price: Number(newProperty.price),
        location: newProperty.location,
        image: imageUrl || "https://images.unsplash.com/photo-1494526585095-c41746248156",
        feats: newProperty.feats
          ? newProperty.feats.split(",").map((i) => i.trim()).filter(Boolean)
          : ["2 BHK", "2 Bath", "1200 sq.ft"],
        available: true,
        isLiked: false,
        description: newProperty.description,
        amenities: newProperty.amenities
          ? newProperty.amenities.split(",").map((i) => i.trim()).filter(Boolean)
          : [],
        owner: newProperty.owner,
        ownerPhone: newProperty.ownerPhone,
        ownerEmail: newProperty.ownerEmail,
        createdByUid: admin.uid || auth?.currentUser?.uid || "",
        createdByEmail: admin.email || auth?.currentUser?.email || "",
        memberSince: newProperty.memberSince,
        serviceFee: Number(newProperty.serviceFee || 0),
        securityDeposit: Number(newProperty.securityDeposit || 0),
      };

      const savedProperty = await addPropertyToFirebase(property);
      setProperties((prev) => [savedProperty, ...prev]);

      showPopup("Property Added Successfully!", "success");

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
    } catch (error) {
      showPopup(error.message || "Property could not be added", "error");
    }
  };

  const handleUpdateProperty = async () => {
    const item = properties.find((property) => property.id === editId);
    if (!item) {
      alert("Property not found");
      return;
    }

    try {
      let imageUrl = item.image;
      if (newProperty.imageFile) {
        imageUrl = await uploadPropertyImage(newProperty.imageFile);
      } else if (newProperty.image) {
        imageUrl = newProperty.image;
      }

      const updatedProperty = {
        ...item,
        ...newProperty,
        id: item.id,
        image: imageUrl,
        price: Number(newProperty.price || item.price),
        serviceFee: Number(newProperty.serviceFee || item.serviceFee),
        securityDeposit: Number(newProperty.securityDeposit || item.securityDeposit),
        feats: newProperty.feats
          ? newProperty.feats.split(",").map((i) => i.trim()).filter(Boolean)
          : item.feats,
        amenities: newProperty.amenities
          ? newProperty.amenities.split(",").map((i) => i.trim()).filter(Boolean)
          : item.amenities,
      };
      delete updatedProperty.imageFile;

      setProperties((prev) =>
        prev.map((property) =>
          property.id === editId ? updatedProperty : property,
        ),
      );

      if (typeof item.id === "string") {
        await updatePropertyInFirebase(item.id, updatedProperty);
      }

      setEditId(null);
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
        memberSince: "",
        serviceFee: "",
        securityDeposit: "",
      });
      alert("Property Updated Successfully");
    } catch (error) {
      showPopup(error.message || "Property could not be updated", "error");
    }
  };
  const handleEditProperty = (property) => {
    if (!isOwnedByAdmin(property)) {
      showPopup("You can only edit properties added by you.", "error");
      return;
    }
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

  const handleDeleteProperty = async (id) => {
    const property = properties.find((item) => item.id === id);
    if (!isOwnedByAdmin(property)) {
      showPopup("You can only delete properties added by you.", "error");
      return;
    }

    try {
      if (property && typeof property.id === "string") {
        await deletePropertyFromFirebase(property.id);
      }

      const updated = properties.filter((item) => item.id !== id);
      setProperties(updated);
      showPopup("Property Deleted Successfully!", "success");
    } catch (error) {
      console.error(error);
      showPopup("Property could not be deleted", "error");
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await deleteBookingFromFirebase(bookingId);
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
      showPopup("Booking Cancelled Successfully!", "success");
    } catch (error) {
      console.log(error);
      showPopup("Something went wrong", "error");
    }
  };

  const handleSavePayoutDetails = async () => {
    if (!payoutDetails.accountHolder || !payoutDetails.accountNumber ||
      !payoutDetails.ifsc || !payoutDetails.bankName) {
      showPopup("Fill all bank details", "error");
      return;
    }

    try {
      await saveAdminPayoutDetails(admin.uid, payoutDetails);
      showPopup("Bank details saved for all your properties.", "success");
      setPayoutDetails({
        accountHolder: "",
        accountNumber: "",
        ifsc: "",
        bankName: "",
      });
    } catch (error) {
      showPopup(error.message || "Bank details could not be saved", "error");
    }
  };

  if (loading || !admin) {
    return <PageLoader />;
  }

  const navItems = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={18} className="inline mb-1" />,
    },
      {
      label: "Notifications",
      icon: <Bell size={18} className="inline mb-1" />,
    },
    {
      label: "Bookings",
      icon: <CalendarCheck size={18} className="inline mb-1" />,
    },

    {
      label: "Add Property",
      icon: <PlusCircle size={18} className="inline mb-1" />,
    },
    {
      label: "Bank Account",
      icon: <WalletCards size={18} className="inline mb-1" />,
    },
 {
      label: "Properties",
      icon: <Building2 size={18} className="inline mb-1" />,
    }, 
  
  ];

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
                <UserRoundPenIcon size={24} className="inline mb-1" />{" "}
                {admin?.name || "Admin"}
              </h3>
              <p className="text-on-primary-container text-body-sm">Admin</p>
            </div>

            <nav className="flex flex-col gap-4 ">
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
        <div className="flex-1 p-10 ">
          {activeTab === "Dashboard" && (
            <div
            className=" ml-70">
              <div className="mb-8">
                <h1>Hello, {admin?.name || "Admin"}!</h1>
                <p className="text-on-surface-variant text-body-sm">
                  Welcome back to admin panel.
                </p>
              </div>

              <div className="grid grid-cols-4 gap-6 mb-10">
                <div className="card">
                  <p className="label-caps mb-2">Total Properties</p>
                  <h2>{properties.length}</h2>
                </div>
                <div className="card">
                  <p className="label-caps mb-2">Total Bookings</p>
                  <h2>{bookings.length}</h2>
                </div>
                <div className="card">
                  <p className="label-caps mb-2">Available Properties</p>
                  <h2>{properties.filter((p) => p.available).length}</h2>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Properties" && (
            <div className="ml-70">
              <h2 className="mb-6">All Properties</h2>
              <div className="grid grid-cols-3 gap-6">
                {properties.length > 0 ? (
                  properties.map((property) => (
                    <div
                      key={property.id}
                      className="card rounded-2xl overflow-hidden">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="h-52 w-full object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-lg">
                          {property.title}
                        </h3>
                        <p className="text-sm text-on-surface-variant">
                          {property.location}
                        </p>
                        <div className="flex justify-between items-center mt-4">
                          <p className="font-bold text-xl">₹{property.price}</p>
                          {property.available ? (
                            <span className="badge badge-primary">
                              Available
                            </span>
                          ) : (
                            <span className="badge badge-secondary">
                              Rented
                            </span>
                          )}
                        </div>
                        {isOwnedByAdmin(property) && (
                          <>
                            <button
                              onClick={() => handleEditProperty(property)}
                              className="btn btn-primary w-full mt-2">
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProperty(property.id)}
                              className="btn btn-secondary w-full mt-4">
                              <Trash2 size={18} className="inline mr-2" />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No properties found</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "Bookings" && (
            <div className="card ml-70">
              <h2 className="mb-6">
                All Bookings
                <span className="badge badge-primary ml-3">
                  {bookings.length}
                </span>
              </h2>

              {bookings.length > 0 ? (
                bookings.map((booking, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center border-b pb-4 mb-4">
                    <div>
                      <p className="font-semibold">{booking.title}</p>
                      <p className="text-sm text-on-surface-variant">
                        {booking.location}
                      </p>
                      <p className="text-sm text-on-surface-variant">
                        User: {booking.userEmail || booking.email || "Unknown"}
                      </p>
                      <p className="text-sm text-on-surface-variant">
                        {booking.type === "visit" ? "Visit" : "Booking"} date: {booking.visitingdate}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-on-surface-variant">Renewal</p>
                      <p className="font-semibold">{booking.renewal}</p>
                    </div>

                    <div>
                      <p className="font-bold">
                        ₹{booking.amountPaid || booking.total}
                        {booking.platformFee ? ` (2% fee: ₹${booking.platformFee})` : ""}
                      </p>
                      {booking.paymentStatus && (
                        <p className="text-xs text-on-surface-variant">
                          Payment: {booking.paymentStatus}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="badge badge-primary">
                        {booking.type === "visit" ? "VISIT" : "PAID BOOKING"}
                      </span>
                      <button
                        onClick={() =>
                          handleCancelBooking(
                            booking.id,
                            booking.userEmail,
                            booking.title,
                          )
                        }
                        className="btn btn-secondary flex items-center gap-1">
                        <Trash2 size={16} />
                        Cancel
                      </button>
                    </div>
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

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Image URL"
                    className="input"
                    value={newProperty.image}
                    onChange={(e) =>
                      setNewProperty({ ...newProperty, image: e.target.value })
                    }
                  />
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
                </div>

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

                  {editId ? "Update Property" : "Add Property"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "Bank Account" && (
            <div className="card max-w-2xl ml-70">
              <h2 className="mb-2">Owner Bank Account</h2>
              <p className="text-sm text-on-surface-variant mb-6">
                These payout details apply automatically to every property you add
                or have already added. They are stored in a protected Firestore
                collection and are not shown to tenants.
              </p>
              <div className="space-y-4">
                {[
                  ["accountHolder", "Account holder name"],
                  ["accountNumber", "Bank account number"],
                  ["ifsc", "IFSC code"],
                  ["bankName", "Bank name"],
                ].map(([key, placeholder]) => (
                  <input
                    key={key}
                    type={key === "accountNumber" ? "password" : "text"}
                    placeholder={placeholder}
                    className="input"
                    value={payoutDetails[key]}
                    onChange={(event) =>
                      setPayoutDetails({ ...payoutDetails, [key]: event.target.value })
                    }
                  />
                ))}
                <button onClick={handleSavePayoutDetails} className="btn btn-primary w-full">
                  Save Bank Details
                </button>
                <p className="text-xs text-on-surface-variant">
                  Razorpay live payouts require a verified Razorpay account and a secure
                  server-side order/verification endpoint.
                </p>
              </div>
            </div>
          )}

          {activeTab === "Notifications" && (
            <div className="card ml-70">
              <h2 className="mb-6">Notifications</h2>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-green-500" />
                <p>{bookings.length} bookings received on platform.</p>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <CheckCircle2 className="text-green-500" />
                <p>
                  {properties.filter((p) => p.available).length} properties
                  currently available.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default AdminDashboard;
