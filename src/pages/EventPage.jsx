import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { FaCalendarAlt, FaMapMarkerAlt, FaShareAlt, FaTicketAlt, FaMinus, FaPlus, FaArrowLeft } from 'react-icons/fa'
import Navbar from '../components/Navbar'

export default function EventPage() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [tickets, setTickets] = useState([])
  const [selected, setSelected] = useState({})
  const [loading, setLoading] = useState(true)
  const [isEnded, setIsEnded] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // realtime subscriptions for event and its tickets
    if (!id) return;

    const evRef = doc(db, 'events', id)
    const unsubEvent = onSnapshot(evRef, (snap) => {
      if (snap.exists()) {
          const data = snap.id ? { id: snap.id, ...snap.data() } : null;
          setEvent(data)
          
          if (data) {
              const now = new Date().getTime();
              const endTime = data.end ? new Date(data.end.seconds * 1000).getTime() : 
                              data.start ? new Date(data.start.seconds * 1000 + 86400000).getTime() : null;
              setIsEnded(endTime ? now > endTime : false);
          }
      } else {
        console.log('Event not found')
        navigate('/')
      }
      setLoading(false)
    }, (err) => {
        console.error('event listener', err);
        setLoading(false);
    })

    const ticketsCol = collection(db, 'events', id, 'tickets')
    const unsubTickets = onSnapshot(ticketsCol, (snap) => {
      setTickets(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }, (err) => console.error('tickets listener', err))

    return () => {
      unsubEvent()
      unsubTickets()
    }
  }, [id, navigate])

  function changeQty(ticketId, delta) {
    setSelected(prev => {
        const currentQty = prev[ticketId] || 0;
        const newQty = Math.max(0, currentQty + delta);
        
        // check availability
        const t = tickets.find(x => x.id === ticketId);
        if(!t) return prev;
        
        const available = Math.max(0, (t.quantity_total || 0) - (t.quantity_sold || 0));
        if (newQty > available) return prev;

        return { ...prev, [ticketId]: newQty }
    })
  }

  async function startCheckout() {
    const orderItems = Object.entries(selected)
      .filter(([_, qty]) => qty > 0)
      .map(([ticketId, qty]) => ({ ticketId, qty }))

    if (orderItems.length === 0) {
      alert('Please select at least one ticket.')
      return
    }

    try {
      let total = 0
      const itemsDetailed = orderItems.map(({ ticketId, qty }) => {
        const t = tickets.find(x => x.id === ticketId)
        const price = t ? Number(t.price || 0) : 0
        total += price * qty
        return { ticketId, qty, name: t?.name || '', price }
      })
      
      const totalInCents = total * 100;
      const itemsInCents = itemsDetailed.map(i => ({...i, price: i.price * 100}));

      const orderRef = await addDoc(collection(db, 'orders'), {
        eventId: id,
        items: itemsInCents,
        total: totalInCents,
        currency: itemsDetailed[0]?.currency || 'NGN',
        createdAt: serverTimestamp(),
        status: 'pending',
      })

      navigate(`/checkout/${orderRef.id}`)
    } catch (err) {
      console.error('Failed to create order', err)
      alert('Failed to create order. Please try again.')
    }
  }
  
  const totalSelected = useMemo(() => {
    let total = 0
    let count = 0
    Object.entries(selected).forEach(([ticketId, qty]) => {
      const t = tickets.find(x => x.id === ticketId)
      const price = t ? Number(t.price || 0) : 0
      total += price * qty
      count += qty
    })
    return { total, count }
  }, [selected, tickets])

  const formatMoney = (amount) => {
    return `₦${amount.toLocaleString()}`;
  }

  if (loading) return (
      <div className="flex justify-center items-center min-h-screen bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
  );

  if (!event) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {/* Hero Image */}
      <div className="h-[40vh] md:h-[50vh] relative w-full bg-gray-900 group overflow-hidden">
         {event.images?.[0] ? (
             <img 
                src={event.images[0]} 
                alt={event.title} 
                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 ease-in-out" 
            />
         ) : (
             <div className="w-full h-full flex items-center justify-center text-white/10">
                 <FaCalendarAlt size={100} />
             </div>
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
         
         <div className="absolute top-4 md:top-8 left-4 md:left-8 z-20">
             <button onClick={() => navigate(-1)} className="text-white/80 hover:text-white flex items-center gap-2 font-bold backdrop-blur-md bg-white/10 px-4 py-2 rounded-full transition-all hover:bg-white/20 text-sm md:text-base">
                 <FaArrowLeft /> Back
             </button>
         </div>

         <div className="absolute bottom-0 left-0 w-full p-4 md:p-12 z-20">
            <div className="max-w-6xl mx-auto">
                <span className={`inline-block px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2 md:mb-4 border ${
                    isEnded ? 'bg-red-500 text-white border-red-500' : 
                    event.status === 'live' ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white/30'
                }`}>
                    {isEnded ? 'Event Ended' : event.status || 'Draft'}
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-6xl font-black text-white mb-3 md:mb-4 tracking-tighter leading-tight max-w-4xl">
                    {event.title}
                </h1>
                
                <div className="flex flex-col md:flex-row gap-6 text-white/80 text-sm md:text-base font-medium">
                    <div className="flex items-center gap-3">
                        <FaCalendarAlt className="text-white" />
                        <span>
                            {event.start?.seconds 
                                ? new Date(event.start.seconds * 1000).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' }) 
                                : event.start ? new Date(event.start).toLocaleString() : 'Date TBA'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaMapMarkerAlt className="text-white" />
                        <span>{event.location || "Location TBA"}</span>
                    </div>
                </div>
            </div>
         </div>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Main Content */}
            <div className="flex-1 space-y-12">
                <div className="prose prose-lg max-w-none">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">About this event</h3>
                    <div className="text-gray-600 leading-relaxed whitespace-pre-wrap font-serif text-lg">
                        {event.description || "No description provided."}
                    </div>
                </div>
            </div>

            {/* Sidebar / Tickets */}
            <div className="w-full lg:w-[400px] flex-shrink-0">
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 sticky top-24 border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Tickets</h3>
                        <FaTicketAlt className="text-gray-300 text-2xl" />
                    </div>

                    <div className="space-y-6 mb-8">
                        {tickets.length > 0 ? tickets.map(t => {
                            const available = Math.max(0, (t.quantity_total || 0) - (t.quantity_sold || 0));
                            const isSoldOut = available === 0;
                            const currentQty = selected[t.id] || 0;

                            return (
                                <div key={t.id} className={`group relative transition-all duration-300 ${isSoldOut ? 'opacity-50 grayscale' : ''}`}>
                                    <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                                        currentQty > 0 
                                            ? 'border-black bg-gray-50' 
                                            : 'border-gray-100 hover:border-gray-300'
                                    }`}>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="font-bold text-lg text-gray-900 group-hover:text-black transition-colors">{t.name}</p>
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">
                                                    {isSoldOut ? 'Sold Out' : `${available} remaining`}
                                                </p>
                                            </div>
                                            <p className="font-black text-lg text-gray-900">
                                                {t.is_free ? 'Free' : formatMoney(Number(t.price || 0))}
                                            </p>
                                        </div>
                                        
                                        {!isSoldOut && (
                                            <div className="flex items-center justify-between bg-white rounded-xl p-1 border border-gray-100 shadow-sm">
                                                <button
                                                    onClick={() => changeQty(t.id, -1)}
                                                    disabled={currentQty === 0}
                                                    className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                                                >
                                                    <FaMinus size={12} />
                                                </button>
                                                <span className="font-bold text-gray-900 w-8 text-center">{currentQty}</span>
                                                <button
                                                    onClick={() => changeQty(t.id, 1)}
                                                    disabled={currentQty >= available}
                                                    className="w-10 h-10 flex items-center justify-center rounded-lg text-black bg-gray-50 hover:bg-gray-200 disabled:opacity-30 transition-colors"
                                                >
                                                    <FaPlus size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        }) : (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <p className="text-gray-500 font-medium">No tickets available yet.</p>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-500 font-medium">Total</span>
                            <span className="text-3xl font-black text-gray-900 tracking-tighter">{formatMoney(totalSelected.total)}</span>
                        </div>
                        <button
                            onClick={startCheckout}
                            disabled={totalSelected.count === 0 || isEnded}
                            className={`w-full py-4 rounded-xl font-bold text-lg shadow-xl shadow-black/5 transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 ${
                                (totalSelected.count === 0 || isEnded) 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-black text-white hover:bg-gray-900 hover:-translate-y-1'
                            }`}
                        >
                            {isEnded ? 'Event Ended' : totalSelected.count === 0 ? 'Select Tickets' : `Get ${totalSelected.count} Ticket${totalSelected.count > 1 ? 's' : ''}`}
                        </button>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  )
}
