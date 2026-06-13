import { getCollection } from "astro:content";

export async function GET() {
  const site = "https://deratservis.cz";
  const blogPosts = (await getCollection("blog")).filter((post) => !post.data.draft);
  const services = await getCollection("services");
  const staticPaths = ["/", ...(blogPosts.length > 0 ? ["/blog/"] : []), "/ochrana-osobnich-udaju/"];

  const urls = [
    ...staticPaths,
    ...blogPosts.map((post) => `/blog/${post.slug}/`),
    ...services.map((service) => `/sluzby/${service.slug}/`)
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${site}${url}</loc></url>`).join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}
