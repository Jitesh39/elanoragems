"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Trash2, Edit2, MoveUp, MoveDown, Save, X, Image as ImageIcon, Loader2, Star } from "lucide-react";
import Image from "next/image";

export function CustomerTestimonialsManager() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);
  const [photoUrl, setPhotoUrl] = useState("");
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const q = query(collection(db, "testimonials"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      data.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setTestimonials(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setName("");
    setReview("");
    setRating(5);
    setPhotoUrl("");
    setCloudinaryPublicId("");
    setIsActive(true);
    setSelectedFile(null);
  };

  const handleEdit = (t: any) => {
    setIsEditing(true);
    setEditingId(t.id);
    setName(t.name || "");
    setReview(t.review || "");
    setRating(t.rating || 5);
    setPhotoUrl(t.photoUrl || "");
    setCloudinaryPublicId(t.cloudinaryPublicId || "");
    setIsActive(t.isActive !== undefined ? t.isActive : true);
    setSelectedFile(null);
  };

  const uploadFile = async (file: File): Promise<{url: string, publicId: string}> => {
    const formData = new FormData();
    formData.append("action", "upload");
    formData.append("file", file);
    formData.append("resourceType", "image");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    
    if (!res.ok) {
      throw new Error("Upload failed");
    }
    
    return await res.json();
  };

  const deleteCloudinaryAsset = async (publicId: string) => {
    if (!publicId) return;
    try {
      const formData = new FormData();
      formData.append("action", "delete");
      formData.append("publicId", publicId);
      formData.append("resourceType", "image");
      await fetch("/api/upload", { method: "POST", body: formData });
    } catch (e) {
      console.error("Failed to delete asset:", e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Customer Name is required.");
      return;
    }
    if (!review.trim()) {
      alert("Review text is required.");
      return;
    }

    setIsUploading(true);

    try {
      let finalPhotoUrl = photoUrl;
      let finalPublicId = cloudinaryPublicId;

      if (selectedFile) {
        // Delete old asset if exists
        if (cloudinaryPublicId) {
          await deleteCloudinaryAsset(cloudinaryPublicId);
        }
        const uploadResult = await uploadFile(selectedFile);
        finalPhotoUrl = uploadResult.url;
        finalPublicId = uploadResult.publicId;
      }

      const testimonialData = {
        name: name.trim(),
        review: review.trim(),
        rating: Number(rating),
        photoUrl: finalPhotoUrl,
        cloudinaryPublicId: finalPublicId,
        isActive,
      };

      if (isEditing && editingId) {
        await updateDoc(doc(db, "testimonials", editingId), testimonialData);
      } else {
        await addDoc(collection(db, "testimonials"), {
          ...testimonialData,
          displayOrder: testimonials.length + 1,
          createdAt: new Date().toISOString()
        });
      }
      
      resetForm();
    } catch (error) {
      console.error("Error saving testimonial:", error);
      alert("Failed to save testimonial.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (t: any) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      try {
        if (t.cloudinaryPublicId) {
          await deleteCloudinaryAsset(t.cloudinaryPublicId);
        }
        await deleteDoc(doc(db, "testimonials", t.id));
      } catch (error) {
        console.error("Error deleting testimonial:", error);
        alert("Failed to delete testimonial.");
      }
    }
  };

  const moveTestimonial = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === testimonials.length - 1)) return;
    
    const newTestimonials = [...testimonials];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    const currentOrder = newTestimonials[index].displayOrder || 0;
    const swapOrder = newTestimonials[swapIndex].displayOrder || 0;
    
    await updateDoc(doc(db, "testimonials", newTestimonials[index].id), { displayOrder: swapOrder });
    await updateDoc(doc(db, "testimonials", newTestimonials[swapIndex].id), { displayOrder: currentOrder });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
        <h2 className="text-lg font-bold text-[#0F2F6B]">Customer Testimonials</h2>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-[#0F2F6B] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-900 transition-colors"
          >
            <Plus size={16} /> Add Testimonial
          </button>
        )}
      </div>

      {isEditing && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 relative">
          <button 
            onClick={resetForm}
            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
          >
            <X size={20} />
          </button>
          <h3 className="font-bold text-[#0F2F6B] mb-4">{editingId ? "Edit Testimonial" : "Add New Testimonial"}</h3>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Customer Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Sarah Jenkins" className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none font-medium" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Rating</label>
                <select value={rating} onChange={e => setRating(Number(e.target.value))} className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none font-medium bg-white">
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                  <option value={2}>2 Stars</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Review Text</label>
                <textarea required rows={3} value={review} onChange={e => setReview(e.target.value)} placeholder="Write the customer's testimonial review here..." className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none font-medium resize-none"></textarea>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-200 pt-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Customer Photo</label>
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
                {(photoUrl && !selectedFile) && (
                  <p className="text-xs text-green-600 mt-2 truncate font-medium">Current photo URL: {photoUrl}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="isActiveTestimonial" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 rounded text-[#0F2F6B]" />
              <label htmlFor="isActiveTestimonial" className="text-sm font-medium text-zinc-700">Testimonial is Active</label>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={isUploading}
                className="bg-[#0F2F6B] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50"
              >
                {isUploading ? <><Loader2 size={18} className="animate-spin" /> Uploading...</> : <><Save size={18} /> Save Testimonial</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of Testimonials */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-zinc-500">Loading testimonials...</div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-300 rounded-2xl">No testimonials added yet.</div>
        ) : (
          testimonials.map((t, index) => (
            <div key={t.id} className="flex items-center justify-between bg-white border border-zinc-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 relative bg-zinc-100 rounded-full overflow-hidden border border-zinc-200 flex-shrink-0 flex items-center justify-center">
                  {t.photoUrl ? (
                    <Image src={t.photoUrl} alt={t.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#0F2F6B]/5 flex items-center justify-center text-[#0F2F6B]">
                      <span className="font-serif font-bold text-lg uppercase select-none">
                        {t.name ? t.name.charAt(0) : "U"}
                      </span>
                    </div>
                  )}
                  {!t.isActive && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="text-[8px] font-bold bg-zinc-800 text-white px-1.5 py-0.5 rounded-full">Inactive</span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-[#0F2F6B] text-sm flex items-center gap-2">
                    {t.name || "Anonymous"} 
                    <span className="flex items-center text-[#D4AF37] font-semibold text-xs">
                      <Star size={12} className="fill-current inline mr-0.5" />
                      {t.rating || 5}
                    </span>
                  </h4>
                  <p className="text-xs text-zinc-500 line-clamp-2 max-w-xl italic">"{t.review}"</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex flex-col mr-2">
                  <button onClick={() => moveTestimonial(index, 'up')} disabled={index === 0} className="p-1 text-zinc-400 hover:text-[#0F2F6B] disabled:opacity-30"><MoveUp size={16} /></button>
                  <button onClick={() => moveTestimonial(index, 'down')} disabled={index === testimonials.length - 1} className="p-1 text-zinc-400 hover:text-[#0F2F6B] disabled:opacity-30"><MoveDown size={16} /></button>
                </div>
                <button onClick={() => handleEdit(t)} className="p-2 text-zinc-500 hover:text-[#0F2F6B] hover:bg-zinc-100 rounded-lg"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(t)} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
