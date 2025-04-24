// import { parseStringPromise } from "xml2js";

// const ALLOWED_CATEGORIES = ["sports", "entertainment", "health", "politics", "technology", "business"];

// const RSS_FEEDS = {
//   sports: "https://www.channelstv.com/category/sports/feed/",
//   entertainment: "https://www.channelstv.com/category/entertainment/feed/",
//   health: "https://www.channelstv.com/category/health/feed/",
//   politics: "https://www.channelstv.com/category/politics/feed/",
//   technology: "https://www.channelstv.com/category/info-tech/feed/",
//   business: "https://www.channelstv.com/category/business/feed/",
// };

// function corsHeaders() {
//   return {
//     "Access-Control-Allow-Origin": "*",
//     "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//     "Access-Control-Allow-Headers": "Content-Type",
//   };
// }

// function isValidImageUrl(url) {
//   return (
//     typeof url === "string" &&
//     url.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) &&
//     !url.includes("youtube.com") &&
//     !url.includes("youtu.be") &&
//     !url.includes("player.vimeo.com")
//   );
// }

// async function extractImageAndCaptionFromArticle(link) {
//   try {
//     const res = await fetch(link, {
//       headers: { "User-Agent": "Mozilla/5.0" },
//     });
//     const html = await res.text();
//     const figureMatch = html.match(/<figure[^>]*>([\s\S]*?)<\/figure>/i);
//     if (figureMatch) {
//       const imgMatch = figureMatch[1].match(/<img[^>]*src=["']([^"']+)["']/i);
//       const captionMatch = figureMatch[1].match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
//       return {
//         image: imgMatch ? imgMatch[1] : "",
//         figcaption: captionMatch ? captionMatch[1].trim() : "",
//       };
//     }
//   } catch (err) {
//     console.error("Failed to fetch article HTML:", link, err);
//   }
//   return { image: "", figcaption: "" };
// }

// async function fetchRSS(url) {
//   try {
//     const response = await fetch(url, {
//       headers: { "User-Agent": "Mozilla/5.0" },
//     });
//     const xml = await response.text();
//     const parsed = await parseStringPromise(xml);

//     const items = parsed?.rss?.channel?.[0]?.item || [];
//     console.log(`Fetched ${items.length} items from: ${url}`);

//     return await Promise.all(
//       items.map(async (item, index) => {
//         const categoryRaw = item.category?.[0]?.toLowerCase() || "";
//         const matchedCategory = ALLOWED_CATEGORIES.find((c) => categoryRaw.includes(c)) || "";

//         console.log(`Item ${index + 1}: Category Raw → "${categoryRaw}" | Matched → "${matchedCategory}"`);

//         const mediaImage = item["media:content"]?.[0]?.$?.url || "";
//         const description = item.description?.[0] || "";
//         const contentEncoded = item["content:encoded"]?.[0] || "";
//         const link = item.link?.[0] || "";

//         let image = mediaImage;
//         let figcaption = "";

//         if (!isValidImageUrl(image)) {
//           const fallback = await extractImageAndCaptionFromArticle(link);
//           if (isValidImageUrl(fallback.image)) {
//             image = fallback.image;
//             figcaption = fallback.figcaption;
//           } else {
//             image = "https://placehold.co/800x450";
//           }
//         }

//         // Extract all <p> tags from content:encoded
//         const contentParagraphs = (() => {
//           const cleanedContent = contentEncoded.replace(/<!\[CDATA\[|\]\]>/g, "");
//           const pMatches = cleanedContent.match(/<p[^>]*>.*?<\/p>/g);
//           return pMatches ? pMatches : [];
//         })();

//         return {
//           title: item.title?.[0] || "",
//           link,
//           pubDate: item.pubDate?.[0] ? new Date(item.pubDate[0]).toISOString() : "",
//           description: (() => {
//             const matches = description.match(/<p[^>]*>.*?<\/p>/g);
//             return matches && matches.length > 0 ? matches[0] : description;
//           })(),
//           content: contentEncoded.replace(/<!\[CDATA\[|\]\]>/g, ""),
//           contentParagraphs, // Add the extracted paragraphs to the response
//           image,
//           figcaption,
//           category: matchedCategory,
//         };
//       })
//     );
//   } catch (err) {
//     console.error("Error parsing feed:", url, err);
//     return [];
//   }
// }

