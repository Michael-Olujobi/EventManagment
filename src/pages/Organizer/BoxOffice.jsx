import React, {useState} from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'


// Simple, safe attendee check-in placeholder
// - Accepts an Order/Ticket ID string and attempts to mark the order as checked-in
// - No third-party QR libraries used to avoid invalid-element issues


export default function BoxOffice(){
	const [input, setInput] = useState('')
	const [status, setStatus] = useState(null)
	const [loading, setLoading] = useState(false)


	async function handleCheckIn(e){
		e.preventDefault()
		if(!input) { setStatus({type:'error',message:'Enter an order ID'}); return }
		setLoading(true)
		try{
			const orderRef = doc(db,'orders',input)
			const snap = await getDoc(orderRef)
			if(!snap.exists()){
				setStatus({type:'error',message:'Order not found'})
			}else{
				const data = snap.data()
				if(data.checkedIn){
					setStatus({type:'info',message:'Already checked in'})
				}else{
					await updateDoc(orderRef,{checkedIn:true, checkedInAt: new Date()})
					setStatus({type:'success',message:`Checked in ${data.userId || 'attendee'}`})
				}
			}
		}catch(err){
			console.error(err)
			setStatus({type:'error',message:'Failed to check in'})
		}finally{ setLoading(false) }
	}

	return (
		<OrganizerLayout>
			<main className="max-w-3xl mx-auto mt-8 px-4 w-full mb-20 animate-fade-in-up">
				<div className="bg-black p-8 rounded-3xl shadow-xl text-white mb-8 relative border border-white/5 overflow-hidden">
					<div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
					<div className="relative">
						<h2 className="text-3xl font-black tracking-tight">Box Office</h2>
						<p className="text-sm md:text-base text-gray-400 mt-2 font-medium opacity-80">Attendee check-in and quick order lookup</p>
					</div>
				</div>

				<div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl shadow-gray-100 ring-1 ring-gray-100">
					<form onSubmit={handleCheckIn} className="flex flex-col sm:flex-row gap-4">
						<input 
							value={input} 
							onChange={e=>setInput(e.target.value)} 
							placeholder="Enter Order ID" 
							className="flex-1 border border-gray-200 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 font-medium bg-gray-50 focus:bg-white" 
						/>
						<button 
							type="submit" 
							className="px-8 py-4 bg-black text-white rounded-xl font-bold shadow-xl hover:bg-white hover:text-black hover:ring-2 hover:ring-black transition-all duration-300 transform active:scale-95 disabled:opacity-70" 
							disabled={loading}
						>
							{loading ? 'Checking...' : 'Check-in'}
						</button>
					</form>

					{status && (
						<div className={`mt-4 p-3 rounded ${status.type==='error'? 'bg-red-100 text-red-800' : status.type==='success' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
							{status.message}
						</div>
					)}

					<div className="mt-6 text-sm text-gray-500">
						Tip: Paste an order id or the raw QR text here. Replace this UI with a camera-based scanner when ready.
					</div>
				</div>
			</main>
		</OrganizerLayout>
	)
}