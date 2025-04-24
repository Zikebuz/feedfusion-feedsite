
// import React, { useEffect, useState } from "react";
// import NewsItem from "../components/NewsItem";

// const backendUrl = process.env.REACT_APP_BACKEND_URL; // ✅ Load backend URL from .env

// const Entertainment = ({ searchQuery }) => {
//   const [news, setNews] = useState([]);
//   const [filteredNews, setFilteredNews] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetch(`${backendUrl}/api/news/entertainment`) // ✅ Fetch entertainment news dynamically
//       .then((response) => response.json())
//       .then((data) => {
//         setNews(data);
//         setFilteredNews(data); // ✅ Initially show all news
//         setLoading(false);
//       })
//       .catch((error) => {
//         console.error("Error fetching entertainment news:", error);
//         setLoading(false);
//       });
//   }, []);

//   // Filter news based on search query
//   useEffect(() => {
//     if (!searchQuery) {
//       setFilteredNews(news);
//     } else {
//       const filtered = news.filter((article) =>
//         article.title.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//       setFilteredNews(filtered);
//     }
//   }, [searchQuery, news]);

//   return (
//     <div className="entertainment-container">
//       {loading ? (
//         <p style={{ textAlign: "center", margin: "10% auto" }}>Loading...</p>
//       ) : (
//         <div className="grid-view">
//           {filteredNews.length > 0 ? (
//             filteredNews.map((article, index) => (
//               <NewsItem key={index} article={article} />
//             ))
//           ) : (
//             <p style={{ textAlign: "center", color: "red", fontSize: "18px" }}>
//               No results found in this category.
//             </p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Entertainment;


import React, { useEffect, useState } from "react";
import NewsItem from "../components/NewsItem";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const Entertainment = ({ searchQuery }) => {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    // Try to load from localStorage first
    const cachedNews = localStorage.getItem('cachedEntertainmentNews');
    const cacheTime = localStorage.getItem('cachedEntertainmentNewsTime');
    
    if (cachedNews && cacheTime && Date.now() - parseInt(cacheTime) < 1000 * 60 * 5) {
      setNews(JSON.parse(cachedNews));
      setFilteredNews(JSON.parse(cachedNews));
      setLoading(false);
      setInitialLoad(false);
    }

    // Always fetch fresh data in background
    fetch(`${backendUrl}/api/news/entertainment`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setNews(data);
        setFilteredNews(data);
        localStorage.setItem('cachedEntertainmentNews', JSON.stringify(data));
        localStorage.setItem('cachedEntertainmentNewsTime', Date.now().toString());
      })
      .catch((error) => {
        console.error("Error fetching entertainment news:", error);
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
    <div className="entertainment-container">
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
              {searchQuery ? "No results found." : "No entertainment news available."}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Entertainment;