// async function getNewsData() {
//   try {
//     const newsData = [];

//     for (const key in RSS_FEEDS) {
//       const data = await fetchRSS(RSS_FEEDS[key]);
//       console.log(`✔️ ${key.toUpperCase()} feed returned ${data.length} parsed items`);
//       newsData.push(...data);
//     }

//     const filteredNews = newsData.filter((item) => item.category);
//     console.log(`✅ Total filtered items with valid category: ${filteredNews.length}`);

//     return filteredNews;
//   } catch (err) {
//     console.error("Error fetching news data:", err);
//     return [];
//   }
// }

// export default {
//   async fetch(request, env, ctx) {
//     const url = new URL(request.url);
//     const path = url.pathname;

//     if (request.method === "OPTIONS") {
//       return new Response(null, { status: 204, headers: corsHeaders() });
//     }

//     if (path === "/api/news/home") {
//       try {
//         const news = await getNewsData();
//         const sorted = news.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

//         return new Response(JSON.stringify(sorted.slice(0, 50)), {
//           headers: {
//             "Content-Type": "application/json",
//             ...corsHeaders(),
//           },
//         });
//       } catch (err) {
//         return new Response(JSON.stringify({ error: "Failed to fetch home news" }), {
//           status: 500,
//           headers: corsHeaders(),
//         });
//       }
//     }

//     if (path.startsWith("/api/news/")) {
//       const category = path.split("/").pop().toLowerCase();

//       if (!RSS_FEEDS[category]) {
//         return new Response(JSON.stringify({ error: "Invalid category" }), {
//           status: 404,
//           headers: corsHeaders(),
//         });
//       }

//       try {
//         const news = await fetchRSS(RSS_FEEDS[category]);
//         const filtered = news.filter((item) => item.category === category);

//         return new Response(JSON.stringify(filtered.slice(0, 20)), {
//           headers: {
//             "Content-Type": "application/json",
//             ...corsHeaders(),
//           },
//         });
//       } catch (err) {
//         return new Response(JSON.stringify({ error: `Failed to fetch ${category} news` }), {
//           status: 500,
//           headers: corsHeaders(),
//         });
//       }
//     }

//     if (path === "/api/proxy") {
//       const target = url.searchParams.get("url");
//       if (!target) {
//         return new Response(JSON.stringify({ error: "Missing URL parameter" }), {
//           status: 400,
//           headers: corsHeaders(),
//         });
//       }

//       try {
//         const proxied = await fetch(target, {
//           headers: { "User-Agent": "Mozilla/5.0" },
//         });
//         const html = await proxied.text();

//         return new Response(html, {
//           headers: {
//             "Content-Type": "text/html",
//             ...corsHeaders(),
//           },
//         });
//       } catch (err) {
//         return new Response(JSON.stringify({ error: "Failed to proxy article" }), {
//           status: 500,
//           headers: corsHeaders(),
//         });
//       }
//     }

//     if (path === "/api/contact" && request.method === "POST") {
//       try {
//         const { name, email, subject, message } = await request.json();

//         if (!name || !email || !subject || !message) {
//           return new Response(JSON.stringify({ error: "All fields required." }), {
//             status: 400,
//             headers: corsHeaders(),
//           });
//         }

//         const emailData = {
//           from: "support@newstarn.com",
//           to: [env.EMAIL_WORKER],
//           subject,
//           text: `From: ${name} <${email}>\n\n${message}`,
//         };

//         const response = await fetch("https://api.resend.com/emails", {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${env.WORKERS_API}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(emailData),
//         });

//         if (!response.ok) {
//           const errorText = await response.text();
//           console.error("Resend error:", errorText);
//           return new Response(JSON.stringify({ error: "Email failed to send." }), {
//             status: response.status,
//             headers: corsHeaders(),
//           });
//         }

