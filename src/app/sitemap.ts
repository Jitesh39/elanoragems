import { MetadataRoute } from "next";
import { adminDb } from "@/lib/firebaseAdmin";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

export const revalidate = 86400; // Cache sitemap for 24 hours to optimize performance and reduce Firestore read usage

// Static last modified date for static website pages to avoid search engines re-indexing unchanged content daily
const SITE_LAST_MODIFIED = new Date("2026-06-18");

interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate?: () => Date;
}

interface Product {
  slug: string;
  createdAt?: FirestoreTimestamp | string | number;
  updatedAt?: FirestoreTimestamp | string | number;
}

interface Category {
  id: string;
  slug?: string;
  isActive?: boolean;
  createdAt?: FirestoreTimestamp | string | number;
  updatedAt?: FirestoreTimestamp | string | number;
}

// Helper function to safely convert Firestore Timestamps or other date formats into a standard JS Date object
function parseFirestoreDate(ts: FirestoreTimestamp | string | number | undefined): Date {
  const fallback = new Date();
  if (!ts) return fallback;
  
  let date: Date;
  
  if (typeof ts === "object") {
    if (typeof ts.toDate === "function") {
      try {
        date = ts.toDate();
      } catch {
        return fallback;
      }
    } else if (typeof ts.seconds === "number") {
      date = new Date(ts.seconds * 1000);
    } else {
      date = fallback;
    }
  } else if (typeof ts === "string" || typeof ts === "number") {
    date = new Date(ts);
  } else {
    date = fallback;
  }
  
  // Guard against invalid Date results (e.g. from parsing strings like "abc")
  return isNaN(date.getTime()) ? fallback : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://elanoragems.in";

  let productEntries: MetadataRoute.Sitemap = [];
  let categoryEntries: MetadataRoute.Sitemap = [];

  try {
    // Optimization: Use Firestore .select() to only fetch fields required for sitemap generation (slug, updatedAt, createdAt)
    // This reduces data transfer volume and Firestore document read memory usage significantly for large catalogs.
    const productsSnapshot = await adminDb
      .collection("products")
      .select("slug", "updatedAt", "createdAt")
      .get();

    const products: Product[] = [];
    productsSnapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data() as Omit<Product, "id">;
      if (data && data.slug) {
        products.push(data);
      }
    });

    productEntries = products.map((p) => {
      // Use updatedAt as the primary lastModified date, fallback to createdAt or current Date if missing
      const lastModDate = p.updatedAt ? p.updatedAt : (p.createdAt || undefined);
      return {
        url: `${baseUrl}/product/${p.slug}`,
        lastModified: parseFirestoreDate(lastModDate),
        changeFrequency: "weekly" as const,
        priority: 0.8
      };
    });

    // Optimization: Select only 'slug', 'isActive', 'updatedAt', and 'createdAt' fields for categories
    const categoriesSnapshot = await adminDb
      .collection("categories")
      .select("slug", "isActive", "updatedAt", "createdAt")
      .get();

    const categories: Category[] = [];
    categoriesSnapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data() as Omit<Category, "id">;
      if (data) {
        categories.push({ id: doc.id, ...data });
      }
    });

    categoryEntries = categories
      .filter((c) => c.isActive !== false)
      .map((c) => {
        const lastModDate = c.updatedAt ? c.updatedAt : (c.createdAt || undefined);
        return {
          // SEO improvement: Use clean paths (/collections/rings) instead of query strings (/collections?category=rings)
          url: `${baseUrl}/collections/${c.slug || c.id}`,
          lastModified: parseFirestoreDate(lastModDate),
          changeFrequency: "weekly" as const,
          priority: 0.7
        };
      });
  } catch (error) {
    console.error("Sitemap generation error:", error);
  }

  // Define static, standard public pages that should be indexed by search engines
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "daily" as const,
      priority: 1.0
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "daily" as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/new-arrivals`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "daily" as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/bestsellers`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "daily" as const,
      priority: 0.9
    },
    {
      url: `${baseUrl}/about`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.7
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.7
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "weekly" as const,
      priority: 0.6
    },
    {
      url: `${baseUrl}/policies/privacy`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.5
    },
    {
      url: `${baseUrl}/policies/terms`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.5
    },
    {
      url: `${baseUrl}/policies/refund`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.5
    },
    {
      url: `${baseUrl}/policies/shipping`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.5
    },
    {
      url: `${baseUrl}/policies/terms-of-use`,
      lastModified: SITE_LAST_MODIFIED,
      changeFrequency: "monthly" as const,
      priority: 0.5
    }
  ];

  return [...staticPages, ...productEntries, ...categoryEntries];
}
