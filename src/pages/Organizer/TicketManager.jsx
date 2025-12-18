import React, { useEffect, useState } from "react";
import OrganizerLayout from "../../Layout/OrganizerLayout";
import {
  getTickets,
  updateTicket,
  deleteTicket,
  createTicket
} from "../../services/TicketService";
import { useParams, useNavigate } from "react-router-dom";
import { FaTicketAlt, FaPlus, FaTrash, FaSave, FaArrowLeft } from "react-icons/fa";

export default function TicketManager() {
  const { id } = useParams(); // eventId
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTicket, setNewTicket] = useState({
    name: "",
    price: "",
    quantity: ""
  });
  const navigate = useNavigate();

  async function loadTickets() {
    setLoading(true);
    const data = await getTickets(id);
    setTickets(data);
    setLoading(false);
  }

  useEffect(() => {
    loadTickets();
  }, []);

  function handleUpdate(ticketId, field, value) {
    const updated = tickets.map(t =>
      t.id === ticketId ? { ...t, [field]: value } : t
    );
    setTickets(updated);
  }

  async function saveTicket(ticket) {
    if (!ticket.name || ticket.price < 0 || ticket.quantity < 1) {
        alert("Please fill all fields correctly.");
        return;
    }
    await updateTicket(id, ticket.id, {
      name: ticket.name,
      price: Number(ticket.price),
      quantity: Number(ticket.quantity)
    });
    alert("Ticket updated!");
    loadTickets();
  }

  async function removeTicket(ticketId) {
    if(!window.confirm("Are you sure? This cannot be undone.")) return;
    await deleteTicket(id, ticketId);
    loadTickets();
  }

  async function addNewTicket() {
    if (!newTicket.name || newTicket.quantity < 1) {
        alert("Please provide a name and valid quantity.");
        return;
    }
    await createTicket(id, {
      ...newTicket,
      price: Number(newTicket.price) || 0,
      quantity: Number(newTicket.quantity)
    });

    setNewTicket({ name: "", price: "", quantity: "" });
    loadTickets();
  }

  return (
    <OrganizerLayout>
      <main className="max-w-5xl mx-auto mt-8 px-4 w-full mb-20 animate-fade-in-up">

        {/* Header - Minimalist */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                 Ticket Manager
              </h2>
              <p className="text-sm md:text-lg text-gray-500 mt-2 font-medium">
                Manage inventory and ticket types.
              </p>
          </div>
          <button onClick={() => navigate(-1)} className="flex-shrink-0 text-gray-400 hover:text-black transition p-2.5 rounded-full hover:bg-gray-100 bg-gray-50 md:bg-transparent self-start md:self-auto">
               <FaArrowLeft size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: List */}
            <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                   <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                       <span className="bg-black text-white text-xs px-2 py-1 rounded-md">{tickets.length}</span>
                       Active Tickets
                   </h3>
                </div>
                
                {loading ? (
                    <div className="space-y-4">
                        {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse"></div>)}
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                           <FaTicketAlt className="text-gray-300 text-3xl" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900">No tickets yet</h4>
                        <p className="text-gray-500 mt-1">Create your first ticket type to get started.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {tickets.map(ticket => (
                           <div key={ticket.id} className="bg-white p-6 rounded-3xl shadow-lg shadow-gray-100 ring-1 ring-gray-100 hover:shadow-xl transition-all duration-300 group">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                                    <div className="md:col-span-1 hidden md:flex items-center justify-center h-12">
                                        <FaTicketAlt className="text-gray-300 text-xl" />
                                    </div>
                                    <div className="md:col-span-4">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Name</label>
                                        <input
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                            value={ticket.name}
                                            onChange={e => handleUpdate(ticket.id, "name", e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Price (₦)</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                            value={ticket.price}
                                            onChange={e => handleUpdate(ticket.id, "price", e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Qty</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                            value={ticket.quantity}
                                            onChange={e => handleUpdate(ticket.id, "quantity", e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex items-center justify-end gap-2 pb-1">
                                        <button 
                                            onClick={() => saveTicket(ticket)}
                                            className="p-3 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-colors"
                                            title="Save Changes"
                                        >
                                            <FaSave size={18} />
                                        </button>
                                        <button 
                                            onClick={() => removeTicket(ticket.id)}
                                            className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                            title="Delete Ticket"
                                        >
                                            <FaTrash size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-3 text-xs font-bold uppercase tracking-wide border-t border-gray-50 pt-4">
                                   <div className={`flex items-center gap-1.5 ${ticket.quantity_sold >= ticket.quantity ? 'text-red-500' : 'text-green-600'}`}>
                                       <span className={`w-2 h-2 rounded-full ${ticket.quantity_sold >= ticket.quantity ? 'bg-red-500' : 'bg-green-600'}`}></span>
                                       Status: {ticket.quantity_sold >= ticket.quantity ? 'Sold Out' : 'Active'}
                                   </div>
                                   <span className="text-gray-300">|</span>
                                   <span className="text-gray-500">{ticket.quantity_sold || 0} sold</span>
                                </div>
                           </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Right Column: Add New */}
            <div className="order-first lg:order-last">
                 <div className="bg-black text-white p-6 md:p-8 rounded-3xl shadow-2xl lg:sticky lg:top-24">
                     <h3 className="text-xl md:text-2xl font-black mb-6 border-b border-gray-800 pb-4 flex items-center gap-2">
                         <FaPlus className="text-xs" /> Add Ticket
                     </h3>
                     <div className="space-y-5">
                        <div>
                           <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Ticket Name</label>
                           <input
                             className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white transition-all"
                             placeholder="e.g. VIP Access"
                             value={newTicket.name}
                             onChange={e => setNewTicket({...newTicket, name: e.target.value})}
                           />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                               <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Price</label>
                               <input
                                 type="number"
                                 className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white transition-all"
                                 placeholder="0"
                                 value={newTicket.price}
                                 onChange={e => setNewTicket({...newTicket, price: e.target.value})}
                               />
                            </div>
                            <div>
                               <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Qty</label>
                               <input
                                 type="number"
                                 className="w-full p-4 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white transition-all"
                                 placeholder="100"
                                 value={newTicket.quantity}
                                 onChange={e => setNewTicket({...newTicket, quantity: e.target.value})}
                               />
                            </div>
                        </div>
                        <button 
                            onClick={addNewTicket}
                            className="w-full py-4 bg-white text-black rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 mt-4"
                        >
                            <FaPlus size={14} /> Create Ticket
                        </button>
                     </div>
                 </div>
            </div>

        </div>
      </main>
    </OrganizerLayout>
  );
}