//         return new Response(JSON.stringify({ success: true }), {
//           headers: corsHeaders(),
//         });
//       } catch (err) {
//         return new Response(JSON.stringify({ error: "Unexpected error." }), {
//           status: 500,
//           headers: corsHeaders(),
//         });
//       }
//     }

//     return new Response("Hello from Newstarn!", {
//       headers: {
//         "Content-Type": "text/plain",
//         ...corsHeaders(),
//       },
//     });
//   },
// };



import { parseStringPromise } from "xml2js";

const CATEGORY_MAPPINGS = {
  sports: ["sports", "football", "basketball", "tennis", "athletics", "premier league", "champions league"],
  entertainment: ["entertainment", "movie", "music", "celebrity", "hollywood", "nollywood"],
  health: ["health", "medical", "hospital", "doctor", "disease", "who"],
  politics: ["politics", "election", "president", "senate", "house", "governor"],
  technology: ["technology", "tech", "computer", "phone", "internet", "ai", "info-tech"],
  business: ["business", "economy", "market", "stock", "finance", "money"]
};

const RSS_FEEDS = {
  sports: "https://www.channelstv.com/category/sports/feed/",
  entertainment: "https://www.channelstv.com/category/entertainment/feed/",
  health: "https://www.channelstv.com/category/health/feed/",
  politics: "https://www.channelstv.com/category/politics/feed/",
  technology: "https://www.channelstv.com/category/info-tech/feed/",
  business: "https://www.channelstv.com/category/business/feed/"
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
}

function isValidImageUrl(url) {
  return (
    typeof url === "string" &&
    url.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i) &&
    !url.includes("youtube.com") &&
    !url.includes("youtu.be") &&
    !url.includes("player.vimeo.com")
  );
}

async function extractImageAndCaptionFromArticle(link) {
  try {
    const res = await fetch(link, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const html = await res.text();
    const figureMatch = html.match(/<figure[^>]*>([\s\S]*?)<\/figure>/i);
    if (figureMatch) {
      const imgMatch = figureMatch[1].match(/<img[^>]*src=["']([^"']+)["']/i);
      const captionMatch = figureMatch[1].match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i);
      return {
        image: imgMatch ? imgMatch[1] : "",
        figcaption: captionMatch ? captionMatch[1].trim() : ""
      };
    }
  } catch (err) {
    console.error("Failed to fetch article HTML:", link, err);
  }
  return { image: "", figcaption: "" };
}

function matchCategory(itemCategories) {
  if (!itemCategories || !Array.isArray(itemCategories)) return "";
  
  const categoryStr = itemCategories.join(" ").toLowerCase();
  
  for (const [mainCategory, keywords] of Object.entries(CATEGORY_MAPPINGS)) {
    if (keywords.some(keyword => categoryStr.includes(keyword))) {
      return mainCategory;
    }
  }
  
  return "";
}

async function fetchRSS(url, targetCategory = null) {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const xml = await response.text();
    const parsed = await parseStringPromise(xml);

    const items = parsed?.rss?.channel?.[0]?.item || [];
    console.log(`Fetched ${items.length} items from: ${url}`);

    const processedItems = await Promise.all(
      items.map(async (item) => {
        const matchedCategory = matchCategory(item.category);
        
        if (targetCategory && matchedCategory !== targetCategory) {
          return null;
        }

        const mediaImage = item["media:content"]?.[0]?.$?.url || "";
        const description = item.description?.[0] || "";
        const contentEncoded = item["content:encoded"]?.[0] || "";
        const link = item.link?.[0] || "";

        let image = mediaImage;
        let figcaption = "";

        if (!isValidImageUrl(image)) {
          const fallback = await extractImageAndCaptionFromArticle(link);
          if (isValidImageUrl(fallback.image)) {
            image = fallback.image;
            figcaption = fallback.figcaption;
          } else {
            image = "https://placehold.co/800x450";
          }
        }

        const contentParagraphs = (() => {
          const cleanedContent = contentEncoded.replace(/<!\[CDATA\[|\]\]>/g, "");
          const pMatches = cleanedContent.match(/<p[^>]*>.*?<\/p>/g);
          return pMatches ? pMatches : [];
        })();

        return {
          title: item.title?.[0] || "",
          link,
          pubDate: item.pubDate?.[0] ? new Date(item.pubDate[0]).toISOString() : "",
          description: (() => {
            const matches = description.match(/<p[^>]*>.*?<\/p>/g);
            return matches && matches.length > 0 ? matches[0] : description;
          })(),
          content: contentEncoded.replace(/<!\[CDATA\[|\]\]>/g, ""),
          contentParagraphs,
          image,
          figcaption,
          category: matchedCategory
        };
      })
    );

    return processedItems.filter(item => item !== null);
  } catch (err) {
    console.error("Error parsing feed:", url, err);
    return [];
  }
}

