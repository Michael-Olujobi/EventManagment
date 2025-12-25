import React, { useEffect, useState } from 'react'
import OrganizerLayout from '../../Layout/OrganizerLayout'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db, auth } from '../../firebase'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FaChartLine, FaArrowUp, FaTicketAlt, FaCalendarCheck } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Analytics(){
    const [eventsCount, setEventsCount] = useState(0)
    const [ticketsSold, setTicketsSold] = useState(0)
    const [revenue, setRevenue] = useState(0)
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: []
    });

    useEffect(() => {
        if (!auth.currentUser) return;

        const qEvents = query(collection(db, 'events'), where("organizerId", "==", auth.currentUser.uid));
        
        const unsubEvents = onSnapshot(qEvents, (snap) => {
            setEventsCount(snap.size)
            const eventIds = snap.docs.map(d => d.id);
            
            const ordersCol = collection(db, 'orders');
            onSnapshot(ordersCol, (orderSnap) => {
                let sold = 0
                let rev = 0
                const salesByDate = {}; 

                orderSnap.docs.forEach(d => {
                    const data = d.data();
                    if (eventIds.includes(data.eventId) && data.status === 'paid') {
                         const qty = data.items?.reduce((a, b) => a + (b.qty || 0), 0) || 0;
                         const amt = (data.total || data.amount || 0); 

                         sold += qty;
                         rev += amt;

                         const date = data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString();
                         
                         if (!salesByDate[date]) {
                             salesByDate[date] = { revenue: 0, tickets: 0 };
                         }
                         salesByDate[date].revenue += (amt / 100);
                         salesByDate[date].tickets += qty;
                    }
                });

                setTicketsSold(sold)
                setRevenue(rev)

                const sortedDates = Object.keys(salesByDate).sort((a,b) => new Date(a) - new Date(b));
                
                // Chart.js data with Black & White theme
                setChartData({
                    labels: sortedDates,
                    datasets: [
                        {
                            label: 'Revenue (₦)',
                            data: sortedDates.map(d => salesByDate[d].revenue),
                            borderColor: '#000000', // Black Line
                            backgroundColor: (context) => {
                                const ctx = context.chart.ctx;
                                const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                                gradient.addColorStop(0, 'rgba(0,0,0, 0.2)');
                                gradient.addColorStop(1, 'rgba(0,0,0, 0)');
                                return gradient;
                            },
                            borderWidth: 2,
                            tension: 0.4, // Smooth curve
                            fill: true,
                            pointBackgroundColor: '#000000',
                            pointBorderColor: '#fff',
                            pointBorderWidth: 2,
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: '#000000',
                            pointRadius: 4,
                            pointHoverRadius: 6,
                        }
                    ]
                });

            }, (err) => console.error('orders error', err));

        }, (err) => console.error('events listener', err))

        return () => {}
    }, [])

    const formattedRevenue = revenue ? `₦${(revenue/100).toLocaleString(undefined, {minimumFractionDigits: 2})}` : '₦0.00'

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false, 
          },
          title: {
            display: false,
          },
          tooltip: {
              backgroundColor: '#000',
              titleColor: '#fff',
              bodyColor: '#fff',
              padding: 14,
              cornerRadius: 8,
              displayColors: false,
              callbacks: {
                  label: (context) => `Revenue: ₦${context.raw.toLocaleString()}`
              }
          }
        },
        scales: {
            x: {
                grid: {
                    display: false, 
                },
                ticks: {
                    font: { size: 11, family: 'sans-serif' },
                    color: '#9ca3af'
                }
            },
            y: {
                grid: {
                    color: '#f3f4f6',
                    borderDash: [5, 5],
                },
                ticks: {
                    font: { size: 11, family: 'sans-serif' },
                    color: '#9ca3af',
                    callback: (value) => `₦${value}`
                },
                border: {
                    display: false 
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
    };

    return (
        <OrganizerLayout>
            <main className="max-w-6xl mx-auto mt-8 px-4 w-full mb-20 font-sans">
                
                {/* Minimalist Header */}
                <div className="mb-8">
                     <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Overview</h2>
                     <p className="text-sm md:text-base text-gray-500 mt-1 font-medium">Track your performance and growth.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Revenue Card - Black */}
                    <div className="p-6 bg-black rounded-2xl shadow-xl shadow-black/10 text-white transition hover:-translate-y-1 duration-300">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-bold opacity-70 uppercase tracking-wider">Total Revenue</p>
                            <div className="bg-white/20 p-2 rounded-lg">
                                <FaChartLine size={16} />
                            </div>
                        </div>
                        <p className="text-3xl font-black tracking-tight mt-2">{formattedRevenue}</p>
                        <div className="mt-4 text-xs font-medium flex items-center gap-1 text-green-400">
                            <FaArrowUp /> <span>100%</span> <span className="opacity-60 text-white">from last month</span>
                        </div>
                    </div>

                    {/* Tickets Sold - White */}
                    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition hover:shadow-md hover:-translate-y-1 duration-300">
                         <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Tickets Sold</p>
                            <div className="bg-gray-50 p-2 rounded-lg text-black">
                                <FaTicketAlt size={16} />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-gray-900 mt-2">{ticketsSold}</p>
                    </div>

                    {/* Active Events - White */}
                     <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition hover:shadow-md hover:-translate-y-1 duration-300">
                         <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Events</p>
                             <div className="bg-gray-50 p-2 rounded-lg text-black">
                                <FaCalendarCheck size={16} />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-gray-900 mt-2">{eventsCount}</p>
                    </div>
                </div>

                {/* Chart Section */}
                <div className="bg-white p-5 md:p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                             <h3 className="text-lg font-bold text-gray-900">Revenue Growth</h3>
                             <p className="text-sm text-gray-400">Net revenue over time</p>
                        </div>
                        <select className="w-full sm:w-auto bg-gray-50 border-none text-sm font-bold text-gray-600 rounded-lg py-2 px-4 focus:ring-0 cursor-pointer hover:bg-gray-100">
                            <option>This Year</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    
                    {chartData.labels.length > 0 ? (
                        <div className="h-80 w-full">
                            <Line options={options} data={chartData} />
                        </div>
                    ) : (
                        <div className="h-80 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                             <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
                                 <FaChartLine className="w-8 h-8 text-black" />
                             </div>
                            <p className="text-lg font-bold text-gray-900">No data available yet</p>
                            <span className="text-sm text-gray-500">Sales trends will appear here once you start selling tickets.</span>
                        </div>
                    )}
                </div>
            </main>
        </OrganizerLayout>
    )
}