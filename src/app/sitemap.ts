import { MetadataRoute } from "next";
import { MOCK_PRODUCTS } from "@/lib/mockData";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://elanoragems.com";

  // Dynamic product entries sitemap
  const productEntries = MOCK_PRODUCTS.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8
  }));

  // Categories sitemap
  const categories = [
    "rings", 
    "earrings", 
    "necklaces", 
    "bracelets", 
    "anklets", 
    "pendants", 
    "toe-rings", 
    "kada", 
    "gift-sets"
  ];
  
  const categoryEntries = categories.map((c) => ({
    url: `${baseUrl}/collections?category=${c}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0
    },
    {
      url: `${baseUrl}/new-arrivals`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `${baseUrl}/bestsellers`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `${baseUrl}/wishlist`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5
    },
    ...productEntries,
    ...categoryEntries
  ];
}
