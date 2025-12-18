// src/pages/Organizer/Orders.jsx
import React, { useEffect, useState } from "react";
import OrganizerLayout from "../../Layout/OrganizerLayout";
import {
  listenOrdersForEvent,
  updateOrderStatus,
  markTokenChecked,
  findOrderByToken
} from "../../services/OrderService";
import { useParams } from "react-router-dom";
import { FaSearch, FaCheck, FaTimes, FaFilter, FaQrcode } from "react-icons/fa";

export default function Orders() {
  const { eventId } = useParams();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [scanningToken, setScanningToken] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!eventId) return;
    const unsub = listenOrdersForEvent(eventId, (orders) => {
      setOrders(orders);
    });
    return () => unsub();
  }, [eventId]);

  function filteredOrders() {
    return orders.filter(o => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (o.id && o.id.toLowerCase().includes(q)) ||
             (o.buyer?.email && o.buyer.email.toLowerCase().includes(q)) ||
             (o.buyer?.name && o.buyer.name.toLowerCase().includes(q));
    });
  }

  async function handleMarkChecked(orderId, token) {
    try {
      await markTokenChecked(orderId, token);
      setMessage({ type: "success", text: "Ticket checked-in" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: err.message || "Failed to mark checked" });
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  }

  async function handleStatusChange(orderId, status) {
    try {
      await updateOrderStatus(orderId, status);
      setMessage({ type: "success", text: "Order updated" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to update order" });
    } finally {
      setTimeout(() => setMessage(null), 2500);
    }
  }

  async function handleTokenLookup() {
    if (!scanningToken) return;
    setMessage({ type: "info", text: "Searching token..." });
    try {
      const order = await findOrderByToken(scanningToken.trim());
      if (!order) {
        setMessage({ type: "error", text: "Token not found" });
      } else {
        setSelected(order);
        setMessage({ type: "success", text: "Token found — showing order" });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Lookup failed" });
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  }

  return (
    <OrganizerLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Orders</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1 font-medium">Manage orders and check-in attendees.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
            <div className="relative w-full sm:w-auto">
                <FaFilter className="absolute left-3 top-3.5 text-gray-400 text-xs" />
                <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none appearance-none text-sm font-bold"
                >
                <option value="all">All Status</option>
                <option value="created">Created</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="checked-in">Checked-in</option>
                <option value="cancelled">Cancelled</option>
                </select>
            </div>
            <div className="relative w-full sm:w-auto">
                <FaSearch className="absolute left-3 top-3.5 text-gray-400 text-xs" />
                <input
                placeholder="Search..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none text-sm font-medium"
                />
            </div>
          </div>
        </div>

        {/* Token scanner */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaQrcode className="text-primary" /> Quick Check-in
          </h3>
          <div className="flex gap-3">
            <input
              placeholder="Enter ticket token..."
              value={scanningToken}
              onChange={e => setScanningToken(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
            <button
              onClick={handleTokenLookup}
              className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-indigo-900 transition"
            >
              Lookup
            </button>
          </div>
          {message && (
            <div className={`mt-3 text-sm font-medium px-4 py-2 rounded-lg ${
                message.type === "error" ? "bg-red-50 text-red-600" :
                message.type === "success" ? "bg-green-50 text-green-600" :
                "bg-blue-50 text-blue-600"
            }`}>
              {message.text}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders list */}
          <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-gray-900">Recent Orders ({filteredOrders().length})</h3>
              
              {filteredOrders().length === 0 ? (
                <div className="bg-white p-10 rounded-2xl text-center border border-gray-100 text-gray-500">
                    No orders found matching your filters.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders().map(o => (
                    <div
                        key={o.id}
                        onClick={() => setSelected(o)}
                        className={`bg-white p-4 rounded-xl border transition cursor-pointer flex justify-between items-center ${
                            selected?.id === o.id ? 'border-primary shadow-md ring-1 ring-primary' : 'border-gray-100 hover:border-gray-300'
                        }`}
                    >
                      <div>
                        <div className="font-bold text-gray-900">{o.buyer?.name || "Unknown"}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{o.buyer?.email}</div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                             <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{o.id.slice(0,8)}...</span>
                             <span>{o.items?.length || 0} items</span>
                             <span className="font-medium text-gray-900">₦{((o.amount||0)/100).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                            o.status === 'paid' ? 'bg-green-100 text-green-700' :
                            o.status === 'checked-in' ? 'bg-blue-100 text-blue-700' :
                            o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                          {o.status}
                        </span>
                        <div className="text-xs text-gray-400">
                            {o.createdAt?.toDate ? o.createdAt.toDate().toLocaleDateString() : "Date N/A"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* Details Sidebar / Overlay */}
          <aside className={`${selected ? 'fixed md:sticky' : 'hidden md:block'} inset-0 md:inset-auto z-50 md:z-0 bg-black/60 md:bg-transparent flex items-end md:items-start p-4 md:p-0`}>
             <div className="bg-white p-6 rounded-3xl shadow-2xl md:shadow-sm border border-gray-100 w-full h-fit sticky top-6 max-h-[90vh] overflow-y-auto no-scrollbar">
            {!selected ? (
              <div className="text-center py-10 text-gray-500">
                <FaSearch className="mx-auto text-3xl mb-3 opacity-20" />
                <p>Select an order to view details.</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selected.buyer?.name}</h2>
                    <p className="text-sm text-gray-500">{selected.buyer?.email}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                    <FaTimes />
                  </button>
                </div>

                <div className="border-t border-b border-gray-100 py-4 my-4 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Order ID</span>
                        <span className="font-mono">{selected.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status</span>
                        <span className="capitalize font-medium">{selected.status}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total</span>
                        <span className="font-bold">₦{((selected.amount||0)/100).toLocaleString()}</span>
                    </div>
                </div>

                <div className="mt-4">
                  <h5 className="font-bold text-gray-900 text-sm mb-3">Tokens & Check-in</h5>
                  <div className="space-y-2">
                    {(selected.qrTokens || []).map((t, i) => (
                      <div key={i} className="flex items-center justify-between border border-gray-100 rounded-lg p-3 bg-gray-50/50">
                        <div>
                          <div className="text-xs font-bold text-gray-700">{t.ticketId}</div>
                          <div className="text-[10px] font-mono text-gray-400 mt-1">{t.token}</div>
                        </div>

                        {t.checked ? (
                            <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                <FaCheck /> Checked
                            </div>
                        ) : (
                            <button
                                onClick={() => handleMarkChecked(selected.id, t.token)}
                                className="text-xs bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-indigo-900 font-medium transition"
                            >
                                Check In
                            </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex gap-2">
                   {selected.status !== 'cancelled' && (
                        <button
                            onClick={() => handleStatusChange(selected.id, 'cancelled')}
                            className="flex-1 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 text-sm font-medium transition"
                        >
                            Cancel Order
                        </button>
                   )}
                   {selected.status !== 'paid' && (
                        <button
                            onClick={() => handleStatusChange(selected.id, 'paid')}
                            className="flex-1 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 text-sm font-bold transition"
                        >
                            Mark Paid
                        </button>
                   )}
                </div>
              </div>
            )}
             </div>
          </aside>
        </div>
      </div>
    </OrganizerLayout>
  );
}
