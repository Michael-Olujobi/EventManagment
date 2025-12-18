import React, {useState} from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../firebase'
import { Link } from 'react-router-dom'
import Logo from '../../components/Logo'


export default function ForgotPassword(){
	const [email,setEmail]=useState('')
	const [loading,setLoading] = useState(false)
	const [status,setStatus] = useState(null)

	async function submit(e){
		e.preventDefault()
		setLoading(true)
		try{ await sendPasswordResetEmail(auth,email); setStatus({type:'success', message:'Check your inbox for reset instructions.'}) }catch(err){ setStatus({type:'error', message: err.message}) }
		setLoading(false)
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
			<div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-gray-100">
				{/* Brand Section - Desktop */}
				<div className="hidden md:flex bg-black p-10 flex-col items-center justify-center text-white text-center">
                    <Logo className="w-16 h-16 bg-white text-black p-4 rounded-xl shadow-lg shadow-white/20 animate-fade-in-up md:mb-6" textClassName="hidden" />
					<h3 className="text-3xl font-black tracking-tighter mb-2 animate-fade-in-up delay-100">Recovery.</h3>
					<p className="text-gray-400 max-w-xs text-sm leading-relaxed animate-fade-in-up delay-200">Enter your email address and we'll send you a link to reset your password.</p>
				</div>

				<div className="p-8 md:p-10 flex flex-col justify-center">
					<div className="mb-8 animate-fade-in-up">
						<div className="md:hidden flex justify-center mb-6">
							<Logo className="w-10 h-10" textClassName="text-2xl" />
						</div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Reset Password</h2>
					    <p className="text-sm text-gray-500 mt-2 font-medium">We'll email a link to reset your password.</p>
                    </div>

					<form onSubmit={submit} className="space-y-6 animate-fade-in-up delay-100">
						<div>
							<label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Email Address</label>
							<input 
								value={email} 
								onChange={e=>setEmail(e.target.value)} 
								placeholder="you@company.com" 
								type="email" 
								required 
								className="mt-2 w-full border border-gray-200 rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 font-medium bg-gray-50 focus:bg-white" 
							/>
						</div>

						{status && (
							<div className={`p-3 rounded ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{status.message}</div>
						)}

						<div className="flex flex-col gap-4">
							<button 
								type="submit" 
								disabled={loading} 
								className="w-full bg-black text-white px-6 py-4 rounded-xl font-bold hover:bg-gray-900 hover:shadow-xl transition-all duration-300 transform active:scale-95 disabled:opacity-70"
							>
								{loading ? 'Sending...' : 'Send reset email'}
							</button>
							<Link to="/login" className="text-sm text-center text-gray-500 hover:text-black font-bold transition">
								Back to login
							</Link>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}