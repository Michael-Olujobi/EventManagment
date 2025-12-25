import React, { useState } from 'react'
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore'
import { db, auth } from '../../firebase'
import { useNavigate } from 'react-router-dom'
import OrganizerLayout from '../../Layout/OrganizerLayout'
import { FaPlus, FaTrash, FaImage, FaTicketAlt } from 'react-icons/fa'

export default function CreateEvent() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const [location, setLocation] = useState('')

  const [tickets, setTickets] = useState([
    { name: 'General Admission', price: 0, currency: 'NGN', quantity_total: 100, is_free: false }
  ])

  const navigate = useNavigate()

  // ⭐ Upload to ImgBB
  async function uploadToImgBB(file) {
    const formData = new FormData()
    formData.append("image", file)

    const res = await fetch(
      "https://api.imgbb.com/1/upload?key=5c96460dbce35dbdb36e2e26b2dad63e",
      { method: "POST", body: formData }
    )

    const data = await res.json()
    return data.data.url
  }

  // ⭐ Image preview
  function handleImageChange(e) {
    const file = e.target.files?.[0]
    setImage(file)

    if (file) {
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result)
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }
  }

  // ⭐ Ticket handlers
  function handleTicketChange(index, field, value) {
    setTickets(prev => {
      const updated = [...prev]
      updated[index][field] = field === 'price' || field === 'quantity_total' ? Number(value) : value
      if (field === 'is_free') {
        updated[index].price = value ? 0 : updated[index].price
      }
      return updated
    })
  }

  function addTicket() {
    setTickets(prev => [...prev, { name: '', price: 0, currency: 'NGN', quantity_total: 100, is_free: false }])
  }

  function removeTicket(index) {
    if (tickets.length === 1) return;
    setTickets(prev => prev.filter((_, i) => i !== index));
  }

  async function submit(e) {
    e.preventDefault();
    if (!auth.currentUser) {
      alert("You must be logged in to create an event.");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;
      if (image) imageUrl = await uploadToImgBB(image);

      // Calculate min price
      const paidTickets = tickets.filter(t => !t.is_free && t.price > 0);
      const minPrice = paidTickets.length > 0 ? Math.min(...paidTickets.map(t => t.price)) : 0;
      const currency = tickets[0]?.currency || 'NGN';
      // 1. Create Event Doc
      const eventRef = await addDoc(collection(db, "events"), {
        title,
        description,
        images: imageUrl ? [imageUrl] : [],
        start: new Date(start),
        end: new Date(end),
        status: "live",
        location: isOnline ? "Online Event" : location,
        isOnline,
        minPrice,
        currency,
        organizerId: auth.currentUser.uid, // ✅ Added for dashboard filtering
        createdAt: new Date(),
        revenue: 0,
        ticketsSold: 0,
      });

      // 2. Add Tickets to Subcollection
      const ticketPromises = tickets.map(t => 
        addDoc(collection(db, "events", eventRef.id, "tickets"), {
          ...t,
          quantity_sold: 0
        })
      );
      
      await Promise.all(ticketPromises);

      // 3. Update event with aggregate capacity (optional but helpful)
      const totalCapacity = tickets.reduce((acc, t) => acc + t.quantity_total, 0);
      await updateDoc(doc(db, "events", eventRef.id), {
        capacity: totalCapacity
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }


  return (
    <OrganizerLayout>

      <main className="max-w-4xl mx-auto mt-8 px-4 w-full mb-20 animate-fade-in-up">
        {/* Header - Minimalist */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Create Event</h2>
          <p className="text-gray-500 mt-2 text-base md:text-lg font-medium">Launch your next experience.</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 ring-1 ring-gray-100">
          <form onSubmit={submit} className="space-y-10">

            {/* Event Details Section */}
            <div className="space-y-6">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 flex items-center gap-2">
                 <div className="w-2 h-6 bg-black rounded-full"></div>
                 Event Details
              </h3>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Event Title</label>
                  <input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Lagos Tech Fest 2025"
                    className="w-full border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 focus:shadow-md text-lg bg-gray-50 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Tell people what your event is about..."
                    className="w-full border border-gray-200 rounded-xl px-5 py-4 h-40 resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 focus:shadow-md bg-gray-50 focus:bg-white"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isOnline}
                        onChange={e => setIsOnline(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                      />
                      <span className="font-bold text-gray-700">This is an online event</span>
                    </label>
                  </div>

                  {!isOnline && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Location / Venue</label>
                      <input
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="e.g. Landmark Centre, Victoria Island, Lagos"
                        className="w-full border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 focus:shadow-md text-lg bg-gray-50 focus:bg-white"
                        required={!isOnline}
                      />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Start Date & Time</label>
                    <input
                      value={start}
                      onChange={e => setStart(e.target.value)}
                      type="datetime-local"
                      className="w-full border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">End Date & Time</label>
                    <input
                      value={end}
                      onChange={e => setEnd(e.target.value)}
                      type="datetime-local"
                      className="w-full border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Cover Image</label>
                    <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group ${preview ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-black hover:bg-gray-50'}`}>
                      <label className="cursor-pointer w-full h-full flex flex-col items-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                         {preview ? (
                           <div className="relative w-full">
                               <img src={preview} alt="Preview" className="h-64 w-full object-cover rounded-xl shadow-lg" />
                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl text-white font-bold">Change Image</div>
                           </div>
                         ) : (
                           <>
                             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                <FaImage className="text-gray-400 text-2xl group-hover:text-black transition-colors" />
                             </div>
                             <span className="text-base font-medium text-gray-600 group-hover:text-black">Click to upload cover image</span>
                             <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                           </>
                         )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tickets Section */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-100 pb-4 gap-4">
                 <h3 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                     <div className="w-2 h-6 bg-black rounded-full"></div>
                     Tickets
                 </h3>
                 <button type="button" onClick={addTicket} className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm px-4 py-2.5 border border-black text-black font-bold rounded-full hover:bg-black hover:text-white transition-all active:scale-95 duration-200">
                   <FaPlus size={12} /> Add Ticket Type
                 </button>
              </div>

              <div className="space-y-4">
                {tickets.map((t, i) => (
                  <div key={i} className="relative grid grid-cols-1 md:grid-cols-12 gap-6 items-start bg-gray-50 p-6 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow duration-300">
                    <div className="md:col-span-1 flex items-center justify-center text-gray-300 md:mt-3">
                      <FaTicketAlt className="text-2xl" />
                    </div>
                    
                    <div className="md:col-span-5">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ticket Name</label>
                      <input
                        placeholder="e.g. VIP Admission"
                        value={t.name}
                        onChange={e => handleTicketChange(i, 'name', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Price (₦)</label>
                       <input
                        type="number"
                        placeholder="0"
                        value={t.price}
                        onChange={e => handleTicketChange(i, 'price', e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
                        disabled={t.is_free}
                        min={0}
                      />
                    </div>

                    <div className="md:col-span-2">
                       <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Quantity</label>
                       <input
                        type="number"
                        placeholder="100"
                        value={t.quantity_total}
                        onChange={e => handleTicketChange(i, 'quantity_total', e.target.value)}
                         className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
                        min={1}
                      />
                    </div>

                    <div className="md:col-span-2 flex flex-col items-end gap-3 justify-center h-full pt-6">
                      <label className="flex items-center gap-2 text-sm cursor-pointer select-none group">
                        <input
                          type="checkbox"
                          checked={t.is_free}
                          onChange={e => handleTicketChange(i, 'is_free', e.target.checked)}
                          className="rounded text-black focus:ring-black"
                        />
                        <span className="font-bold text-gray-600 group-hover:text-black transition-colors">Free</span>
                      </label>
                      
                      {tickets.length > 1 && (
                         <button 
                            type="button" 
                            onClick={() => removeTicket(i)} 
                            className="text-gray-400 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                            title="Remove ticket"
                         >
                            <FaTrash size={14} />
                         </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center gap-4 justify-end pt-8 border-t border-gray-100">
              <button type="button" onClick={() => navigate(-1)} className="w-full sm:w-auto px-8 py-3.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-xl font-bold transition-all">
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full sm:w-auto px-10 py-4 bg-black text-white rounded-xl shadow-xl hover:bg-white hover:text-black hover:ring-2 hover:ring-black transition-all duration-300 text-lg font-black tracking-tight disabled:opacity-70 flex items-center justify-center gap-3 transform active:scale-95"
              >
                {loading ? "Creating..." : <><FaPlus /> Publish Event</>}
              </button>
            </div>
          </form>
        </div>
      </main>

    </OrganizerLayout>
  )
}