async function getNewsData() {
  try {
    const newsData = [];

    for (const key in RSS_FEEDS) {
      const data = await fetchRSS(RSS_FEEDS[key]);
      console.log(`✔️ ${key.toUpperCase()} feed returned ${data.length} parsed items`);
      newsData.push(...data);
    }

    const filteredNews = newsData.filter((item) => item.category);
    console.log(`✅ Total filtered items with valid category: ${filteredNews.length}`);

    return filteredNews;
  } catch (err) {
    console.error("Error fetching news data:", err);
    return [];
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    if (path === "/api/news/home") {
      try {
        const news = await getNewsData();
        const sorted = news.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        return new Response(JSON.stringify(sorted.slice(0, 24)), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders()
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to fetch home news" }), {
          status: 500,
          headers: corsHeaders()
        });
      }
    }

    if (path.startsWith("/api/news/")) {
      const category = path.split("/").pop().toLowerCase();

      if (!RSS_FEEDS[category]) {
        return new Response(JSON.stringify({ error: "Invalid category" }), {
          status: 404,
          headers: corsHeaders()
        });
      }

      try {
        let news = await fetchRSS(RSS_FEEDS[category], category);
        
        if (news.length < 24) {
          const otherFeeds = Object.entries(RSS_FEEDS)
            .filter(([cat]) => cat !== category)
            .map(([, url]) => url);
            
          for (const feedUrl of otherFeeds) {
            const additionalItems = await fetchRSS(feedUrl, category);
            news = [...news, ...additionalItems];
            if (news.length >= 24) break;
          }
        }

        return new Response(JSON.stringify(news.slice(0, 12)), {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders()
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: `Failed to fetch ${category} news` }), {
          status: 500,
          headers: corsHeaders()
        });
      }
    }

    if (path === "/api/proxy") {
      const target = url.searchParams.get("url");
      if (!target) {
        return new Response(JSON.stringify({ error: "Missing URL parameter" }), {
          status: 400,
          headers: corsHeaders()
        });
      }

      try {
        const proxied = await fetch(target, {
          headers: { "User-Agent": "Mozilla/5.0" }
        });
        const html = await proxied.text();

        return new Response(html, {
          headers: {
            "Content-Type": "text/html",
            ...corsHeaders()
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to proxy article" }), {
          status: 500,
          headers: corsHeaders()
        });
      }
    }

    if (path === "/api/contact" && request.method === "POST") {
      try {
        const { name, email, subject, message } = await request.json();

        if (!name || !email || !subject || !message) {
          return new Response(JSON.stringify({ error: "All fields required." }), {
            status: 400,
            headers: corsHeaders()
          });
        }

        const emailData = {
          from: "support@newstarn.com",
          to: [env.EMAIL_WORKER_RECEIVER],
          subject,
          text: `From: ${name} <${email}>\n\n${message}`
        };

        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.WORKERS_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(emailData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Resend error:", errorText);
          return new Response(JSON.stringify({ error: "Email failed to send." }), {
            status: response.status,
            headers: corsHeaders()
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: corsHeaders()
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Unexpected error." }), {
          status: 500,
          headers: corsHeaders()
        });
      }
    }

    return new Response("Hello from Newstarn!", {
      headers: {
        "Content-Type": "text/plain",
        ...corsHeaders()
      }
    });
  }
};