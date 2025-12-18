// src/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { FaBars, FaTimes } from "react-icons/fa";
import Logo from "./Logo";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleDiscoverClick = (e) => {
    // If we are already on home, scroll to events
    if (location.pathname === "/") {
      e.preventDefault();
      const element = document.getElementById("events");
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/">
            <Logo className="w-10 h-10" textClassName="text-2xl" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a 
              href="/#events" 
              onClick={handleDiscoverClick}
              className="text-gray-600 hover:text-black font-medium transition"
            >
              Discover
            </a>
            <Link to="#" className="text-gray-600 hover:text-black font-medium transition">
              Pricing
            </Link>
            <Link to="#" className="text-gray-600 hover:text-black font-medium transition">
              Blog
            </Link>
            
            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            {isLoggedIn ? (
              <>
                 <Link to="/organizer" className="text-gray-900 font-semibold hover:text-black transition">
                  Organizer
                </Link>
                <Link to="/profile" className="text-gray-600 font-medium hover:text-black transition">
                  My Profile
                </Link>
              </>
            ) : (
              <Link to="/login" className="text-gray-900 font-semibold hover:text-black transition">
                Log In
              </Link>
            )}

            <Link
              to={isLoggedIn ? "/dashboard" : "/login"}
              className="bg-black text-white px-5 py-2.5 rounded-full font-bold transition-all duration-300 shadow-lg hover:bg-white hover:text-black hover:ring-2 hover:ring-black"
            >
              Go to dashboard
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-600 hover:text-black focus:outline-none"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible'}`}>
        <div className="flex flex-col p-6 space-y-5">
          <a href="/#events" onClick={() => setIsOpen(false)} className="text-gray-600 font-bold text-lg border-b border-gray-50 pb-2">Discover</a>
          
          {isLoggedIn ? (
            <>
              <Link to="/organizer" onClick={() => setIsOpen(false)} className="text-gray-900 font-black text-lg">Organizer Dashboard</Link>
              <Link to="/profile" onClick={() => setIsOpen(false)} className="text-gray-600 font-bold text-lg">My Profile</Link>
              <button 
                onClick={async () => {
                  setIsOpen(false);
                  await auth.signOut();
                  navigate("/login");
                }} 
                className="text-red-500 font-bold text-left text-lg"
              >
                Log Out
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setIsOpen(false)} className="text-gray-900 font-black text-lg">Log In</Link>
          )}

          <Link
            to={isLoggedIn ? "/dashboard" : "/login"}
            onClick={() => setIsOpen(false)}
            className="bg-black text-white text-center px-5 py-4 rounded-2xl font-black shadow-xl hover:bg-white hover:text-black hover:ring-2 hover:ring-black transition-all duration-300 text-lg"
          >
            {isLoggedIn ? "Go to dashboard" : "Get Started"}
          </Link>
        </div>
      </div>
    </header>
  );
}
