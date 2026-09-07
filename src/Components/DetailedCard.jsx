import {
  ArrowBigLeft,
  ArrowBigRight,
  Bath,
  Bed,
  Contact,
  IndianRupee,
  Mail,
  MapPin,
  Maximize2,
  Phone,
  Star,
  UserRound,
  X,
} from "lucide-react";
import Footer from "../Components/Footer";
import { useState } from "react";
import amenityIcons from "../Components/amenityIcons";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { auth } from "../firebase/config";
import {
  addBookingToFirebase,
  getPropertiesFromFirebase,
} from "../firebase/properties";

const DetailedCard = ({ item }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [contactPopupOpen, setContactPopupOpen] = useState(false);
  const [checkInDate, setCheckInDate] = useState("");
  const [duration, setDuration] = useState(12);

 const ownerContact = {
   name: item.owner || "Property Owner",
   phone: item.ownerPhone || item.phone || "+91 98765 43210",
   email: item.ownerEmail || item.email || "owner@ghardhundho.com",
 };

 const totalRent = parseInt(item.price) * duration;
 const grandTotal =
   totalRent + parseInt(item.serviceFee) + parseInt(item.securityDeposit);

 const openRazorpayCheckout = async () => {
     if (!auth?.currentUser) {
     throw new Error("Please log in to continue.");
     }

     const platformFee = Math.ceil(grandTotal * 0.02);
     const amountToCharge = grandTotal + platformFee;
     const paymentApiUrl = import.meta.env.VITE_PAYMENT_API_URL || "http://localhost:8080";
     if (!window.Razorpay) {
       const script = document.createElement("script");
       script.src = "https://checkout.razorpay.com/v1/checkout.js";
       script.async = true;
       document.body.appendChild(script);
       await new Promise((resolve, reject) => {
         script.onload = resolve;
         script.onerror = () => reject(new Error("Razorpay checkout could not load"));
       });
     }

     const orderResponse = await fetch(`${paymentApiUrl}/create-order`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
         amount: Math.round(amountToCharge * 100),
         propertyId: String(item.id),
         userId: auth.currentUser.uid,
       }),
     });

     if (!orderResponse.ok) {
       throw new Error("Could not create Razorpay order");
     }

     const order = await orderResponse.json();
     return new Promise((resolve, reject) => {
       const checkout = new window.Razorpay({
         key: order.keyId,
         amount: order.amount,
         currency: order.currency,
         name: "GharDhundho",
         description: item.title,
         order_id: order.id,
         prefill: {
           email: auth.currentUser.email || "",
         },
         handler: async (payment) => {
           try {
             const verifyResponse = await fetch(`${paymentApiUrl}/verify-payment`, {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify(payment),
             });
             const verification = await verifyResponse.json();
             if (!verifyResponse.ok || !verification.verified) {
               reject(new Error("Payment verification failed"));
               return;
             }
             resolve(payment);
           } catch (error) {
             reject(error);
           }
         },
         modal: {
           ondismiss: () => reject(new Error("Payment was cancelled")),
         },
         theme: { color: "#1f4d3a" },
       });
     checkout.open();
   });
  };

  const saveBookingActivity = async (type, payment = {}) => {
   if (!auth?.currentUser) {
     alert("Please log in to continue.");
     return false;
   }

   const firebaseProperties = await getPropertiesFromFirebase();
   const firebaseProperty = firebaseProperties.find(
     (property) =>
       String(property.id) === String(item.id) ||
       (property.title === item.title && property.location === item.location),
   );
   const property = firebaseProperty || item;
   const finalCheckInDate = checkInDate || new Date().toISOString().slice(0, 10);
   const platformFee = type === "booking" ? Math.ceil(grandTotal * 0.02) : 0;
   const bookingRecord = {
     userId: auth.currentUser.uid,
     userEmail: auth.currentUser.email || "",
     email: auth.currentUser.email || "",
     propertyId: String(property.id),
     propertyCreatedByUid: property.createdByUid || "",
     propertyCreatedByEmail: property.createdByEmail || "",
     owner: property.owner || "",
     title: property.title,
     location: property.location,
     total: grandTotal,
     platformFee,
     amountPaid: grandTotal + platformFee,
     renewal: `${duration} Months`,
     visitingdate: finalCheckInDate,
     for_visit: type === "visit" ? " Visit" : " Booking",
     type,
     paymentId: payment.razorpay_payment_id || "",
     orderId: payment.razorpay_order_id || "",
     paymentStatus: type === "booking" ? "verified" : "not_required",
     createdAt: new Date().toISOString(),
   };

   try {
     await addBookingToFirebase(bookingRecord);
     window.dispatchEvent(new CustomEvent("ghardhundho-booking-updated", { detail: bookingRecord }));
     return true;
   } catch (error) {
     console.error("Booking save failed", error);
     alert(error.message || "Unable to save booking. Please try again.");
     return false;
   }
 };

 const handleBookNow = async () => {
   if (!item.available) {
     alert("This property is already rented.");
     return;
   }

   if (!checkInDate) {
     alert("Please select check-in date");
     return;
   }

   try {
     const payment = await openRazorpayCheckout();
     const saved = await saveBookingActivity("booking", payment);
     if (!saved) return;
     setPopupMessage(`Payment successful (${payment.razorpay_payment_id})`);
   } catch (error) {
     alert(error.message || "Payment could not be completed.");
     return;
   }
   setShowPopup(true);
   setTimeout(() => setShowPopup(false), 2000);
 };

 const handleScheduleVisit = async () => {
   if (!item.available) {
     alert("This property is already rented.");
     return;
   }

   if (!checkInDate) {
     alert("Please select check-in date");
     return;
   }

   const saved = await saveBookingActivity("visit");
   if (!saved) return;

   setPopupMessage("Visit scheduled successfully!");
   setShowPopup(true);
   setTimeout(() => setShowPopup(false), 2000);
 };

 const handleContactOwner = () => {
   setContactPopupOpen(true);
 };

 return (
    <>
      <div className="container-main px-gutter pt-5">
        <a
          href="/"
          className="text-md font-bold mb-4 ml-10 cursor-pointer align-middle gap-1">
          <ArrowBigLeft className="inline" size={18} /> Back to Home
        </a>
        <a
          href="/properties"
          className="text-md font-bold mb-4 ml-290 cursor-pointer align-middle gap-1">
          Back to listings
          <ArrowBigRight className="inline" size={18} />
        </a>

        <div className="bg-white rounded-lg shadow-md overflow-hidden py-3">
          {showPopup && (
            <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center animate-[popup_0.3s_ease]">
                <div className="w-40 h-40 flex items-center justify-center">
                  <DotLottieReact
                    src="https://lottie.host/1dfcff09-eff8-4724-84f7-593a8abcca7e/0u4RTC6o1h.lottie"
                    loop
                    autoplay
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
                <h2 className="text-xl font-bold mt-2 text-green-600">
                  Success
                </h2>
                <p className="text-gray-500 mt-1 text-center">{popupMessage}</p>
              </div>
            </div>
          )}

          {contactPopupOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-2xl p-6 w-[90%] max-w-[500px]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-primary-container">
                    Owner Contact
                  </h2>
                  <button
                    onClick={() => setContactPopupOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <UserRound className="text-primary-container" size={20} />
                    <span className="font-semibold">{ownerContact.name}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="text-primary-container" size={20} />
                    <span>{ownerContact.phone}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="text-primary-container" size={20} />
                    <span>{ownerContact.email}</span>
                  </div>
                </div>

                <button
                  onClick={() => setContactPopupOpen(false)}
                  className="btn btn-primary w-full mt-6">
                  Close
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-20 pt-3.5">
            <div className="lg:col-span-2">
              <div className="relative overflow-hidden rounded-lg">
                <img src={item.image} className="w-full h-120 object-cover" />
                <div className="absolute inset-0 bg-primary-blur" />
              </div>

              <h1 className="mt-4">{item.title}</h1>
              <p className="text-sm text-on-surface-variant">
                <MapPin className="inline" size={20} /> {item.location}
              </p>

              <div className="mt-6">
                <h2>About this property</h2>
                <p className="mt-2 text-sm leading-body">{item.description}</p>
              </div>

              <div className="mt-6">
                <h2>Amenities</h2>
                <div className="flex flex-wrap gap-3 mt-3">
                  {item.amenities.map((f, i) => {
                    const icon = amenityIcons[f] || <Star size={14} />;
                    return (
                      <span
                        key={i}
                        className="badge badge-primary flex items-center gap-1">
                        {icon}
                        {f}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {item.feats.map((f, i) => (
                  <div key={i} className="card text-center">
                    <p className="label-caps text-xl">
                      {i === 0 ? (
                        <Bed size={20} className="inline mb-1" />
                      ) : i === 1 ? (
                        <Bath size={20} className="inline mb-1" />
                      ) : (
                        <Maximize2 size={20} className="inline mb-1" />
                      )}{" "}
                      <span>{f}</span>
                    </p>
                  </div>
                ))}
              </div>

              <div className="card mt-8 flex justify-between items-center">
                <div>
                  <h3>
                    <UserRound className="inline align-middle mb-2" size={24} />{" "}
                    {item.owner}
                  </h3>
                  <p className="text-sm">
                    Member since Jan {item.memberSince.split(" ")[1]}
                  </p>
                </div>
                <button onClick={handleContactOwner} className="btn btn-secondary">
                  <Contact className="inline align-middle" size={20} /> Contact
                </button>
              </div>
            </div>
            <div className="card w-96 h-fit relative">
              <p className="label-caps pb-1">
                {item.available ? (
                  <span className="absolute top-3 left-3 badge badge-primary">
                    Available
                  </span>
                ) : (
                  <span className="absolute top-3 left-3 badge badge-secondary">
                    Rented
                  </span>
                )}
              </p>

              <h2 className="price mt-1">
                <IndianRupee className="inline mb-1" size={24} />
                {item.price}/month
              </h2>

              <div className="mt-4">
                <label className="input-label">Check-in Date</label>
                <input
                  type="date"
                  className="input"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                />
              </div>

              <div className="mt-4">
                <label className="input-label">Duration</label>
                <select
                  className="input"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}>
                  <option value={1}>1 Month</option>
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months</option>
                  <option value={12}>12 Months</option>
                </select>
              </div>

              <div className="mt-6 text-sm">
                <div className="flex justify-between">
                  <span>Monthly Rent</span>
                  <span>
                    <IndianRupee className="inline" size={14} />
                    {totalRent}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Security Deposit</span>
                  <span>
                    <IndianRupee className="inline" size={14} />
                    {item.securityDeposit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>
                    <IndianRupee className="inline" size={14} />
                    {item.serviceFee}
                  </span>
                </div>
                <div className="flex justify-between mt-3 font-semibold">
                  <span>Total</span>
                  <span>
                    <IndianRupee className="inline" size={14} />
                    {grandTotal}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-6">
                <button
                  onClick={handleBookNow}
                  disabled={!item.available}
                  className={`btn ${
                    item.available
                      ? "btn-primary"
                      : "bg-gray-400 cursor-not-allowed text-white"
                  }`}>
                  {item.available ? "Book Now" : "Already Rented"}
                </button>
                <button
                  onClick={handleScheduleVisit}
                  disabled={!item.available}
                  className={`btn ${
                    item.available
                      ? "btn-primary"
                      : "bg-gray-400 cursor-not-allowed text-white"
                  }`}>
                  {item.available ? "Schedule Visit" : "Already Rented"}
                </button>
              </div>
              <p className="text-xs mt-3 text-center">
                No credit card charged yet.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>

      <style>{`
        @keyframes popup {
          0%   { opacity: 0; transform: scale(0.7); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
};

export default DetailedCard;
