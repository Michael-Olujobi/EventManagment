// src/Pages/EventPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function EventPage() {
  const { id } = useParams(); // get the :id from the route
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const docRef = doc(db, "events", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setEvent(docSnap.data());
        } else {
          console.log("No such event!");
        }
      } catch (err) {
        console.error("Error fetching event:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  if (loading) return <div>Loading event...</div>;
  if (!event) return <div>Event not found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded shadow">
      <h1 className="text-2xl font-bold">{event.title}</h1>
      <p className="text-gray-600">{event.description}</p>
      <p className="mt-2 font-semibold">
        Starts at: {event.start?.toDate ? event.start.toDate().toString() : event.start}
      </p>
      {event.images && event.images.length > 0 && (
        <img src={event.images[0]} alt={event.title} className="mt-4 rounded" />
      )}
    </div>
  );
}
