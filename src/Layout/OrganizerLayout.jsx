// src/layouts/OrganizerLayout.jsx
import React, { useState } from "react";
import Logo from "../components/Logo";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  FaHome,
  FaTicketAlt,
  FaUsers,
  FaChartLine,
  FaTags,
  FaCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaPlusCircle
} from "react-icons/fa";

export default function OrganizerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const menuItems = [
    { path: "/dashboard", icon: FaHome, label: "Dashboard" },
    { path: "/organizer/discounts", icon: FaTags, label: "Discounts" },
    { path: "/organizer/analytics", icon: FaChartLine, label: "Analytics" },
    { path: "/profile", icon: FaCog, label: "Settings" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-center border-b border-gray-100">
          <Link to="/">
            <Logo className="w-8 h-8" textClassName="text-xl" />
          </Link>
        </div>

        <div className="p-4">
            <Link
                to="/organizer/create"
                className="flex items-center justify-center gap-2 w-full bg-black text-white py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:bg-white hover:text-black hover:ring-2 hover:ring-black mb-6"
            >
                <FaPlusCircle /> Create Event
            </Link>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-black text-white shadow-md transform scale-105"
                      : "text-gray-500 hover:bg-gray-100 hover:text-black"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className={isActive ? "text-white" : "text-gray-400"} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 font-medium hover:bg-red-50 rounded-xl transition"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-gray-100 lg:hidden sticky top-0 z-30">
            <Link to="/" className="lg:hidden">
            <Logo className="w-8 h-8" textClassName="text-xl" />
          </Link>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-500 hover:text-black focus:outline-none transition-colors"
          >
            <FaBars size={24} />
          </button>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 lg:p-10">
            {children}
        </main>
      </div>
    </div>
  );
}
