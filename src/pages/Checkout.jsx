import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, increment, writeBatch } from 'firebase/firestore'
import { db } from '../firebase'
import { FaLock, FaCreditCard, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'
import Logo from '../components/Logo'

export default function Checkout() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    async function loadOrder() {
      try {
        if (!orderId) return
        const orderRef = doc(db, 'orders', orderId)
        const orderSnap = await getDoc(orderRef)
        if (orderSnap.exists()) {
          const data = { id: orderSnap.id, ...orderSnap.data() }
          setOrder(data)

          // Load tickets details
          const ticketPromises = data.items.map(async item => {
            const tRef = doc(db, 'events', data.eventId, 'tickets', item.ticketId)
            const tSnap = await getDoc(tRef)
            return { id: tSnap.id, ...tSnap.data(), qty: item.qty }
          })
          const tResults = await Promise.all(ticketPromises)
          setTickets(tResults)
        }
      } catch (err) {
        console.error('Failed to load order', err)
      } finally {
        setLoading(false)
      }
    }
    loadOrder()
  }, [orderId])

  async function handlePay() {
    if (!cardNumber || cardNumber.length < 4) {
      alert('Enter a valid card number')
      return
    }
    
    setProcessing(true)

    // Fake payment delay
    setTimeout(async () => {
      try {
        // 1. Update Order Status
        const orderRef = doc(db, 'orders', orderId)
        await updateDoc(orderRef, { status: 'paid' })

        // 2. Update Event Stats (Revenue & Tickets Sold)
        const eventRef = doc(db, 'events', order.eventId)
        await updateDoc(eventRef, {
            revenue: increment(order.total / 100), 
            ticketsSold: increment(order.items.reduce((acc, item) => acc + item.qty, 0))
        })

        // 3. Update Individual Ticket Stats (Quantity Sold)
        const batch = writeBatch(db)
        
        order.items.forEach(item => {
            const ticketRef = doc(db, 'events', order.eventId, 'tickets', item.ticketId)
            batch.update(ticketRef, {
                quantity_sold: increment(item.qty)
            })
        })

        await batch.commit()

        setPaymentSuccess(true)
        setTimeout(() => {
            navigate('/dashboard')
        }, 2500)

      } catch (err) {
        console.error("Payment processing error", err)
        alert("Payment failed. Please try again.")
        setProcessing(false)
      }
    }, 1500)
  }

  if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-medium animate-pulse">
          Loading order details...
      </div>
  )

  if (!order) return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
              <FaExclamationCircle className="mx-auto text-4xl text-gray-300 mb-3" />
              <h2 className="text-xl font-bold text-gray-900">Order not found</h2>
              <button onClick={() => navigate('/')} className="mt-4 text-black hover:underline font-bold">Return Home</button>
          </div>
      </div>
  )

  if (paymentSuccess)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-green-200 shadow-lg">
                <FaCheckCircle className="text-white text-4xl" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Payment Successful!</h2>
            <p className="text-gray-500 mb-8">Your tickets have been secured.</p>
            <div className="w-full bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Transaction ID</p>
                <p className="font-mono text-gray-900 font-bold">{orderId.slice(0, 8).toUpperCase()}</p>
            </div>
            <p className="text-sm font-bold text-gray-900 animate-pulse">Redirecting to dashboard...</p>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Brand Header */}
      <div className="max-w-md mx-auto mb-8 text-center animate-fade-in-up">
        <div className="inline-flex justify-center mb-4">
            <Logo className="w-12 h-12" textClassName="text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Secure Checkout</h2>
      </div>

      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden ring-1 ring-gray-100 animate-fade-in-up delay-100">
          
          {/* Order Summary */}
          <div className="bg-gray-900 text-white p-8">
              <p className="text-sm text-gray-400 font-medium mb-1">Total to pay</p>
              <h1 className="text-4xl font-black tracking-tighter">₦{(order.total/100).toLocaleString()}</h1>
              <div className="mt-6 pt-6 border-t border-gray-800 space-y-3">
                  {tickets.map(t => (
                    <div key={t.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-300 font-medium flex items-center gap-2">
                          <span className="w-5 h-5 bg-gray-800 rounded flex items-center justify-center text-xs font-bold">{t.qty}</span>
                          {t.name}
                      </span>
                      <span className="font-bold">{t.is_free ? 'Free' : `₦${(t.price).toLocaleString()}`}</span>
                    </div>
                  ))}
              </div>
          </div>

          <div className="p-8 space-y-6 bg-white">
              <div>
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-2 block">Card Details</label>
                  <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaCreditCard className="text-gray-400 group-focus-within:text-black transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        placeholder="0000 0000 0000 0000"
                        className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-4 font-mono text-lg text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 shadow-sm bg-gray-50 focus:bg-white"
                      />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none gap-2">
                          <div className="w-8 h-5 bg-gray-200 rounded"></div>
                          <div className="w-8 h-5 bg-gray-200 rounded"></div>
                      </div>
                  </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <FaLock size={10} />
                  <span>Payments are secure and encrypted.</span>
              </div>

              <button
                onClick={handlePay}
                disabled={processing}
                className="w-full bg-black text-white py-4 rounded-xl font-bold shadow-lg hover:bg-gray-900 hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2 text-lg"
              >
                {processing ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                    </>
                ) : (
                    <>Pay Now</>
                )}
              </button>
              
              <button 
                  onClick={() => navigate(-1)}
                  className="w-full text-center text-sm font-bold text-gray-400 hover:text-black transition-colors"
                  disabled={processing}
              >
                  Cancel Payment
              </button>
          </div>
      </div>
      
      <div className="max-w-md mx-auto mt-8 text-center text-xs text-gray-400">
          From {new Date().getFullYear()} Eventix. All rights reserved.
      </div>

    </div>
  )
}
