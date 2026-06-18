import { MetadataRoute } from "next";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://elanoragems.in";

  let productEntries: any[] = [];
  let categoryEntries: any[] = [];

  try {
    const productsSnapshot = await getDocs(collection(db, "products"));
    const products: any[] = [];
    productsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data && data.slug) {
        products.push(data);
      }
    });
    productEntries = products.map((p) => ({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8
    }));

    const categoriesSnapshot = await getDocs(collection(db, "categories"));
    const categories: any[] = [];
    categoriesSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data) {
        categories.push({ id: doc.id, ...data });
      }
    });
    categoryEntries = categories
      .filter((c) => c.isActive !== false)
      .map((c) => ({
        url: `${baseUrl}/collections?category=${c.slug || c.id}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7
      }));
  } catch (error) {
    console.error("Sitemap generation error:", error);
  }

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
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6
    },
    {
      url: `${baseUrl}/policies/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${baseUrl}/policies/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${baseUrl}/policies/refund`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${baseUrl}/policies/shipping`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5
    },
    {
      url: `${baseUrl}/policies/terms-of-use`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5
    },
    ...productEntries,
    ...categoryEntries
  ];
}
