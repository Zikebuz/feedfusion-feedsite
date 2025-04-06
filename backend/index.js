export default {
    async fetch(request) {
      const url = new URL(request.url);
      const path = url.pathname;
  
      // Handle news API route
      if (path.startsWith("/api/news")) {
        return fetchNews(url);
      } 
      // Handle proxy API route
      else if (path.startsWith("/api/proxy")) {
        return fetchProxy(url);
      } 
      // Handle contact form route
      else if (path.startsWith("/api/contact")) {
        return sendContactForm(request);
      } 
      // Return 404 for unknown routes
      else {
        return new Response("Not Found", { status: 404 });
      }
    },
  };
  
  // Fetch RSS News Feeds
  async function fetchNews(url) {
    const categories = ["sports", "technology", "politics", "health", "business"];
    const feeds = {
      sports: "https://rss.punchng.com/v1/category/sports",
      technology: "https://rss.punchng.com/v1/category/technology",
      health: "https://rss.punchng.com/v1/category/health",
      politics: "https://rss.punchng.com/v1/category/politics",
      business: "https://rss.punchng.com/v1/category/business",
    };
  
    const category = url.pathname.split("/").pop();
    if (!categories.includes(category)) {
      return new Response(JSON.stringify({ error: "Invalid category" }), { status: 400 });
    }
  
    try {
      const response = await fetch(feeds[category]);
      const text = await response.text();
      return new Response(text, { headers: { "Content-Type": "application/xml" } });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to fetch news" }), { status: 500 });
    }
  }
  
  // Proxy Route
  async function fetchProxy(url) {
    const targetUrl = url.searchParams.get("url");
    if (!targetUrl) {
      return new Response(JSON.stringify({ error: "Missing URL parameter" }), { status: 400 });
    }
    try {
      const response = await fetch(targetUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
      const data = await response.text();
      return new Response(data, { headers: { "Content-Type": "text/html" } });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Failed to fetch article" }), { status: 500 });
    }
  }
  
  // Contact Form Handler
  async function sendContactForm(request) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }
  
    const { name, email, subject, message } = await request.json();
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: "All fields required" }), { status: 400 });
    }
  
    // Replace with Cloudflare Email API or an external service
    const emailBody = `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage: ${message}`;
    console.log("Email Sent:", emailBody);
  
    return new Response(JSON.stringify({ success: true, message: "Message sent!" }), { status: 200 });
  }
  