"use client";

import React, { useState, useEffect } from "react";
import { collection, onSnapshot, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Plus, Edit, Trash2, Search, Filter, X, Loader2, Image as ImageIcon } from "lucide-react";

export default function ManageProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [showProductForm, setShowProductForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [category, setCategory] = useState("");
  const [material, setMaterial] = useState("925 Sterling Silver");
  const [metalColor, setMetalColor] = useState("sterling-silver");
  const [gender, setGender] = useState("women");
  const [occasion, setOccasion] = useState("everyday");
  const [stock, setStock] = useState("10");
  const [description, setDescription] = useState("");
  const [isBestseller, setIsBestseller] = useState(false);

  // Image states
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [cloudinaryPublicIds, setCloudinaryPublicIds] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Specifications state
  const [specifications, setSpecifications] = useState<{ label: string; value: string }[]>([]);

  // Sizes states
  const [hasMultipleSizes, setHasMultipleSizes] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [customSizes, setCustomSizes] = useState("");

  // Load Categories & Products from Firestore
  useEffect(() => {
    // 1. Fetch Categories
    const categoriesRef = collection(db, "categories");
    const unsubCats = onSnapshot(categoriesRef, (snapshot) => {
      const cats: any[] = [];
      snapshot.forEach(doc => {
        cats.push({ id: doc.id, ...doc.data() });
      });
      // Sort active first
      cats.sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
      setDbCategories(cats);
      if (cats.length > 0) {
        setCategory(prev => prev || cats[0].slug || cats[0].id);
      }
    });

    // 2. Fetch Products
    const productsRef = collection(db, "products");
    const unsubProds = onSnapshot(productsRef, (snapshot) => {
      const prods: any[] = [];
      snapshot.forEach(doc => {
        prods.push({ id: doc.id, ...doc.data() });
      });
      // Sort by newest first
      prods.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setProducts(prods);
      setIsLoading(false);
    });

    return () => {
      unsubCats();
      unsubProds();
    };
  }, []);

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

  const handleDelete = async (product: any) => {
    if (confirm(`Are you sure you want to delete the product "${product.name}"?`)) {
      try {
        const publicIds = product.cloudinaryPublicIds || (product.cloudinaryPublicId ? [product.cloudinaryPublicId] : []);
        if (publicIds.length > 0) {
          for (const pid of publicIds) {
            await deleteCloudinaryAsset(pid);
          }
        }
        await deleteDoc(doc(db, "products", product.id));
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product");
      }
    }
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setOriginalPrice("");
    setCategory(dbCategories[0]?.slug || dbCategories[0]?.id || "");
    setMaterial("925 Sterling Silver");
    setMetalColor("sterling-silver");
    setGender("women");
    setOccasion("everyday");
    setStock("10");
    setDescription("");
    setIsBestseller(false);
    setImagesList([]);
    setCloudinaryPublicIds([]);
    setSelectedFiles([]);
    setSpecifications([]);
    setHasMultipleSizes(false);
    setSelectedSizes([]);
    setCustomSizes("");
    setShowProductForm(false);
  };

  const handleEditClick = (product: any) => {
    setEditingId(product.id);
    setName(product.name || "");
    setPrice(product.price ? String(product.price) : "");
    setOriginalPrice(product.originalPrice ? String(product.originalPrice) : "");
    setCategory(product.category || "");
    setMaterial(product.material || "925 Sterling Silver");
    setMetalColor(product.color || "sterling-silver");
    setGender(product.gender || "women");
    setOccasion(product.occasion || "everyday");
    setStock(product.stock ? String(product.stock) : "10");
    setDescription(product.description || "");
    setIsBestseller(product.isBestseller || false);
    setImagesList(product.images || (product.image ? [product.image] : []));
    setCloudinaryPublicIds(product.cloudinaryPublicIds || (product.cloudinaryPublicId ? [product.cloudinaryPublicId] : []));
    setSelectedFiles([]);
    setSpecifications(product.specifications || []);
    setHasMultipleSizes(product.hasMultipleSizes || false);

    // Parse sizes
    const ringSizes = ["6", "7", "8", "9", "10", "11", "12"];
    const productSizes = product.sizes || [];
    const checked = productSizes.filter((s: string) => ringSizes.includes(s));
    const custom = productSizes.filter((s: string) => !ringSizes.includes(s));

    setSelectedSizes(checked);
    setCustomSizes(custom.join(", "));
    setShowProductForm(true);
  };

  const handleAddSpecRow = () => {
    setSpecifications([...specifications, { label: "", value: "" }]);
  };

  const handleSpecChange = (index: number, field: "label" | "value", value: string) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const handleRemoveSpecRow = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const handleSizeToggle = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Product name is required");
    if (!price) return alert("Product price is required");

    setIsSubmitting(true);
    try {
      let uploadedUrls: string[] = [];
      let uploadedPublicIds: string[] = [];

      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const uploadResult = await uploadFile(file);
          uploadedUrls.push(uploadResult.url);
          uploadedPublicIds.push(uploadResult.publicId);
        }
      }

      const finalImages = [...imagesList, ...uploadedUrls];
      const finalPublicIds = [...cloudinaryPublicIds, ...uploadedPublicIds];

      const generatedSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Parse sizes
      let finalSizes: string[] = [];
      const isRingCat = category?.toLowerCase() === "rings" || category?.toLowerCase() === "ring" || category?.toLowerCase().includes("ring");
      if (isRingCat && hasMultipleSizes) {
        const customList = customSizes
          .split(",")
          .map(s => s.trim())
          .filter(Boolean);
        finalSizes = Array.from(new Set([...selectedSizes, ...customList]));
      }

      const productData = {
        name,
        slug: generatedSlug,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        category,
        material,
        color: metalColor,
        gender,
        occasion,
        stock: Number(stock),
        images: finalImages,
        image: finalImages[0] || "", // backward compatibility helper
        cloudinaryPublicIds: finalPublicIds,
        cloudinaryPublicId: finalPublicIds[0] || "", // backward compatibility helper
        isBestseller,
        description,
        specifications: specifications.filter(s => s.label.trim() && s.value.trim()),
        sizes: finalSizes,
        hasMultipleSizes: isRingCat ? hasMultipleSizes : false,
        rating: 5.0, // default rating
        reviewsCount: 0,
        updatedAt: new Date().toISOString()
      };

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), productData);
      } else {
        const docRef = await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: new Date().toISOString()
        });

        // Trigger email notification to all active subscribers after successful database save
        try {
          const categoryName = dbCategories.find(c => c.slug === productData.category || c.id === productData.category)?.name || productData.category;
          const emailPayload = {
            name: productData.name,
            price: productData.price,
            category: categoryName,
            description: productData.description,
            image: productData.image,
            slug: productData.slug
          };

          await fetch("/api/send-newsletter", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ product: emailPayload })
          });
        } catch (emailErr) {
          console.error("Failed to trigger newsletter broadcast:", emailErr);
        }
      }

      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product");
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
          onClick={() => {
            resetForm();
            setShowProductForm(true);
          }}
          className="bg-[#0F2F6B] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-900 transition-colors shadow-sm cursor-pointer"
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
                  <td className="px-6 py-4 font-bold text-[#0F2F6B]">₹{product.price?.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${Number(product.stock) > 10 ? 'bg-emerald-100 text-emerald-700' : Number(product.stock) > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                      {product.stock || "In Stock"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="p-2 text-zinc-400 hover:text-[#0F2F6B] hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">No products found in Firestore.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-[#0F2F6B]">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={() => setShowProductForm(false)} className="text-zinc-400 hover:text-[#0F2F6B] cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Product Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none"
                    placeholder="e.g. Elegant Silver Ring"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Price (₹)</label>
                    <input
                      required
                      type="number"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none"
                      placeholder="e.g. 1299"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Original Price (Optional)</label>
                    <input
                      type="number"
                      value={originalPrice}
                      onChange={e => setOriginalPrice(e.target.value)}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none"
                      placeholder="e.g. 1999"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Stock</label>
                    <input
                      required
                      type="number"
                      value={stock}
                      onChange={e => setStock(e.target.value)}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none"
                      placeholder="e.g. 10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Category</label>
                    <select
                      required
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none"
                    >
                      {dbCategories.length > 0 ? dbCategories.map((cat) => (
                        <option key={cat.id} value={cat.slug || cat.id}>{cat.name}</option>
                      )) : (
                        <option value="">No Categories Available</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Material</label>
                    <select
                      value={material}
                      onChange={e => setMaterial(e.target.value)}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none"
                    >
                      <option value="925 Sterling Silver">925 Sterling Silver</option>
                      <option value="18K Gold Plated Brass">18K Gold Plated Brass</option>
                      <option value="Rose Gold Plated Silver">Rose Gold Plated Silver</option>
                      <option value="Oxidized Silver">Oxidized Silver</option>
                      <option value="Platinum Plated">Platinum Plated</option>
                      <option value="Alloy and Silver">Alloy and Silver</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Metal Color</label>
                    <select
                      value={metalColor}
                      onChange={e => setMetalColor(e.target.value)}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none"
                    >
                      <option value="sterling-silver">Sterling Silver</option>
                      <option value="gold-plated">Gold Plated</option>
                      <option value="rose-gold">Rose Gold</option>
                      <option value="oxidised-silver">Oxidised Silver</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none"
                    >
                      <option value="women">Women</option>
                      <option value="men">Men</option>
                      <option value="kids">Kids</option>
                      <option value="unisex">Unisex</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Occasion</label>
                    <select
                      value={occasion}
                      onChange={e => setOccasion(e.target.value)}
                      className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none"
                    >
                      <option value="everyday">Everyday</option>
                      <option value="wedding">Wedding</option>
                      <option value="office">Office</option>
                      <option value="festive">Festive</option>
                      <option value="party">Party</option>
                      <option value="gift">Gift</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-600 cursor-pointer w-full">
                    <input
                      type="checkbox"
                      checked={isBestseller}
                      onChange={(e) => setIsBestseller(e.target.checked)}
                      className="rounded border-zinc-300 text-[#0F2F6B] focus:ring-[#0F2F6B]"
                    />
                    <span>Highlight as Bestseller on Website</span>
                  </label>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Product Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] focus:ring-1 focus:ring-[#0F2F6B] outline-none h-24 resize-none"
                    placeholder="Provide premium description of the jewellery pieces..."
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase block mb-1">Product Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) {
                        setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)]);
                      }
                    }}
                    className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0F2F6B]/10 file:text-[#0F2F6B] hover:file:bg-[#0F2F6B]/20 cursor-pointer"
                  />

                  {/* Images preview row */}
                  {(imagesList.length > 0 || selectedFiles.length > 0) && (
                    <div className="mt-3 grid grid-cols-4 gap-3">
                      {imagesList.map((url, idx) => (
                        <div key={`existing-${idx}`} className="relative aspect-square border border-zinc-150 rounded-xl overflow-hidden bg-zinc-50 group shadow-sm">
                          <img src={url} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setImagesList(imagesList.filter((_, i) => i !== idx));
                              setCloudinaryPublicIds(cloudinaryPublicIds.filter((_, i) => i !== idx));
                            }}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow shadow-red-500/20 cursor-pointer"
                            title="Remove Saved Image"
                          >
                            <X size={12} />
                          </button>
                          <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1 py-0.5 rounded font-mono">
                            Saved #{idx + 1}
                          </span>
                        </div>
                      ))}

                      {selectedFiles.map((file, idx) => {
                        const localUrl = URL.createObjectURL(file);
                        return (
                          <div key={`new-${idx}`} className="relative aspect-square border border-zinc-150 rounded-xl overflow-hidden bg-zinc-50 group shadow-sm">
                            <img src={localUrl} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedFiles(selectedFiles.filter((_, i) => i !== idx));
                              }}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow shadow-red-500/20 cursor-pointer"
                              title="Remove New Image"
                            >
                              <X size={12} />
                            </button>
                            <span className="absolute bottom-1 left-1 bg-[#D4AF37] text-[#0F2F6B] text-[8px] px-1 py-0.5 rounded font-bold">
                              New
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Technical Specifications Section */}
                <div className="space-y-2 border border-zinc-100 rounded-2xl p-4 bg-zinc-50/25">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Specifications & Details</label>
                    <button
                      type="button"
                      onClick={handleAddSpecRow}
                      className="text-xs font-bold text-[#0F2F6B] hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                    >
                      + Add Row
                    </button>
                  </div>
                  <div className="space-y-2">
                    {specifications.map((spec, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Label (e.g. Weight)"
                          value={spec.label}
                          onChange={(e) => handleSpecChange(idx, "label", e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-white focus:border-[#0F2F6B] outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. 4.20 Grams)"
                          value={spec.value}
                          onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-zinc-200 rounded-lg text-xs bg-white focus:border-[#0F2F6B] outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecRow(idx)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {specifications.length === 0 && (
                      <p className="text-xs text-zinc-400 text-center py-2 italic">No specifications added yet.</p>
                    )}
                  </div>
                </div>

                {/* Ring Sizes Section */}
                {(category === "rings" || category === "ring" || category?.toLowerCase().includes("ring")) && (
                  <div className="space-y-3 p-4 bg-zinc-50/50 rounded-2xl border border-zinc-100">
                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasMultipleSizes}
                        onChange={(e) => setHasMultipleSizes(e.target.checked)}
                        className="rounded border-zinc-300 text-[#0F2F6B] focus:ring-[#0F2F6B]"
                      />
                      <span>Has Multiple Sizes</span>
                    </label>

                    {hasMultipleSizes && (
                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1.5">Select Common Sizes</label>
                          <div className="flex flex-wrap gap-2">
                            {["6", "7", "8", "9", "10", "11", "12"].map((sz) => {
                              const isChecked = selectedSizes.includes(sz);
                              return (
                                <label key={sz} className={`flex items-center gap-1.5 text-xs text-zinc-600 cursor-pointer bg-white px-2.5 py-1.5 border rounded-lg hover:bg-zinc-50 transition-colors ${isChecked ? 'border-primary ring-1 ring-primary' : 'border-zinc-200'}`}>
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleSizeToggle(sz)}
                                    className="rounded border-zinc-300 text-[#0F2F6B] hidden"
                                  />
                                  <span className={isChecked ? "font-bold text-[#0F2F6B]" : ""}>{sz}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Add custom/other sizes (comma-separated)</label>
                          <input
                            type="text"
                            placeholder="e.g. 5, 13, 14"
                            value={customSizes}
                            onChange={(e) => setCustomSizes(e.target.value)}
                            className="w-full px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:border-[#0F2F6B] outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setShowProductForm(false)}
                    className="px-5 py-2.5 border border-zinc-200 rounded-xl text-zinc-600 font-semibold text-sm hover:bg-zinc-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#0F2F6B] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-900 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
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
