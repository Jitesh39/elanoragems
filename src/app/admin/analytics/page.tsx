"use client";

import React, { useState } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, LineChart, Line, PieChart, Pie, Cell
} from "recharts";
import { Download, Calendar } from "lucide-react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30days");

  // Mock Data for Charts
  const revenueData = [
    { date: "1 Jun", revenue: 15000, orders: 45 },
    { date: "5 Jun", revenue: 22000, orders: 62 },
    { date: "10 Jun", revenue: 18000, orders: 55 },
    { date: "15 Jun", revenue: 35000, orders: 95 },
    { date: "20 Jun", revenue: 28000, orders: 82 },
    { date: "25 Jun", revenue: 42000, orders: 115 },
    { date: "30 Jun", revenue: 38000, orders: 105 },
  ];

  const categoryData = [
    { name: "Rings", value: 35 },
    { name: "Necklaces", value: 25 },
    { name: "Earrings", value: 20 },
    { name: "Gift Sets", value: 15 },
    { name: "Others", value: 5 },
  ];
  const COLORS = ['#0F2F6B', '#D4AF37', '#3b82f6', '#10b981', '#6b7280'];

  const userGrowthData = [
    { month: "Jan", users: 150 },
    { month: "Feb", users: 280 },
    { month: "Mar", users: 410 },
    { month: "Apr", users: 580 },
    { month: "May", users: 790 },
    { month: "Jun", users: 950 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2F6B]">Analytics & Reports</h1>
          <p className="text-zinc-500 mt-1">Detailed insights into your store's performance.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="bg-white border border-zinc-200 rounded-xl px-3 py-2 flex items-center gap-2 flex-1 sm:flex-none">
            <Calendar size={16} className="text-zinc-400" />
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent text-sm font-semibold text-zinc-600 focus:outline-none cursor-pointer"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <button className="bg-white border border-zinc-200 text-zinc-600 p-2.5 rounded-xl hover:bg-zinc-50 transition-colors shadow-sm">
            <Download size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Trend Area Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#0F2F6B]">Revenue Trend</h2>
            <p className="text-sm text-zinc-500">Gross revenue over time</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F2F6B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0F2F6B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} tickFormatter={(value) => `₹${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, "Revenue"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0F2F6B" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Trend Bar Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#0F2F6B]">Orders Volume</h2>
            <p className="text-sm text-zinc-500">Number of orders placed</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <Tooltip 
                  cursor={{ fill: '#f4f4f5' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="orders" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category Pie Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#0F2F6B]">Sales by Category</h2>
            <p className="text-sm text-zinc-500">Revenue distribution</p>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, "Share"]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth Line Chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[#0F2F6B]">User Growth</h2>
            <p className="text-sm text-zinc-500">Registered customers over time</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
