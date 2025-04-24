import React, { useEffect, useState } from "react";
import NewsItem from "../components/NewsItem";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const Sports = ({ searchQuery }) => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    // Try to load from localStorage first
    const cachedNews = localStorage.getItem('cachedSportsNews');
    const cacheTime = localStorage.getItem('cachedSportsNewsTime');
    
    if (cachedNews && cacheTime && Date.now() - parseInt(cacheTime) < 1000 * 60 * 5) {
      setNews(JSON.parse(cachedNews));
      setFilteredNews(JSON.parse(cachedNews));
      setLoading(false);
      setInitialLoad(false);
    }

    // Always fetch fresh data in background
    fetch(`${backendUrl}/api/news/sports`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setNews(data);
        setFilteredNews(data);
        localStorage.setItem('cachedSportsNews', JSON.stringify(data));
        localStorage.setItem('cachedSportsNewsTime', Date.now().toString());
      })
      .catch((error) => {
        console.error("Error fetching sports news:", error);
        // If we have cached data but fetch failed, don't show error
        if (!cachedNews) {
          // Handle error state if needed
        }
      })
      .finally(() => {
        setLoading(false);
        setInitialLoad(false);
      });
  }, []);

  // Filter news based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredNews(news);
    } else {
      const filtered = news.filter((article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNews(filtered);
    }
  }, [searchQuery, news]);

  return (
    <div className="sports-container">
      {initialLoad && loading ? (
        <p style={{ textAlign: "center", margin: "10% auto" }}>Loading...</p>
      ) : (
        <div className="grid-view">
          {filteredNews.length > 0 ? (
            filteredNews.map((article, index) => (
              <NewsItem key={index} article={article} />
            ))
          ) : (
            <p style={{ textAlign: "center", color: "red", fontSize: "18px" }}>
              {searchQuery ? "No results found." : "No sports news available."}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Sports;