import { Router } from 'itty-router'

const router = Router()

router.get("/", () => {
  return new Response("Welcome to the News API", {
    headers: { 'Content-Type': 'text/plain' }
  })
})


// RSS Feeds and Categories
const ALLOWED_CATEGORIES = ["sports", "technology", "politics", "health", "business"]
const RSS_FEEDS = {
  sports: "https://rss.punchng.com/v1/category/sports",
  technology: "https://rss.punchng.com/v1/category/technology",
  politics: "https://rss.punchng.com/v1/category/politics",
  health: "https://rss.punchng.com/v1/category/health",
  business: "https://rss.punchng.com/v1/category/business",
}

// Helper: Parse RSS XML
async function fetchAndParseRSS(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`Failed to fetch from ${url}: ${response.status}`)
      return []  // Returning an empty array if fetch fails
    }

    const text = await response.text()
    const parser = new DOMParser()
    const xml = parser.parseFromString(text, "application/xml")
    const items = xml.querySelectorAll("item")

    let articles = []

    items.forEach((item) => {
      let categoryRaw = item.querySelector("category")?.textContent.trim().toLowerCase() || ""
      let category = ALLOWED_CATEGORIES.find(label => categoryRaw.includes(label)) || ""

      articles.push({
        title: item.querySelector("title")?.textContent,
        link: item.querySelector("link")?.textContent,
        pubDate: new Date(item.querySelector("pubDate")?.textContent).toISOString(),
        description: item.querySelector("description")?.textContent,
        image: item.querySelector("enclosure")?.getAttribute("url") || "",
        category
      })
    })

    return articles
  } catch (err) {
    console.error("RSS Parse Error", err)
    return []  // Returning an empty array in case of a parse error
  }
}

// GET /api/news/home — 8 articles from each category
router.get("/api/news/home", async () => {
  let homeNews = []

  for (const [category, url] of Object.entries(RSS_FEEDS)) {
    const items = await fetchAndParseRSS(url)
    homeNews.push(...items.slice(0, 8))
  }

  homeNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))

  return new Response(JSON.stringify(homeNews), {
    headers: { 'Content-Type': 'application/json' }
  })
})

// GET /api/news/:category — Top 20 articles for category
router.get("/api/news/:category", async ({ params }) => {
  const category = params.category.toLowerCase()
  const url = RSS_FEEDS[category]

  if (!url) {
    return new Response(JSON.stringify({ error: "Category not found" }), { status: 404 })
  }

  const items = await fetchAndParseRSS(url)
  return new Response(JSON.stringify(items.slice(0, 20)), {
    headers: { 'Content-Type': 'application/json' }
  })
})

// GET /api/proxy?url=...
router.get("/api/proxy", async (request) => {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    return new Response(JSON.stringify({ error: "URL is required" }), { status: 400 })
  }

  try {
    const proxied = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    })
    const html = await proxied.text()
    return new Response(html, { headers: { 'Content-Type': 'text/html' } })
  } catch (err) {
    console.error("Proxy Error", err)
    return new Response(JSON.stringify({ error: "Failed to fetch full article" }), { status: 500 })
  }
})

// POST /api/contact
router.post("/api/contact", async (request) => {
  const body = await request.json()
  const { name, email, subject, message } = body

  if (!name || !email || !subject || !message) {
    return new Response(JSON.stringify({ error: "All fields are required" }), { status: 400 })
  }

  const emailBody = {
    personalizations: [{ to: [{ email: "your@email.com" }] }],
    from: { email: "noreply@yourdomain.com" },
    subject: `New Contact: ${subject}`,
    content: [{
      type: "text/plain",
      value: `From: ${name} <${email}>\n\n${message}`
    }]
  }

  const emailResponse = await fetch("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(emailBody)
  })

  if (emailResponse.ok) {
    return new Response(JSON.stringify({ success: true, message: "Message sent!" }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } else {
    console.error("Email sending failed", await emailResponse.text())
    return new Response(JSON.stringify({ error: "Failed to send message" }), { status: 500 })
  }
})

// Root path test
router.get("/", () => {
  return new Response("FeedFused Backend Running ✅", { status: 200 })
})

// Default fallback
router.all("*", () => new Response("404 Not Found", { status: 404 }))

// 🟩 Correct Worker Export
export default {
  async fetch(request, env, ctx) {
    return router.handle(request)
  }
}
