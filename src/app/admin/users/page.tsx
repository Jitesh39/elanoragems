"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Search, ShieldAlert, Eye, Mail, UserCircle } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const usersRef = collection(db, "users");
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const usersData: any[] = [];
      snapshot.forEach(doc => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersData);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Pre-populate search query if 'search' query parameter is present in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, []);

  const filteredUsers = users.filter(u => 
    (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2F6B]">Registered Users</h1>
          <p className="text-zinc-500 mt-1">Manage customer accounts and access levels.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B]"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-zinc-500 border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Joined Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">Loading users...</td>
                </tr>
              ) : filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center border border-zinc-200">
                      <UserCircle size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-[#0F2F6B]">{user.name || "Unknown User"}</p>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">ID: {user.id.slice(0, 8)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-zinc-600">
                      <Mail size={14} className="text-zinc-400" />
                      {user.email || "No Email"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-[#0F2F6B]/10 text-[#0F2F6B] border border-[#0F2F6B]/20' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'}`}>
                      {user.role || "customer"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    {user.createdAt ? new Date(user.createdAt.toMillis?.() || user.createdAt).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-zinc-400 hover:text-[#0F2F6B] hover:bg-zinc-100 rounded-lg transition-colors inline-flex items-center justify-center" title="View Details">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center" title="Block User">
                        <ShieldAlert size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
