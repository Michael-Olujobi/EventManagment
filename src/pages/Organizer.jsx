import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function Organizer() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const snapshot = await getDocs(collection(db, "events"));
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvents(list);
      } catch (err) {
        console.error("Failed to load events:", err);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  if (loading) return <div>Loading events...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">My Events</h2>
      {events.length === 0 && <p className="text-gray-600">No events yet.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map(event => (
          <div key={event.id} className="border rounded p-4 shadow">
            <h3 className="font-semibold text-lg">{event.title}</h3>
            <p className="text-gray-700 mt-1">{event.description}</p>
            {event.images?.[0] && (
              <img
                src={event.images[0]}
                alt={event.title}
                className="mt-2 h-40 w-full object-cover rounded"
              />
            )}zzz
            <p className="text-gray-500 mt-1">
              Date: {new Date(event.start.seconds * 1000).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
