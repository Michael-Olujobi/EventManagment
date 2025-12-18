import React, {useEffect, useState} from 'react'
import { auth, db } from '../firebase'
import { collection, query, where, getDocs } from 'firebase/firestore'
import Navbar from '../components/Navbar'

// Note: To avoid importing a QR rendering library that may break in some bundlers,
// we generate a stable QR image URL using a public API (api.qrserver.com).
// This is reliable for development and demo purposes.

export default function MyTickets(){
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(()=>{
        async function load(){
            if(!auth.currentUser) return
            try{
                const q = query(collection(db,'orders'), where('userId','==', auth.currentUser.uid))
                const snap = await getDocs(q)
                // In a real app, we would fetch event details for each order to display title/date
                // For now, we will display the Order ID and simulated event details
                setTickets(snap.docs.map(d=>({id:d.id,...d.data()})))
            }catch(err){
                console.error('Failed to load orders', err)
                setTickets([])
            } finally {
                setLoading(false)
            }
        }
        load()
    },[])

    function qrImageUrl(value, size=200){
        return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`
    }

    const downloadTicket = () => {
        alert("Downloading ticket... (Feature simulation)")
    }

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 py-12">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">My Tickets</h2>
                    <span className="bg-black text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        {tickets.length} Active
                    </span>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1,2].map(i => <div key={i} className="h-48 bg-gray-200 rounded-xl animate-pulse"></div>)}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {tickets.length > 0 ? tickets.map(o => (
                            <div key={o.id} className="relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row group">
                                {/* Left Side: Event Info */}
                                <div className="flex-1 p-6 md:p-8 flex flex-col justify-between relative border-b md:border-b-0 md:border-r border-dashed border-gray-200">
                                    {/* Perforation circles */}
                                    <div className="absolute -right-3 top-0 bottom-0 flex flex-col justify-between py-2 hidden md:flex">
                                       <div className="w-6 h-6 rounded-full bg-gray-100 -mt-5"></div>
                                       <div className="w-6 h-6 rounded-full bg-gray-100 -mb-5"></div>
                                    </div>

                                    <div>
                                        <div className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded mb-4 uppercase tracking-wider">
                                            Confirmed
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 mb-2">Event Ticket</h3>
                                        <p className="text-gray-500 font-medium">Order #{o.id.slice(0, 8).toUpperCase()}</p>
                                        
                                        <div className="mt-6 flex gap-8 text-sm">
                                            <div>
                                                <span className="block text-gray-400 text-xs font-bold uppercase mb-1">Date</span>
                                                <span className="font-bold text-gray-900">Oct 24, 2025</span>
                                            </div>
                                            <div>
                                                <span className="block text-gray-400 text-xs font-bold uppercase mb-1">Time</span>
                                                <span className="font-bold text-gray-900">18:00 PM</span>
                                            </div>
                                            <div>
                                                <span className="block text-gray-400 text-xs font-bold uppercase mb-1">Items</span>
                                                <span className="font-bold text-gray-900">{o.items?.length || 1} Ticket(s)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                                        <button 
                                            onClick={downloadTicket}
                                            className="w-full sm:flex-1 bg-black text-white font-black py-4 rounded-xl hover:bg-gray-800 transition shadow-xl text-sm tracking-tight active:scale-95"
                                        >
                                            Download Ticket
                                        </button>
                                        <button className="w-full sm:w-auto px-6 py-4 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 font-bold text-sm active:scale-95 transition-all">
                                            Share
                                        </button>
                                    </div>
                                </div>

                                {/* Right Side: QR Code */}
                                <div className="w-full md:w-64 bg-gray-50 p-8 flex flex-col items-center justify-center relative">
                                     <div className="w-6 h-6 rounded-full bg-gray-100 absolute -left-3 -top-3 md:hidden"></div>
                                     <div className="w-6 h-6 rounded-full bg-gray-100 absolute -left-3 -bottom-3 md:hidden"></div>
                                    
                                    <div className="bg-white p-3 rounded-xl shadow-sm">
                                        <img src={qrImageUrl(o.id, 150)} alt="Ticket QR" className="w-32 h-32 object-contain mix-blend-multiply" />
                                    </div>
                                    <p className="mt-4 text-xs text-gray-400 text-center font-mono">Scan at entrance</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 text-2xl">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">No tickets found</h3>
                                <p className="text-gray-500 mt-2">You haven't purchased any tickets yet.</p>
                                <a href="/" className="inline-block mt-6 text-black font-bold hover:underline">Browse Events</a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}