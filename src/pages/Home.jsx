import React, { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaTicketAlt } from "react-icons/fa";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, "events"), orderBy("start", "desc"));
        const snap = await getDocs(q);
        const allEvents = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        
        const now = new Date().getTime();
        const liveEvents = allEvents.filter(ev => {
            if (ev.status !== 'live') return false;
            
            const endTime = ev.end ? new Date(ev.end.seconds * 1000).getTime() : 
                            ev.start ? new Date(ev.start.seconds * 1000 + 86400000).getTime() : null;
            return endTime ? now < endTime : true;
        }).slice(0, 12);

        setEvents(liveEvents);
      } catch (err) {
        console.error("Failed to load events", err);
        setEvents([]);
      }
    }
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/events?query=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gray-50 -z-10"></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-50 rounded-full blur-3xl opacity-50"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-8 animate-fade-in-up">
                <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                <span className="text-xs font-bold uppercase tracking-wide text-gray-600">The #1 Event Platform in Africa</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-[1.1] mb-8 max-w-4xl mx-auto animate-fade-in-up delay-100 px-4">
              Experience the best <br className="hidden md:block"/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-black via-gray-700 to-black">Live Events</span> near you.
            </h1>
            
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up delay-200">
              Discover concerts, conferences, and workshops. Book tickets effortlessly and manage your bookings in one place.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="w-full max-w-2xl relative shadow-2xl shadow-gray-200 rounded-full animate-fade-in-up delay-300 group focus-within:ring-4 focus-within:ring-gray-100 transition-all">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 group-focus-within:text-black transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 md:pl-14 pr-28 md:pr-32 py-4 md:py-5 rounded-full border border-gray-100 bg-white text-gray-900 placeholder-gray-400 text-base md:text-lg focus:outline-none focus:border-gray-300 transition-all font-medium"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 bg-black hover:bg-gray-800 text-white px-5 md:px-8 rounded-full font-bold transition-all hover:scale-105 active:scale-95 text-sm md:text-base"
              >
                Search
              </button>
            </form>

            {/* Category Pills */}
            <div className="mt-12 flex flex-wrap justify-center gap-3 animate-fade-in-up delay-300">
               {['Music', 'Tech', 'Arts', 'Business', 'Nightlife', 'Workshops'].map((cat) => (
                   <button key={cat} className="px-6 py-2.5 rounded-full border border-gray-200 bg-white text-gray-600 font-bold hover:border-black hover:text-black hover:shadow-lg transition-all duration-300 text-sm">
                       {cat}
                   </button>
               ))}
            </div>
        </div>
      </section>

      {/* Events Grid */}
      <section id="events" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-grow w-full">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
             <h2 className="text-4xl font-black text-gray-900 tracking-tight">Upcoming Events</h2>
             <p className="text-gray-500 mt-2 text-lg">Curated experiences just for you.</p>
          </div>
          <Link to="/events" className="group flex items-center gap-2 text-black font-bold hover:underline">
            View all events 
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {events.length > 0 ? (
            events.map((ev) => (
              <Link
                key={ev.id}
                to={`/event/${ev.id}`}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 flex flex-col h-full"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={ev.images?.[0] || "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&q=80&w=1000"}
                    alt={ev.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-black shadow-lg">
                    {ev.currency || "NGN"} {ev.price || "Free"}
                  </div>
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      View Details
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-1 rounded-md">
                        {ev.category || "Event"}
                    </span>
                    {ev.start && (
                        <div className="text-xs font-bold text-gray-400 border border-gray-200 px-2 py-1 rounded-md">
                           {new Date(ev.start.seconds * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                    {ev.title}
                  </h3>
                  
                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center text-sm text-gray-500 gap-2">
                     <FaMapMarkerAlt className="text-gray-300" />
                     <span className="truncate">{ev.location || "Online Event"}</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            [...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-3xl border border-gray-100 p-4 h-[400px] flex flex-col">
                 <div className="bg-gray-100 h-48 rounded-2xl mb-4 w-full"></div>
                 <div className="space-y-3 p-2">
                    <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-100 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                 </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-lg">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                  </div>
                  <span className="font-black text-xl tracking-tighter">Eventix</span>
              </div>
              <div className="text-gray-500 text-sm">
                  &copy; {new Date().getFullYear()} Eventix. All rights reserved.
              </div>
              <div className="flex gap-6 text-sm font-bold text-gray-600">
                  <a href="#" className="hover:text-black transition">Privacy</a>
                  <a href="#" className="hover:text-black transition">Terms</a>
                  <a href="#" className="hover:text-black transition">Support</a>
              </div>
          </div>
      </footer>
    </div>
  );
}
