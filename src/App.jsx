// App.jsx
import React, { useState, useEffect } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import Home from "./pages/Home";
import EventPage from "./pages/EventPage";
import Checkout from "./pages/Checkout";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgetPassword";
import Profile from "./pages/Profile";
import MyTickets from "./pages/MyTickets";

// Organizer Pages
import OrganizerDashboard from "./pages/Organizer/Dashboard";
import CreateEvent from "./pages/Organizer/CreateEvent";
import EditEvent from "./pages/Organizer/EditEvent";
import TicketManager from "./pages/Organizer/TicketManager";
import Orders from "./pages/Organizer/Orders";
import BoxOffice from "./pages/Organizer/BoxOffice";
import Analytics from "./pages/Organizer/Analytics";
import Discounts from "./pages/Organizer/Discounts";

export default function App() {
  

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Main Content */}
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/event/:id" element={<EventPage />} />
        <Route path="/checkout/:orderId" element={<Checkout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
       <Route path="/events" element={<OrganizerDashboard />} />


        {/* Organizer Pages */}
        <Route
          path="/organizer"
          element={<Navigate to="/organizer/create" replace />}
        />
        <Route path="/dashboard" element={<OrganizerDashboard />} />
        <Route path="/organizer/create" element={<CreateEvent />} />
        <Route path="/organizer/edit/:id" element={<EditEvent />} />
        <Route path="/organizer/tickets/:id" element={<TicketManager />} />
        <Route path="/organizer/orders" element={<Orders />} />
        <Route path="/organizer/boxoffice" element={<BoxOffice />} />
        <Route path="/organizer/analytics" element={<Analytics />} />
        <Route path="/organizer/discounts" element={<Discounts />} />

        {/* User Pages */}
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/profile" element={<Profile />} />

        {/* 404 Page */}
        <Route
          path="*"
          element={<div className="text-center mt-8">Page not found.</div>}
        />
      </Routes>
    </div>
  );
}
