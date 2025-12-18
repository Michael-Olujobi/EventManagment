import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db, auth } from "../../firebase";
import OrganizerLayout from "../../Layout/OrganizerLayout";
import { FaCalendarAlt, FaTicketAlt, FaMoneyBillWave, FaChartLine, FaEllipsisH, FaPlus } from "react-icons/fa";
import { doc, updateDoc } from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

export default function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({ revenue: 0, ticketsSold: 0, activeEvents: 0 });
  const [activeMenu, setActiveMenu] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth state changes to handle page refreshes
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const q = query(
          collection(db, "events"),
          where("organizerId", "==", user.uid)
        );

        const unsubEvents = onSnapshot(
          q,
          (snap) => {
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            const now = new Date().getTime();

            // 1. Sync expired events to Firestore (Lazy Update)
            data.forEach(async (ev) => {
                const endTime = ev.end ? new Date(ev.end.seconds * 1000).getTime() : 
                                ev.start ? new Date(ev.start.seconds * 1000 + 86400000).getTime() : null;
                const isEnded = endTime ? now > endTime : false;

                if (isEnded && ev.status === 'live') {
                    try {
                        await updateDoc(doc(db, "events", ev.id), { status: 'ended' });
                    } catch (err) {
                        console.error("Failed to sync event status", ev.id, err);
                    }
                }
            });

            // 2. Calculate stats accurately
            const totalRevenue = data.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
            const totalTickets = data.reduce((acc, curr) => acc + (curr.ticketsSold || 0), 0);
            const active = data.filter(e => {
                const endTime = e.end ? new Date(e.end.seconds * 1000).getTime() : 
                                e.start ? new Date(e.start.seconds * 1000 + 86400000).getTime() : null;
                const isPast = endTime ? now > endTime : false;
                return e.status === 'live' && !isPast;
            }).length;

            setStats({
                revenue: totalRevenue,
                ticketsSold: totalTickets,
                activeEvents: active
            });

            // Client-side sort
            data.sort((a, b) => {
                const dateA = a.created?.seconds || 0;
                const dateB = b.created?.seconds || 0;
                return dateB - dateA;
            });

            setEvents(data);
          },
          (err) => console.error("Events listener error", err)
        );
        
        return () => unsubEvents(); // Cleanup events listener when auth changes or unmount
      } else {
        setEvents([]);
        setStats({ revenue: 0, ticketsSold: 0, activeEvents: 0 });
      }
    });

    return () => unsubAuth(); // Cleanup auth listener
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const filteredEvents = events.filter((ev) => {
    // Treat as "ended" if current time > end date (if it exists)
    // Fallback: If no end date, assume ended 24 hours after start date
    const now = new Date().getTime();
    const endTime = ev.end ? new Date(ev.end.seconds * 1000).getTime() : 
                    ev.start ? new Date(ev.start.seconds * 1000 + 86400000).getTime() : null; // +24 hours
                    
    const isEnded = endTime ? now > endTime : false;
    
    if (filter === "all") return true; 
    
    if (filter === "ended") {
      // Show event if it is explicitly marked ended OR if time has passed
      return ev.status === "ended" || isEnded;
    }
    
    if (filter === "live") {
      // Show only if status is live AND NOT ended
      return ev.status === "live" && !isEnded;
    }

    return ev.status === filter;
  });

  return (
    <OrganizerLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1 font-medium">Welcome back, here's your event performance.</p>
          </div>
          <Link
            to="/organizer/create"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-8 py-3.5 rounded-2xl font-black shadow-xl hover:bg-white hover:text-black hover:ring-2 hover:ring-black transition-all duration-300 text-sm tracking-wide uppercase"
          >
            <FaPlus /> Create Event
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-primary rounded-xl">
              <FaMoneyBillWave size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-black text-gray-900">₦{stats.revenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 text-accent rounded-xl">
              <FaTicketAlt size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tickets Sold</p>
              <p className="text-2xl font-black text-gray-900">{stats.ticketsSold.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <FaChartLine size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Events</p>
              <p className="text-2xl font-black text-gray-900">{stats.activeEvents}</p>
            </div>
          </div>
        </div>

        {/* Events Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center border-b border-gray-100 p-2 gap-2 overflow-x-auto bg-gray-50">
            {["all", "live", "draft", "ended"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-5 py-2 text-sm font-bold rounded-lg capitalize whitespace-nowrap transition-all duration-200 ${
                  filter === tab
                    ? "bg-primary text-white shadow-md transform scale-105"
                    : "text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] md:text-xs text-gray-500 uppercase tracking-widest">
                  <th className="px-4 md:px-6 py-4 font-bold">Event</th>
                  <th className="px-4 md:px-6 py-4 font-bold">Date</th>
                  <th className="px-4 md:px-6 py-4 font-bold">Status</th>
                  <th className="px-4 md:px-6 py-4 font-bold">Sold</th>
                  <th className="px-4 md:px-6 py-4 font-bold text-right">Revenue</th>
                  <th className="px-2 md:px-6 py-4 font-bold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-gray-50 transition group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                             {ev.images?.[0] ? (
                               <img src={ev.images[0]} alt="" className="h-full w-full object-cover" />
                             ) : (
                               <div className="h-full w-full flex items-center justify-center text-gray-400">
                                 <FaCalendarAlt />
                               </div>
                             )}
                           </div>
                           <div>
                             <p className="font-bold text-gray-900 line-clamp-1">{ev.title}</p>
                             <p className="text-xs text-gray-500">{ev.category || "General"}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {ev.start ? new Date(ev.start.seconds * 1000).toLocaleDateString() : "TBA"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                          ev.status === "live" ? "bg-green-100 text-green-700" :
                          ev.status === "draft" ? "bg-gray-100 text-gray-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {ev.status || "Draft"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {ev.ticketsSold || 0} / {ev.capacity || "∞"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                        ₦{(ev.revenue || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === ev.id ? null : ev.id);
                          }}
                          className={`transition p-2 rounded-full hover:bg-gray-100 ${activeMenu === ev.id ? 'text-primary bg-gray-50' : 'text-gray-400'}`}
                        >
                          <FaEllipsisH />
                        </button>
                        
                        {activeMenu === ev.id && (
                          <div className="absolute right-4 top-12 bg-white shadow-2xl border border-gray-100 rounded-2xl flex flex-col z-50 w-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                             <Link 
                               to={`/organizer/edit/${ev.id}`} 
                               className="px-5 py-3 hover:bg-gray-50 text-left text-sm font-bold text-gray-700 flex items-center gap-3 transition-colors"
                             >
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                Edit Event
                             </Link>
                             <Link 
                               to={`/organizer/tickets/${ev.id}`} 
                               className="px-5 py-3 hover:bg-gray-50 text-left text-sm font-bold text-gray-700 flex items-center gap-3 border-t border-gray-50 transition-colors"
                             >
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                Manage Tickets
                             </Link>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <FaCalendarAlt size={32} className="opacity-20" />
                        <p>No events found in this category.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </OrganizerLayout>
  );
}
