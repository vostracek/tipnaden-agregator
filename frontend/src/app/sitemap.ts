import { MetadataRoute } from "next";
import { getEvents, getCategories } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://tipnaden.cz";

  try {
    const eventsResponse = await getEvents({ limit: 1000 });
    const events = eventsResponse.data || [];
    const categories = await getCategories();

    // Statické stránky
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${baseUrl}/events`,
        lastModified: new Date().toISOString(),
        changeFrequency: "daily",
        priority: 0.9,
      },
    ];

    // Dynamické stránky - události
    const eventPages: MetadataRoute.Sitemap = events.map((event) => {
      // Bezpečné parsování data
      let lastModified = new Date().toISOString();
      try {
        if (event.updatedAt) {
          lastModified = new Date(event.updatedAt).toISOString();
        } else if (event.createdAt) {
          lastModified = new Date(event.createdAt).toISOString();
        }
      } catch  {
        // Pokud datum je invalid, použij current date
        lastModified = new Date().toISOString();
      }

      return {
        url: `${baseUrl}/events/${event.seo.slug}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: event.isFeatured ? 0.8 : 0.7,
      };
    });

    // Dynamické stránky - kategorie
    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/events?category=${category.slug}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));

    return [...staticPages, ...eventPages, ...categoryPages];
  } catch (error) {
    console.error("Error generating sitemap:", error);

    // Fallback
    return [
      {
        url: baseUrl,
        lastModified: new Date().toISOString(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${baseUrl}/events`,
        lastModified: new Date().toISOString(),
        changeFrequency: "daily",
        priority: 0.9,
      },
    ];
  }
}