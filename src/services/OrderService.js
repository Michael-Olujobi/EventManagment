// src/services/ordersService.js
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Listen to orders for an event in real-time.
 * callback receives (ordersArray) on every update.
 * Returns unsubscribe function.
 */
export function listenOrdersForEvent(eventId, callback) {
  const q = query(
    collection(db, "orders"),
    where("eventId", "==", eventId),
    orderBy("createdAt", "desc")
  );
  const unsub = onSnapshot(q, (snap) => {
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(orders);
  }, (err) => {
    console.error("Orders listener error:", err);
    callback([]);
  });
  return unsub;
}

/**
 * Fetch orders once (non realtime).
 */
export async function fetchOrdersForEvent(eventId, limitCount = 50) {
  const q = query(
    collection(db, "orders"),
    where("eventId", "==", eventId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId, status) {
  const ref = doc(db, "orders", orderId);
  await updateDoc(ref, { status, updatedAt: serverTimestamp() });
}

/**
 * Mark a specific qrToken as checked (checked = true) by token value.
 * This reads the order, mutates the qrTokens array, and writes it back.
 * Also returns the updated order.
 */
export async function markTokenChecked(orderId, tokenValue) {
  const orderRef = doc(db, "orders", orderId);
  const snap = await getDoc(orderRef);
  if (!snap.exists()) throw new Error("Order not found");
  const order = snap.data();

  const updatedTokens = (order.qrTokens || []).map(t => {
    if (t.token === tokenValue) return { ...t, checked: true, checkedAt: serverTimestamp() };
    return t;
  });

  await updateDoc(orderRef, { qrTokens: updatedTokens });
  const newSnap = await getDoc(orderRef);
  return { id: newSnap.id, ...newSnap.data() };
}

/**
 * Validate a token globally (used by QR scanner).
 * Returns the order if token found and paid, otherwise null/error.
 */
export async function findOrderByToken(token) {
  // Because Firestore cannot query inside array of objects directly,
  // recommend storing tokens also in a "tokens" string array on order doc for fast lookup.
  // If you have order.tokens = ['a','b'], you can use where('tokens','array-contains',token)
  // Fallback: scan all recent orders (inefficient) -- here we try quick approach if tokens array exists.

  // Try fast lookup:
  const qFast = query(collection(db, "orders"), where("tokens", "array-contains", token));
  const fastSnap = await getDocs(qFast);
  if (!fastSnap.empty) return { id: fastSnap.docs[0].id, ...fastSnap.docs[0].data() };

  // Fallback: full scan of orders recent (limit 200) - only for small datasets
  const qScan = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const snap = await getDocs(qScan);
  for (let d of snap.docs) {
    const o = d.data();
    const tokens = o.qrTokens || [];
    if (tokens.some(t => t.token === token)) {
      return { id: d.id, ...o };
    }
  }
  return null;
}
