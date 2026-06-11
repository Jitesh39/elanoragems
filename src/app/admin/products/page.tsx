"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, deleteDoc, doc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Edit, Trash2, Search, Filter, X, Loader2, Image as ImageIcon } from "lucide-react";

export default function ManageProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [showProductForm, setShowProductForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("rings");
  const [material, setMaterial] = useState("Sterling Silver");
  const [stock, setStock] = useState("10");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const productsRef = collection(db, "products");
    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      const prods: any[] = [];
      snapshot.forEach(doc => {
        prods.push({ id: doc.id, ...doc.data() });
      });
      setProducts(prods);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setName("");
    setPrice("");
    setCategory("rings");
    setMaterial("Sterling Silver");
    setStock("10");
    setSelectedFile(null);
    setShowProductForm(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = "";
      
      if (selectedFile) {
        const formData = new FormData();
        formData.append("action", "upload");
        formData.append("file", selectedFile);
        formData.append("resourceType", "image");

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Image upload failed");
        }

        const uploadResult = await res.json();
        imageUrl = uploadResult.url;
      }

      await addDoc(collection(db, "products"), {
        name,
        price: Number(price),
        category,
        material,
        stock: Number(stock),
        images: imageUrl ? [imageUrl] : [],
        createdAt: new Date().toISOString()
      });

      resetForm();
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2F6B]">Manage Products</h1>
          <p className="text-zinc-500 mt-1">Add, edit, or remove products from your catalog.</p>
        </div>
        <button 
          onClick={() => setShowProductForm(true)}
          className="bg-[#0F2F6B] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-900 transition-colors shadow-sm"
        >
          <Plus size={20} className="text-[#D4AF37]" />
          Add New Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B]"
            />
          </div>
          <button className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 flex items-center gap-2 hover:bg-zinc-50 w-full sm:w-auto justify-center">
            <Filter size={16} /> Filter
          </button>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-zinc-500 border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Product Info</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Material</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">Loading products...</td>
                </tr>
              ) : filteredProducts.length > 0 ? filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <img 
                      src={product.images?.[0] || product.image || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&q=80"} 
                      alt={product.name} 
                      className="w-12 h-12 rounded-lg object-cover border border-zinc-100"
                    />
                    <div>
                      <p className="font-bold text-[#0F2F6B]">{product.name}</p>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">SKU: {product.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-600 capitalize font-medium">{product.category || "Uncategorized"}</td>
                  <td className="px-6 py-4 text-zinc-600 font-medium">{product.material || "Sterling Silver"}</td>
                  <td className="px-6 py-4 font-bold text-[#0F2F6B]">₹{product.price?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.stock > 10 ? 'bg-emerald-100 text-emerald-700' : product.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {product.stock || "In Stock"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-zinc-400 hover:text-[#0F2F6B] hover:bg-zinc-100 rounded-lg transition-colors">
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-[#0F2F6B]">Add New Product</h2>
              <button onClick={() => setShowProductForm(false)} className="text-zinc-400 hover:text-[#0F2F6B]">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Product Name</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Price (₹)</label>
                    <input required type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Stock</label>
                    <input required type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Category</label>
                    <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none">
                      <option value="rings">Rings</option>
                      <option value="necklaces">Necklaces</option>
                      <option value="earrings">Earrings</option>
                      <option value="bracelets">Bracelets</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Material</label>
                    <select required value={material} onChange={e => setMaterial(e.target.value)} className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none">
                      <option value="Sterling Silver">Sterling Silver</option>
                      <option value="Gold Plated">Gold Plated</option>
                      <option value="Rose Gold">Rose Gold</option>
                      <option value="Platinum">Platinum</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Product Image (Upload to Cloudinary)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0F2F6B]/10 file:text-[#0F2F6B] hover:file:bg-[#0F2F6B]/20" 
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-[#0F2F6B] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50"
                  >
                    {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
