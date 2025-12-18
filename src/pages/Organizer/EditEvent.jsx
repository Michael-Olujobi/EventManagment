import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import OrganizerLayout from "../../Layout/OrganizerLayout";
import { db } from "../../firebase";
import { FaCalendarAlt, FaImage, FaSave, FaArrowLeft } from "react-icons/fa";

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    category: "",
    status: "draft",
    images: [],
  });

  // Load event info
  useEffect(() => {
    async function loadEvent() {
      try {
        const ref = doc(db, "events", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          alert("Event not found");
          navigate("/dashboard");
          return;
        }

        const data = snap.data();

        setForm({
          ...data,
          start: data.start ? new Date(data.start.seconds * 1000).toISOString().slice(0, 16) : "",
          end: data.end ? new Date(data.end.seconds * 1000).toISOString().slice(0, 16) : "",
          images: data.images || []
        });
        
        if(data.images && data.images.length > 0) {
            setPreview(data.images[0]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Failed to load event", error);
        setLoading(false);
      }
    }

    loadEvent();
  }, [id, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Save Event
  const saveEvent = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateDoc(doc(db, "events", id), {
        ...form,
        start: form.start ? new Date(form.start) : null,
        end: form.end ? new Date(form.end) : null,
      });

      alert("Event updated successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to update event", error);
      alert("Error saving event.");
    }

    setSaving(false);
  };

  if (loading)
    return (
      <OrganizerLayout>
        <div className="flex items-center justify-center h-screen text-gray-500 font-medium">Loading event...</div>
      </OrganizerLayout>
    );

  return (
    <OrganizerLayout>
      <main className="max-w-4xl mx-auto mt-8 px-4 w-full mb-20 animate-fade-in-up">
        
        {/* Header - Minimalist */}
        <div className="mb-8 flex items-center justify-between gap-4">
            <div>
                 <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Edit Event</h2>
                 <p className="text-sm md:text-lg text-gray-500 mt-1 md:mt-2 font-medium">Update your event details and settings.</p>
            </div>
            <button onClick={() => navigate(-1)} className="flex-shrink-0 text-gray-400 hover:text-black transition p-2.5 rounded-full hover:bg-gray-100 bg-gray-50 md:bg-transparent">
                <FaArrowLeft size={18} />
            </button>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-gray-100 ring-1 ring-gray-100">
          <form onSubmit={saveEvent} className="space-y-10">
             
             {/* Main Info */}
             <div className="space-y-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-2">
                       <div className="w-2 h-6 bg-black rounded-full"></div>
                       Event Information
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Event Title</label>
                    <input
                      type="text"
                      name="title"
                      className="w-full border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 focus:shadow-md text-lg bg-gray-50 focus:bg-white"
                      value={form.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Description</label>
                    <textarea
                      name="description"
                      className="w-full border border-gray-200 rounded-xl px-5 py-4 h-40 resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 focus:shadow-md bg-gray-50 focus:bg-white"
                      value={form.description}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Start Date</label>
                        <input
                          type="datetime-local"
                          name="start"
                          className="w-full border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                          value={form.start}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">End Date</label>
                        <input
                          type="datetime-local"
                          name="end"
                          className="w-full border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                          value={form.end}
                          onChange={handleChange}
                        />
                      </div>
                  </div>
             </div>

             {/* Settings */}
             <div className="space-y-6">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-2">
                       <div className="w-2 h-6 bg-black rounded-full"></div>
                       Settings
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Category</label>
                        <select
                          name="category"
                          className="w-full border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                          value={form.category}
                          onChange={handleChange}
                        >
                          <option value="">Select category</option>
                          <option value="concert">Concert</option>
                          <option value="sports">Sports</option>
                          <option value="seminar">Seminar</option>
                          <option value="party">Party</option>
                          <option value="conference">Conference</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Status</label>
                        <select
                          name="status"
                          className="w-full border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                          value={form.status}
                          onChange={handleChange}
                        >
                          <option value="draft">Draft</option>
                          <option value="live">Live</option>
                          <option value="ended">Ended</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                  </div>
                  
                  {/* Image Preview */}
                  <div>
                     <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Event Image</label>
                     {preview ? (
                         <div className="relative h-64 w-full md:w-2/3 rounded-xl overflow-hidden border border-gray-200 group">
                             <img src={preview} alt="Event" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                             <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 backdrop-blur-sm">
                                 <p className="text-white text-sm font-bold bg-black/20 px-4 py-2 rounded-lg backdrop-blur-md">Image editing coming soon</p>
                             </div>
                         </div>
                     ) : (
                         <div className="h-40 w-full md:w-2/3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400">
                             <FaImage size={32} className="mb-2" />
                             <span className="text-sm font-medium">No image uploaded</span>
                         </div>
                     )}
                  </div>
             </div>

             <div className="flex flex-col-reverse sm:flex-row items-center gap-4 justify-end pt-8 border-t border-gray-100">
               <button type="button" onClick={() => navigate(-1)} className="w-full sm:w-auto px-8 py-3.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-xl font-bold transition-all">
                 Cancel
               </button>
               <button 
                 type="submit" 
                 disabled={saving}
                 className="w-full sm:w-auto px-10 py-4 bg-black text-white rounded-xl shadow-xl hover:bg-white hover:text-black hover:ring-2 hover:ring-black transition-all duration-300 font-black disabled:opacity-70 flex items-center justify-center gap-3 transform active:scale-95 text-lg tracking-tight"
               >
                 <FaSave /> {saving ? "Saving..." : "Save Changes"}
               </button>
             </div>

          </form>
        </div>
      </main>
    </OrganizerLayout>
  );
}
