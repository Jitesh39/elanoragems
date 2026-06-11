"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Trash2, Edit2, MoveUp, MoveDown, Save, X, Video, Loader2 } from "lucide-react";

export function InfluencerManager() {
  const [reels, setReels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState("");
  const [isActive, setIsActive] = useState(true);
  // Optional: product tags can be added later as array
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const q = query(collection(db, "influencerReels"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      data.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setReels(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setName("");
    setInstagram("");
    setTitle("");
    setVideoUrl("");
    setCloudinaryPublicId("");
    setIsActive(true);
    setSelectedFile(null);
  };

  const handleEdit = (reel: any) => {
    setIsEditing(true);
    setEditingId(reel.id);
    setName(reel.name);
    setInstagram(reel.instagram);
    setTitle(reel.title);
    setVideoUrl(reel.videoUrl);
    setCloudinaryPublicId(reel.cloudinaryPublicId);
    setIsActive(reel.isActive);
    setSelectedFile(null);
  };

  const uploadFile = async (file: File): Promise<{url: string, publicId: string}> => {
    const formData = new FormData();
    formData.append("action", "upload");
    formData.append("file", file);
    formData.append("resourceType", "video");

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
      formData.append("resourceType", "video");
      await fetch("/api/upload", { method: "POST", body: formData });
    } catch (e) {
      console.error("Failed to delete asset:", e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let finalVideoUrl = videoUrl;
      let finalPublicId = cloudinaryPublicId;

      if (selectedFile) {
        // Validate file size (max 20MB)
        const maxSize = 20 * 1024 * 1024; // 20MB in bytes
        if (selectedFile.size > maxSize) {
          alert('File size exceeds 20MB limit. Please choose a smaller video.');
          setIsUploading(false);
          return;
        }
        if (cloudinaryPublicId) {
          await deleteCloudinaryAsset(cloudinaryPublicId);
        }
        const uploadResult = await uploadFile(selectedFile);
        finalVideoUrl = uploadResult.url;
        finalPublicId = uploadResult.publicId;
      }

      if (!finalVideoUrl) {
        alert("Please upload an MP4 video.");
        setIsUploading(false);
        return;
      }

      const reelData = {
        name,
        instagram,
        title,
        videoUrl: finalVideoUrl,
        cloudinaryPublicId: finalPublicId,
        isActive,
        productIds: [] // Placeholder for future
      };

      if (isEditing && editingId) {
        await updateDoc(doc(db, "influencerReels", editingId), reelData);
      } else {
        await addDoc(collection(db, "influencerReels"), {
          ...reelData,
          displayOrder: reels.length + 1,
          createdAt: new Date().toISOString()
        });
      }
      
      resetForm();
    } catch (error) {
      console.error("Error saving reel:", error);
      alert("Failed to save reel.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (reel: any) => {
    if (confirm("Are you sure you want to delete this reel?")) {
      try {
        if (reel.cloudinaryPublicId) {
          await deleteCloudinaryAsset(reel.cloudinaryPublicId);
        }
        await deleteDoc(doc(db, "influencerReels", reel.id));
      } catch (error) {
        console.error("Error deleting reel:", error);
        alert("Failed to delete reel.");
      }
    }
  };

  const moveReel = async (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === reels.length - 1)) return;
    
    const newReels = [...reels];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    const currentOrder = newReels[index].displayOrder;
    const swapOrder = newReels[swapIndex].displayOrder;
    
    await updateDoc(doc(db, "influencerReels", newReels[index].id), { displayOrder: swapOrder });
    await updateDoc(doc(db, "influencerReels", newReels[swapIndex].id), { displayOrder: currentOrder });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
        <h2 className="text-lg font-bold text-[#0F2F6B]">Influencer Spotlight</h2>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-[#0F2F6B] text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-blue-900 transition-colors"
          >
            <Plus size={16} /> Add Reel
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
          <h3 className="font-bold text-[#0F2F6B] mb-4">{editingId ? "Edit Reel" : "Add New Reel"}</h3>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Influencer Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aishwarya" className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Instagram Handle</label>
                <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="e.g. @aish.fashion" className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Reel Title (Overlay)</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Minimalist Gold Collection" className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none" />
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Upload Vertical Video (MP4)</label>
              <input 
                type="file" 
                accept="video/mp4" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                  }
                }}
                className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0F2F6B]/10 file:text-[#0F2F6B] hover:file:bg-[#0F2F6B]/20" 
              />
              {(videoUrl && !selectedFile) && (
                <p className="text-xs text-green-600 mt-2 truncate">Current video: {videoUrl}</p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="isActiveReel" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 rounded text-[#0F2F6B]" />
              <label htmlFor="isActiveReel" className="text-sm font-medium text-zinc-700">Reel is Active</label>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={isUploading}
                className="bg-[#0F2F6B] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50"
              >
                {isUploading ? <><Loader2 size={18} className="animate-spin" /> Uploading...</> : <><Save size={18} /> Save Reel</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of Reels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-8 text-zinc-500">Loading reels...</div>
        ) : reels.length === 0 ? (
          <div className="col-span-full text-center py-8 text-zinc-500 border border-dashed border-zinc-300 rounded-2xl">No reels added yet.</div>
        ) : (
          reels.map((reel, index) => (
            <div key={reel.id} className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="aspect-[9/16] relative bg-zinc-900">
                <video src={reel.videoUrl} className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                  <h4 className="font-bold text-white text-sm">{reel.title}</h4>
                  <p className="text-xs text-zinc-300">{reel.name} • {reel.instagram}</p>
                </div>
                {!reel.isActive && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Inactive</div>
                )}
              </div>
              <div className="p-3 flex justify-between items-center bg-zinc-50 border-t border-zinc-100">
                <div className="flex gap-1">
                  <button onClick={() => moveReel(index, 'up')} disabled={index === 0} className="p-1.5 text-zinc-400 hover:text-[#0F2F6B] disabled:opacity-30 rounded-lg hover:bg-zinc-200"><MoveUp size={14} /></button>
                  <button onClick={() => moveReel(index, 'down')} disabled={index === reels.length - 1} className="p-1.5 text-zinc-400 hover:text-[#0F2F6B] disabled:opacity-30 rounded-lg hover:bg-zinc-200"><MoveDown size={14} /></button>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(reel)} className="p-1.5 text-zinc-500 hover:text-[#0F2F6B] hover:bg-zinc-200 rounded-lg"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(reel)} className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
