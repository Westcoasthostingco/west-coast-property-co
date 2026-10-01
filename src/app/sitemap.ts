import type { MetadataRoute } from "next";
import { getProperties } from "@/lib/data";
import { absUrl, propertyPhoto, propertyUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const properties = await getProperties();

  const statics: MetadataRoute.Sitemap = [
    { url: absUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absUrl("/properties"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absUrl("/services"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absUrl("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: absUrl("/legal/privacy"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: absUrl("/legal/terms"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: absUrl("/legal/policies"), lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const homes: MetadataRoute.Sitemap = properties.map((p) => {
    const photo = propertyPhoto(p.slug);
    return {
      url: propertyUrl(p),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
      ...(photo ? { images: [absUrl(photo)] } : {}),
    };
  });

  return [...statics, ...homes];
}
