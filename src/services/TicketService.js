import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc
} from "firebase/firestore";
import { db } from "../firebase";

export async function getTickets(eventId) {
  const ticketRef = collection(db, "events", eventId, "tickets");
  const snapshot = await getDocs(ticketRef);
  return snapshot.docs.map(docu => ({ id: docu.id, ...docu.data() }));
}

export async function updateTicket(eventId, ticketId, data) {
  const ref = doc(db, "events", eventId, "tickets", ticketId);
  await updateDoc(ref, data);
}

export async function deleteTicket(eventId, ticketId) {
  const ref = doc(db, "events", eventId, "tickets", ticketId);
  await deleteDoc(ref);
}

export async function createTicket(eventId, data) {
  const ref = collection(db, "events", eventId, "tickets");
  return await addDoc(ref, data);
}
