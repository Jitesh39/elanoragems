"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Edit, Trash2, FolderTree, ArrowUp, ArrowDown, Loader2, X, Image as ImageIcon } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [cloudinaryPublicId, setCloudinaryPublicId] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const categoriesRef = collection(db, "categories");
    // Listen to all categories
    const unsubscribe = onSnapshot(categoriesRef, (snapshot) => {
      const cats: any[] = [];
      snapshot.forEach(doc => {
        cats.push({ id: doc.id, ...doc.data() });
      });
      // Sort by displayOrder asc
      cats.sort((a, b) => {
        const orderA = typeof a.displayOrder === 'number' ? a.displayOrder : 9999;
        const orderB = typeof b.displayOrder === 'number' ? b.displayOrder : 9999;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || "").localeCompare(b.name || "");
      });
      setCategories(cats);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingId) {
      setSlug(generateSlug(val));
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl("");
    setCloudinaryPublicId("");
    setIsActive(true);
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleOpenEdit = (cat: any) => {
    setEditingId(cat.id);
    setName(cat.name || "");
    setSlug(cat.slug || cat.id);
    setDescription(cat.description || "");
    setImageUrl(cat.imageUrl || "");
    setCloudinaryPublicId(cat.cloudinaryPublicId || "");
    setIsActive(cat.isActive !== false);
    setSelectedFile(null);
    setShowModal(true);
  };

  const uploadFile = async (file: File): Promise<{ url: string; publicId: string }> => {
    const formData = new FormData();
    formData.append("action", "upload");
    formData.append("file", file);
    formData.append("resourceType", "image");

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Image upload failed");
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

  const handleDelete = async (cat: any) => {
    if (confirm(`Are you sure you want to delete the category "${cat.name}"?`)) {
      try {
        if (cat.cloudinaryPublicId) {
          await deleteCloudinaryAsset(cat.cloudinaryPublicId);
        }
        await deleteDoc(doc(db, "categories", cat.id));
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Failed to delete category");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Category Name is required");
    if (!slug.trim()) return alert("Slug is required");

    setIsSubmitting(true);
    try {
      let finalImageUrl = imageUrl;
      let finalPublicId = cloudinaryPublicId;

      if (selectedFile) {
        if (cloudinaryPublicId) {
          await deleteCloudinaryAsset(cloudinaryPublicId);
        }
        const uploadResult = await uploadFile(selectedFile);
        finalImageUrl = uploadResult.url;
        finalPublicId = uploadResult.publicId;
      }

      if (!finalImageUrl) {
        alert("Category Image is required");
        setIsSubmitting(false);
        return;
      }

      const categoryData = {
        name,
        slug: slug.trim().toLowerCase(),
        description,
        imageUrl: finalImageUrl,
        cloudinaryPublicId: finalPublicId,
        isActive,
        updatedAt: new Date().toISOString()
      };

      if (editingId) {
        await updateDoc(doc(db, "categories", editingId), categoryData);
      } else {
        // Document ID is slug
        const docId = slug.trim().toLowerCase();
        // Check if category already exists
        const exists = categories.some(c => c.id === docId);
        if (exists) {
          alert("A category with this slug/ID already exists. Please choose a different name or edit the slug.");
          setIsSubmitting(false);
          return;
        }

        await setDoc(doc(db, "categories", docId), {
          ...categoryData,
          displayOrder: categories.length + 1,
          createdAt: new Date().toISOString()
        });
      }

      setShowModal(false);
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveCategory = async (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === categories.length - 1)) return;
    const swapIndex = direction === "up" ? index - 1 : index + 1;

    // Use current displayOrder or fallback to index
    const currentOrder = typeof categories[index].displayOrder === 'number' ? categories[index].displayOrder : index + 1;
    const swapOrder = typeof categories[swapIndex].displayOrder === 'number' ? categories[swapIndex].displayOrder : swapIndex + 1;

    try {
      await updateDoc(doc(db, "categories", categories[index].id), { displayOrder: swapOrder });
      await updateDoc(doc(db, "categories", categories[swapIndex].id), { displayOrder: currentOrder });
    } catch (e) {
      console.error("Failed to swap display orders:", e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F2F6B]">Categories</h1>
          <p className="text-zinc-500 mt-1">Manage product categories and collections.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-[#0F2F6B] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-900 transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={20} className="text-[#D4AF37]" />
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50/55 text-zinc-500 border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Display Order</th>
                <th className="px-6 py-4 font-semibold">Category Image</th>
                <th className="px-6 py-4 font-semibold">Category Name</th>
                <th className="px-6 py-4 font-semibold">Slug</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">Loading categories...</td>
                </tr>
              ) : categories.length > 0 ? (
                categories.map((cat, index) => (
                  <tr key={cat.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveCategory(index, "up")}
                          disabled={index === 0}
                          className="p-1.5 text-zinc-400 hover:text-[#0F2F6B] disabled:opacity-20 transition-colors cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp size={16} />
                        </button>
                        <button
                          onClick={() => moveCategory(index, "down")}
                          disabled={index === categories.length - 1}
                          className="p-1.5 text-zinc-400 hover:text-[#0F2F6B] disabled:opacity-20 transition-colors cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown size={16} />
                        </button>
                        <span className="text-xs text-zinc-400 font-mono ml-2">#{cat.displayOrder || index + 1}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <img
                        src={cat.imageUrl || "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=100&q=80"}
                        alt={cat.name}
                        className="w-12 h-12 rounded-lg object-cover border border-zinc-100"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#0F2F6B]">{cat.name}</span>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 font-mono text-xs">{cat.slug || cat.id}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${cat.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                        {cat.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-2 text-zinc-400 hover:text-[#0F2F6B] hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center py-6 gap-2">
                      <FolderTree size={36} className="text-zinc-300" />
                      <p className="font-semibold text-zinc-400">No categories found in Firestore</p>
                      <p className="text-xs text-zinc-400">Add some categories using the "Add Category" button.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-[#0F2F6B]">
                {editingId ? "Edit Category" : "Add New Category"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-[#0F2F6B] cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Category Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={e => handleNameChange(e.target.value)}
                    className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none"
                    placeholder="e.g. Rings"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Slug (URL Path)</label>
                  <input
                    required
                    type="text"
                    value={slug}
                    onChange={e => setSlug(generateSlug(e.target.value))}
                    className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm font-mono focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none"
                    placeholder="e.g. rings"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Category Description (Optional)</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none h-20 resize-none"
                    placeholder="Brief description of this collection..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Category Image (Required)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0F2F6B]/10 file:text-[#0F2F6B] hover:file:bg-[#0F2F6B]/20 cursor-pointer"
                  />
                  {imageUrl && !selectedFile && (
                    <div className="mt-2 flex items-center gap-3">
                      <img src={imageUrl} alt="Preview" className="w-12 h-12 object-cover rounded-lg border" />
                      <span className="text-xs text-zinc-400 truncate max-w-[250px]">{imageUrl}</span>
                    </div>
                  )}
                  {selectedFile && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500 font-medium">
                      <ImageIcon size={16} className="text-[#D4AF37]" />
                      <span>New image selected: {selectedFile.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-600 cursor-pointer w-full">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-zinc-300 text-[#0F2F6B] focus:ring-[#0F2F6B]"
                    />
                    <span>Active Category (Visible on Website)</span>
                  </label>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 border border-zinc-200 rounded-xl text-zinc-600 font-semibold text-sm hover:bg-zinc-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#0F2F6B] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Saving...</> : "Save Category"}
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
