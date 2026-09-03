import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Home from "./Pages/Home";
import PropertyDetail from "./Pages/PropertyDetail";
import LoginPage from "./Pages/LoginPage";
import Wishlist from "./Pages/Wishlist";
import Properties from "./Pages/Properties";
import UserDashboard from "./Pages/UserDashboard";
import properties from "./assets/property";
import AboutUsPage from "./Pages/AboutUsPage";
import AdminDashboard from "./Pages/AdminDashboard";
import RegisterPage from "./Pages/RegisterPage";
import ServerDashbord from "./Pages/ServerDashboard";

function App() {
  return (
    <>
    <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/userDashboard" element={<UserDashboard />} />
        <Route path="/serverDashboard" element={<ServerDashbord/>} />
        <Route path="/adminDashboard" element={<AdminDashboard />} />
        <Route path="/propertiesdetail" element={<PropertyDetail />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/about" element={<AboutUsPage />} />
      </Routes>
    </>
  );
}

export default App;
