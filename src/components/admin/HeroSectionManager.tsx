"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Trash2, Edit2, MoveUp, MoveDown, Save, X, Image as ImageIcon, Video, Loader2 } from "lucide-react";
import Image from "next/image";

export function HeroSectionManager() {
  const [slides, setSlides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [buttonText, setButtonText] = useState("Shop Now");
  const [buttonUrl, setButtonUrl] = useState("/collections");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [mediaUrl, setMediaUrl] = useState("");
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const q = query(collection(db, "heroSlides"), orderBy("displayOrder", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setSlides(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setTitle("");
    setSubtitle("");
    setButtonText("Shop Now");
    setButtonUrl("/collections");
    setMediaType("image");
    setMediaUrl("");
    setCloudinaryPublicId("");
    setIsActive(true);
    setSelectedFile(null);
  };

  const handleEdit = (slide: any) => {
    setIsEditing(true);
    setEditingId(slide.id);
    setTitle(slide.title);
    setSubtitle(slide.subtitle);
    setButtonText(slide.buttonText);
    setButtonUrl(slide.buttonUrl);
    setMediaType(slide.mediaType);
    setMediaUrl(slide.mediaUrl);
    setCloudinaryPublicId(slide.cloudinaryPublicId);
    setIsActive(slide.isActive);
    setSelectedFile(null);
  };

  const uploadFile = async (file: File): Promise<{url: string, publicId: string}> => {
    const formData = new FormData();
    formData.append("action", "upload");
    formData.append("file", file);
    formData.append("resourceType", mediaType);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    
    if (!res.ok) {
      throw new Error("Upload failed");
    }
    
    return await res.json();
  };

  const deleteCloudinaryAsset = async (publicId: string, type: string) => {
    if (!publicId) return;
    try {
      const formData = new FormData();
      formData.append("action", "delete");
      formData.append("publicId", publicId);
      formData.append("resourceType", type);
      await fetch("/api/upload", { method: "POST", body: formData });
    } catch (e) {
      console.error("Failed to delete asset:", e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let finalMediaUrl = mediaUrl;
      let finalPublicId = cloudinaryPublicId;

      if (selectedFile) {
        // Delete old asset if exists
        if (cloudinaryPublicId) {
          await deleteCloudinaryAsset(cloudinaryPublicId, mediaType);
        }
        const uploadResult = await uploadFile(selectedFile);
        finalMediaUrl = uploadResult.url;
        finalPublicId = uploadResult.publicId;
      }

      if (!finalMediaUrl) {
        alert("Please upload an image or video.");
        setIsUploading(false);
        return;
      }

      const slideData = {
        title,
        subtitle,
        buttonText,
        buttonUrl,
        mediaType,
        mediaUrl: finalMediaUrl,
        cloudinaryPublicId: finalPublicId,
        isActive,
      };

      if (isEditing && editingId) {
        await updateDoc(doc(db, "heroSlides", editingId), slideData);
      } else {
        await addDoc(collection(db, "heroSlides"), {
          ...slideData,
          displayOrder: slides.length + 1,
          createdAt: new Date().toISOString()
        });
      }
      
      resetForm();
    } catch (error) {
      console.error("Error saving slide:", error);
      alert("Failed to save slide.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (slide: any) => {
    if (confirm("Are you sure you want to delete this slide?")) {
      try {
        if (slide.cloudinaryPublicId) {
          await deleteCloudinaryAsset(slide.cloudinaryPublicId, slide.mediaType);
        }
        await deleteDoc(doc(db, "heroSlides", slide.id));
      } catch (error) {
        console.error("Error deleting slide:", error);
        alert("Failed to delete slide.");
      }
    }
  };

  const moveSlide = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === slides.length - 1)) return;
    
    const newSlides = [...slides];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap displayOrders
    const currentOrder = newSlides[index].displayOrder;
    const swapOrder = newSlides[swapIndex].displayOrder;
    
    await updateDoc(doc(db, "heroSlides", newSlides[index].id), { displayOrder: swapOrder });
    await updateDoc(doc(db, "heroSlides", newSlides[swapIndex].id), { displayOrder: currentOrder });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
        <h2 className="text-lg font-bold text-[#0F2F6B]">Hero Slider Management</h2>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-[#0F2F6B] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-900 transition-colors"
          >
            <Plus size={16} /> Add Slide
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
          <h3 className="font-bold text-[#0F2F6B] mb-4">{editingId ? "Edit Slide" : "Add New Slide"}</h3>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Heading</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Sub Heading</label>
                <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Button Text</label>
                <input required type="text" value={buttonText} onChange={e => setButtonText(e.target.value)} className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Button URL</label>
                <input required type="text" value={buttonUrl} onChange={e => setButtonUrl(e.target.value)} className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-200 pt-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Media Type</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setMediaType("image")} className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors ${mediaType === 'image' ? 'bg-[#0F2F6B] text-white border-[#0F2F6B]' : 'bg-white text-zinc-500 border-zinc-200'}`}>
                    <ImageIcon size={16} /> Image
                  </button>
                  <button type="button" onClick={() => setMediaType("video")} className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors ${mediaType === 'video' ? 'bg-[#0F2F6B] text-white border-[#0F2F6B]' : 'bg-white text-zinc-500 border-zinc-200'}`}>
                    <Video size={16} /> Video (MP4)
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Upload File</label>
                <input 
                  type="file" 
                  accept={mediaType === 'image' ? "image/*" : "video/mp4"} 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0F2F6B]/10 file:text-[#0F2F6B] hover:file:bg-[#0F2F6B]/20" 
                />
                {(mediaUrl && !selectedFile) && (
                  <p className="text-xs text-green-600 mt-2 truncate">Current file: {mediaUrl}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 rounded text-[#0F2F6B]" />
              <label htmlFor="isActive" className="text-sm font-medium text-zinc-700">Slide is Active</label>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={isUploading}
                className="bg-[#0F2F6B] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50"
              >
                {isUploading ? <><Loader2 size={18} className="animate-spin" /> Uploading...</> : <><Save size={18} /> Save Slide</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of Slides */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-zinc-500">Loading slides...</div>
        ) : slides.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-300 rounded-2xl">No slides added yet.</div>
        ) : (
          slides.map((slide, index) => (
            <div key={slide.id} className="flex items-center justify-between bg-white border border-zinc-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-24 h-16 relative bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200">
                  {slide.mediaType === "video" ? (
                    <video src={slide.mediaUrl} className="w-full h-full object-cover" muted />
                  ) : (
                    <Image src={slide.mediaUrl || "/placeholder.jpg"} alt={slide.title} fill className="object-cover" />
                  )}
                  {!slide.isActive && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                      <span className="text-[10px] font-bold bg-zinc-800 text-white px-2 py-0.5 rounded-full">Inactive</span>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-[#0F2F6B] text-sm">{slide.title || "Untitled"}</h4>
                  <p className="text-xs text-zinc-500">{slide.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex flex-col mr-2">
                  <button onClick={() => moveSlide(index, 'up')} disabled={index === 0} className="p-1 text-zinc-400 hover:text-[#0F2F6B] disabled:opacity-30"><MoveUp size={16} /></button>
                  <button onClick={() => moveSlide(index, 'down')} disabled={index === slides.length - 1} className="p-1 text-zinc-400 hover:text-[#0F2F6B] disabled:opacity-30"><MoveDown size={16} /></button>
                </div>
                <button onClick={() => handleEdit(slide)} className="p-2 text-zinc-500 hover:text-[#0F2F6B] hover:bg-zinc-100 rounded-lg"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(slide)} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
