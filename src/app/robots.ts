import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/checkout", "/account", "/login", "/wishlist"],
    },
    sitemap: "https://elanoragems.in/sitemap.xml",
  };
}
