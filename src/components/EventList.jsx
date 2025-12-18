// src/components/EventList.jsx
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";

export default function EventList({limitCount=12}) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    async function fetchEvents() {
      const q = query(collection(db, "events"), where("status", "==", "live"), orderBy("start"), limit(limitCount));
      const snap = await getDocs(q);
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    fetchEvents();
  }, [limitCount]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {events.map(ev => (
        <Link to={`/event/${ev.id}`} key={ev.id} className="block p-4 rounded shadow hover:shadow-md">
          <img src={ev.images?.[0] || "/placeholder.jpg"} alt={ev.title} className="w-full h-40 object-cover rounded" />
          <h3 className="mt-2 text-lg font-semibold">{ev.title}</h3>
          <p className="text-sm text-gray-500">{new Date(ev.start.seconds * 1000).toLocaleString()}</p>
        </Link>
      ))}
    </div>
  );
}
