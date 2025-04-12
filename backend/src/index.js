import { parseStringPromise } from "xml2js";
// import Entertainment from "../../frontend/src/pages/Entertainment";

const ALLOWED_CATEGORIES = ["sports", "technology", "politics", "health", "business", "entertainment"];
const RSS_FEEDS = {
  sports: "https://rss.punchng.com/v1/category/sports",
  technology: "https://rss.punchng.com/v1/category/technology",
  health: "https://rss.punchng.com/v1/category/health",
  politics: "https://rss.punchng.com/v1/category/politics",
  business: "https://rss.punchng.com/v1/category/business",
  entertainment: "https://rss.punchng.com/v1/category/entertainment",
};

// Helper to fetch and parse RSS
async function fetchRSS(url) {
  try {
    const response = await fetch(url);
    const xml = await response.text();
    const result = await parseStringPromise(xml);

    if (!result?.rss?.channel?.[0]?.item) return [];

    return result.rss.channel[0].item.map((item) => {
      const categoryRaw = item.category?.[0]?.trim().toLowerCase() || "";
      const category = ALLOWED_CATEGORIES.find((label) => categoryRaw.includes(label)) || "";

      return {
        title: item.title?.[0] || "",
        link: item.link?.[0] || "",
        pubDate: item.pubDate?.[0] ? new Date(item.pubDate[0]).toISOString() : "",
        description: item.description?.[0] || "",
        image: item.enclosure?.[0]?.$.url || "",
        category,
      };
    });
  } catch (error) {
    console.error("Error fetching or parsing RSS:", url, error);
    return [];
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    // Home news endpoint
    if (path === "/api/news/home") {
      try {
        let homeNews = [];

        for (const [_, feedUrl] of Object.entries(RSS_FEEDS)) {
          const items = await fetchRSS(feedUrl);
          homeNews.push(...items.slice(0, 8));
        }

        homeNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        return new Response(JSON.stringify(homeNews), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(),
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to fetch home news" }), {
          status: 500,
          headers: corsHeaders(),
        });
      }
    }

    // Category-based news
    if (path.startsWith("/api/news/")) {
      const category = path.split("/").pop().toLowerCase();

      if (!RSS_FEEDS[category]) {
        return new Response(JSON.stringify({ error: "Category not found" }), {
          status: 404,
          headers: corsHeaders(),
        });
      }

      try {
        const newsItems = await fetchRSS(RSS_FEEDS[category]);
        return new Response(JSON.stringify(newsItems.slice(0, 20)), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders(),
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: `Failed to fetch ${category} news` }), {
          status: 500,
          headers: corsHeaders(),
        });
      }
    }

    // Proxy endpoint
    if (path === "/api/proxy") {
      const targetUrl = url.searchParams.get("url");
      if (!targetUrl) {
        return new Response(JSON.stringify({ error: "URL parameter is required" }), {
          status: 400,
          headers: corsHeaders(),
        });
      }

      try {
        const resp = await fetch(targetUrl, {
          headers: { "User-Agent": "Mozilla/5.0" },
        });

        const content = await resp.text();
        return new Response(content, {
          headers: {
            "Content-Type": "text/html",
            ...corsHeaders(),
          },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to fetch full article" }), {
          status: 500,
          headers: corsHeaders(),
        });
      }
    }


// Contact form logic with Resend
// if (path === "/api/contact" && request.method === "POST") {
// 	try {
// 	  const body = await request.json();
// 	  const { name, email, subject, message } = body;
  
// 	  if (!name || !email || !subject || !message) {
// 		return new Response(JSON.stringify({ error: "All fields are required." }), {
// 		  status: 400,
// 		  headers: corsHeaders(),
// 		});
// 	  }
  
//     const emailBody = {
//       from: "support@newstarn.com",
//       to: [env.EMAIL_RECEIVER],
//       subject,
//       text: `From: ${name} <${email}>\n\nSubject: ${subject}\n\nMessage:\n${message}`,
//       reply_to: email,
//       tags: ["contact-form"],
//       metadata: {
//         name,
//         senderEmail: email,
//         source: "contact-form",
//       },
//     };
    
  
// 	  const resendResp = await fetch("https://api.resend.com/emails", {
// 		method: "POST",
// 		headers: {
// 		  "Authorization": `Bearer ${env.RESEND_KEY}`,
// 		  "Content-Type": "application/json",
// 		},
// 		body: JSON.stringify(emailBody),
// 	  });
  
// 	  if (!resendResp.ok) {
// 		const errorText = await resendResp.text();
// 		console.error("Resend API error:", errorText);
// 		return new Response(JSON.stringify({ error: "Failed to send message." }), {
// 		  status: resendResp.status,
// 		  headers: corsHeaders(),
// 		});
// 	  }
  
// 	  return new Response(JSON.stringify({ success: true, message: "Message sent successfully!" }), {
// 		headers: corsHeaders(),
// 	  });
// 	} catch (err) {
// 	  console.error("Contact form error:", err);
// 	  return new Response(JSON.stringify({ error: "Unexpected server error." }), {
// 		status: 500,
// 		headers: corsHeaders(),
// 	  });
// 	}
//   }

// Assuming you have already imported necessary modules like 'fetch', 'corsHeaders', etc.

if (path === "/api/contact" && request.method === "POST") {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate that all fields are provided
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: "All fields are required." }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    // Construct the email body
    const emailBody = {
      from: "support@newstarn.com", // Sender email
      to: [env.EMAIL_RECEIVER], // Receiver email (set in your env config)
      subject,
      text: `From: ${name} <${email}>\n\nSubject: ${subject}\n\nMessage:\n${message}`,
      reply_to: email,
      tags: ["contact-form"],
      metadata: {
        name,
        senderEmail: email,
        source: "contact-form",
      },
    };

    // Call the Resend API to send the email
    const resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_KEY}`, // Resend API Key
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailBody),
    });

    if (!resendResp.ok) {
      const errorText = await resendResp.text();
      console.error("Resend API error:", errorText);
      return new Response(JSON.stringify({ error: "Failed to send message." }), {
        status: resendResp.status,
        headers: corsHeaders(),
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Message sent successfully!" }), {
      headers: corsHeaders(),
    });
  } catch (err) {
    console.error("Contact form error:", err);
    return new Response(JSON.stringify({ error: "Unexpected server error." }), {
      status: 500,
      headers: corsHeaders(),
    });
  }
}

  
  

    // Default response
    return new Response("Hello from FeedFusion Cloudflare Worker!", {
      headers: {
        "Content-Type": "text/plain",
        ...corsHeaders(),
      },
    });
  },
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
