import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../firebase'
import { useNavigate, Link } from 'react-router-dom'
import Logo from '../../components/Logo'
import { FaEnvelope, FaLock } from 'react-icons/fa'

export default function Login(){
	const [email,setEmail] = useState('')
	const [password,setPassword] = useState('')
	const [loading,setLoading] = useState(false)
	const navigate = useNavigate()

	async function submit(e){
		e.preventDefault()
		setLoading(true)
		try{
			await signInWithEmailAndPassword(auth,email,password)
			navigate('/')
		}catch(err){ alert(err.message) }
		setLoading(false)
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
			<div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-gray-100">
				
                {/* Brand Section - Desktop */}
				<div className="hidden md:flex bg-black p-10 flex-col items-center justify-center text-white text-center">
                    <Logo className="w-16 h-16 bg-white text-black p-4 rounded-xl shadow-lg shadow-white/20 animate-fade-in-up md:mb-6" textClassName="hidden" />
					<h3 className="text-3xl font-black tracking-tighter mb-2 animate-fade-in-up delay-100">Welcome Back.</h3>
					<p className="text-gray-400 max-w-xs text-sm leading-relaxed animate-fade-in-up delay-200">Sign in to manage your events and track your success with real-time analytics.</p>
				</div>

				<div className="p-8 md:p-10 flex flex-col justify-center">
					<div className="mb-8 animate-fade-in-up">
						<div className="md:hidden flex justify-center mb-6">
							<Logo className="w-10 h-10" textClassName="text-2xl" />
						</div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Sign in</h2>
					    <p className="text-sm text-gray-500 mt-2">Enter your credentials to access your dashboard.</p>
                    </div>

					<form onSubmit={submit} className="space-y-6 animate-fade-in-up delay-100">
						<div>
							<label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Email Address</label>
                            <div className="relative mt-2">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FaEnvelope className="text-gray-400" />
                                </div>
                                <input 
                                    value={email} 
                                    onChange={e=>setEmail(e.target.value)} 
                                    placeholder="name@company.com" 
                                    type="email" 
                                    required 
                                    className="w-full border border-gray-300 rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 focus:scale-[1.02] focus:shadow-md bg-gray-50 focus:bg-white" 
                                />
                            </div>
						</div>

						<div>
							<label className="text-xs font-bold text-gray-900 uppercase tracking-wide">Password</label>
                            <div className="relative mt-2">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FaLock className="text-gray-400" />
                                </div>
                                <input 
                                    value={password} 
                                    onChange={e=>setPassword(e.target.value)} 
                                    placeholder="••••••••" 
                                    type="password" 
                                    required 
                                    className="w-full border border-gray-300 rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 focus:scale-[1.02] focus:shadow-md bg-gray-50 focus:bg-white" 
                                />
                            </div>
						</div>

						<div className="flex items-center justify-between pt-2">
							<button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full bg-black text-white px-6 py-3.5 rounded-xl font-bold hover:bg-gray-900 hover:shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-300 shadow-md disabled:opacity-70"
                            >
								{loading ? 'Signing in...' : 'Sign In'}
							</button>
						</div>
                        
                        <div className="flex justify-between items-center text-sm mt-4">
                            <Link to="/forgot" className="text-gray-500 hover:text-black transition">Forgot password?</Link>
                            <span className="text-gray-400">|</span>
						    <p className="text-gray-600">New here? <Link to="/register" className="text-black font-bold hover:underline">Create account</Link></p>
                        </div>
					</form>
				</div>
			</div>
		</div>
	)
}