"use client";

import React, { useState, useEffect, Suspense, use } from "react";
import { useSearchParams } from "next/navigation";
import { Filter, ArrowUpDown } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { ProductCard } from "@/components/ProductCard";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface PageProps {
  params: Promise<{ category: string }>;
}

function CategoryCollectionsContent({ params }: PageProps) {
  const resolvedParams = use(params);
  const categoryFilter = resolvedParams.category;
  const searchParams = useSearchParams();

  // Active filters from URL query
  const colorFilter = searchParams.get("color");
  const genderFilter = searchParams.get("gender");
  const occasionFilter = searchParams.get("occasion");
  const priceFilter = searchParams.get("price");
  const searchQuery = searchParams.get("search");
  const sortOptionParam = searchParams.get("sort") || "default";

  // Local state
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [sortedProducts, setSortedProducts] = useState<any[]>([]);
  const [sortOption, setSortOption] = useState(sortOptionParam);
  const [loading, setLoading] = useState(true);

  // Sync sortOption state if query param changes
  useEffect(() => {
    if (sortOptionParam) {
      setSortOption(sortOptionParam);
    }
  }, [sortOptionParam]);

  // Fetch products from Firestore
  useEffect(() => {
    const productsRef = collection(db, "products");
    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      const prods: any[] = [];
      snapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() });
      });
      setProducts(prods);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch categories to get exact display name
  useEffect(() => {
    const categoriesRef = collection(db, "categories");
    const unsubscribe = onSnapshot(categoriesRef, (snapshot) => {
      const cats: any[] = [];
      snapshot.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() });
      });
      setCategories(cats);
    });
    return () => unsubscribe();
  }, []);

  const currentCategoryDoc = categories.find(
    (c) => c.slug?.toLowerCase() === categoryFilter.toLowerCase() || c.id?.toLowerCase() === categoryFilter.toLowerCase()
  );
  const categoryDisplayName = currentCategoryDoc ? currentCategoryDoc.name : categoryFilter;

  // Filter and Sort
  useEffect(() => {
    if (loading) return;
    let filtered = [...products];

    // 1. Filter by category (from dynamic slug parameter)
    if (categoryFilter) {
      filtered = filtered.filter(
        (p) =>
          p.category?.toLowerCase() === categoryFilter.toLowerCase() ||
          p.category?.toLowerCase() === currentCategoryDoc?.id?.toLowerCase()
      );
    }

    // 2. Filter by metal color
    if (colorFilter) {
      filtered = filtered.filter((p) => p.color?.toLowerCase() === colorFilter.toLowerCase());
    }

    // 3. Filter by gender
    if (genderFilter) {
      filtered = filtered.filter((p) => p.gender?.toLowerCase() === genderFilter.toLowerCase());
    }

    // 4. Filter by occasion
    if (occasionFilter) {
      filtered = filtered.filter((p) => p.occasion?.toLowerCase() === occasionFilter.toLowerCase());
    }

    // 5. Filter by price budget
    if (priceFilter) {
      if (priceFilter === "999") {
        filtered = filtered.filter((p) => p.price <= 999);
      } else if (priceFilter === "1999") {
        filtered = filtered.filter((p) => p.price <= 1999);
      } else if (priceFilter === "2999") {
        filtered = filtered.filter((p) => p.price <= 2999);
      } else if (priceFilter === "premium") {
        filtered = filtered.filter((p) => p.price >= 3000);
      }
    }

    // 6. Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 7. Sort
    if (sortOption === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortOption === "rating") {
      filtered.sort((a, b) => (b.rating || 5.0) - (a.rating || 5.0));
    } else if (sortOption === "bestseller") {
      filtered = filtered.filter((p) => p.isBestseller === true);
      filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else {
      filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    setSortedProducts(filtered);
  }, [products, categoryFilter, currentCategoryDoc, colorFilter, genderFilter, occasionFilter, priceFilter, searchQuery, sortOption, loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 flex-grow w-full">
        <div className="w-12 h-12 border-2 border-secondary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-serif text-sm font-semibold tracking-widest text-zinc-500 uppercase">Loading Ornaments...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
      {/* Title */}
      <div className="border-b border-zinc-200 pb-5 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between justify-center gap-4">
        <div>
          <span className="text-secondary text-xs font-bold uppercase tracking-widest">
            {categoryDisplayName} Catalogue
          </span>
          <h1 className="font-serif text-3xl font-bold text-primary mt-1 capitalize">
            {categoryDisplayName} Collection
            {colorFilter && ` - ${colorFilter.replace("-", " ")}`}
            {genderFilter && ` - ${genderFilter}`}
            {occasionFilter && ` - ${occasionFilter}`}
            {searchQuery && ` - Results for "${searchQuery}"`}
          </h1>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-600 bg-white border border-zinc-200 px-3 py-2 rounded-lg shadow-sm">
          <ArrowUpDown size={14} className="text-secondary" />
          <span>Sort By:</span>
          <select 
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)} 
            className="outline-none bg-transparent cursor-pointer font-bold text-primary"
          >
            <option value="default">Featured</option>
            <option value="bestseller">Bestseller First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Catalog items */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <Filter size={48} className="text-zinc-200 mx-auto" />
          <p className="font-serif text-sm font-semibold text-zinc-400">No matching ornaments found</p>
          <p className="text-xs text-zinc-400 max-w-xs mx-auto">Try clearing search filters or browse other popular collections.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryCollectionsPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <Header />
      <Suspense fallback={
        <div className="flex-grow flex flex-col items-center justify-center py-24">
          <div className="w-12 h-12 border-2 border-secondary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-serif text-sm font-semibold tracking-widest text-zinc-500 uppercase">Loading Ornaments...</p>
        </div>
      }>
        <CategoryCollectionsContent params={params} />
      </Suspense>
      <Footer />
      <CartDrawer />
    </div>
  );
}
