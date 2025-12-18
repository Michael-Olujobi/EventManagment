import React, { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../firebase";
import OrganizerLayout from "../../Layout/OrganizerLayout";
import { FaTags, FaPlus, FaTrash, FaSpinner } from "react-icons/fa";

export default function Discounts() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newDiscount, setNewDiscount] = useState({
    code: "",
    type: "percentage", // or 'fixed'
    value: 0,
    limit: 100,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "discounts"),
      where("organizerId", "==", auth.currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      setDiscounts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setSubmitting(true);

    try {
      await addDoc(collection(db, "discounts"), {
        ...newDiscount,
        value: Number(newDiscount.value),
        limit: Number(newDiscount.limit),
        used: 0,
        organizerId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      });
      setShowModal(false);
      setNewDiscount({ code: "", type: "percentage", value: 0, limit: 100 });
    } catch (err) {
      console.error("Failed to create discount", err);
      alert("Error creating discount");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this discount code?")) return;
    try {
      await deleteDoc(doc(db, "discounts", id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  return (
    <OrganizerLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Discounts</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1 font-medium">Manage promo codes for your events.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-black hover:bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-black shadow-xl transition transform active:scale-95"
          >
            <FaPlus className="text-xs" /> Create Discount
          </button>
        </div>

        {/* Discounts List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading discounts...</div>
          ) : discounts.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="bg-indigo-50 p-4 rounded-full mb-4">
                <FaTags className="text-primary text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No discounts yet</h3>
              <p className="text-gray-500 max-w-sm mt-2">
                Create your first discount code to boost ticket sales.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] md:text-xs text-gray-500 uppercase tracking-widest">
                  <th className="px-4 md:px-6 py-4 font-bold">Code</th>
                  <th className="px-4 md:px-6 py-4 font-bold">Discount</th>
                  <th className="px-4 md:px-6 py-4 font-bold">Usage</th>
                  <th className="px-4 md:px-6 py-4 font-bold">Limit</th>
                  <th className="px-4 md:px-6 py-4 font-bold text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {discounts.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-primary bg-indigo-50 px-2 py-1 rounded">
                        {d.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {d.type === "percentage" ? `${d.value}% OFF` : `₦${d.value} OFF`}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {d.used} <span className="text-xs text-gray-400">used</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {d.limit}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="text-red-500 hover:text-red-700 p-2 transition"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all">
              <h2 className="text-xl font-bold mb-4">Create New Discount</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EARLYBIRD"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent uppercase"
                    value={newDiscount.code}
                    onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary"
                      value={newDiscount.type}
                      onChange={(e) => setNewDiscount({ ...newDiscount, type: e.target.value })}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₦)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary"
                      value={newDiscount.value}
                      onChange={(e) => setNewDiscount({ ...newDiscount, value: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary"
                    value={newDiscount.limit}
                    onChange={(e) => setNewDiscount({ ...newDiscount, limit: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-indigo-900 transition flex justify-center items-center"
                  >
                    {submitting ? <FaSpinner className="animate-spin" /> : "Create Code"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </OrganizerLayout>
  );
}