// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import { Modal } from "react-bootstrap";
// import '../styles/style.css';

// const NewsModal = ({ show, handleClose, article }) => {
//   const [fullContent, setFullContent] = useState("Loading full news content...");

//   // Memoize the unwanted phrases array so it doesn't change between renders
//   const UNWANTED_PHRASES = useMemo(() => [
//     "READ ALSO:",
//     "READ ALSO",
//     "READ:",
//     "READ",
//     "The post .* appeared first on .*",
//     "All rights reserved",
//     "Copyright ©",
//     "Follow us on",
//     "Share this article",
//     "Related News",
//     "For more information",
//     "Contact us at",
//     "Like our Facebook page",
//     "Follow us on Twitter",
//     "Subscribe to our channel",
//     "Join our Telegram",
//     "Download our app",
//     "Kindly share this story",
//     "punchng.com",
//     "vanguardngr.com",
//     "channelstv.com",
//     "thisdaylive.com",
//     "© \\d{4}",
//     /EU Slaps .* Fines On .*/i,
//     /EU Exports To US Surge By .*/i
//   ], []);

//   const cleanContent = useCallback((paragraphs) => {
//     return paragraphs
//       .map(paragraph => {
//         let cleaned = paragraph;
//         UNWANTED_PHRASES.forEach(phrase => {
//           if (typeof phrase === 'string') {
//             cleaned = cleaned.replace(new RegExp(phrase, 'gi'), '');
//           } else if (phrase instanceof RegExp) {
//             cleaned = cleaned.replace(phrase, '');
//           }
//         });

//         cleaned = cleaned
//           .replace(/<a\b[^>]*>(.*?)<\/a>/gi, '')
//           .replace(/<img\b[^>]*>/gi, '')
//           .replace(/<strong>(.*?)<\/strong>/gi, '$1')
//           .replace(/<em>(.*?)<\/em>/gi, '$1')
//           .replace(/&nbsp;/g, ' ')
//           .replace(/\s+/g, ' ')
//           .trim();

//         return cleaned;
//       })
//       .filter(paragraph => {
//         const textContent = paragraph.replace(/<[^>]+>/g, '').trim();
//         return textContent.length > 20 &&
//                !/^[\s\W]*$/.test(textContent) &&
//                !/^[\d\W]+$/.test(textContent);
//       });
//   }, [UNWANTED_PHRASES]); // Now properly included in dependencies

//   // Rest of the component remains the same...
//   useEffect(() => {
//     if (show) {
//       if (article?.contentParagraphs && article.contentParagraphs.length > 0) {
//         const cleanedParagraphs = cleanContent(article.contentParagraphs);

//         if (cleanedParagraphs.length > 0) {
//           const lastParagraph = cleanedParagraphs[cleanedParagraphs.length - 1];
//           if (/source:|credit:|via |©|all rights reserved/i.test(lastParagraph)) {
//             cleanedParagraphs.pop();
//           }
//         }

//         const filteredContent = cleanedParagraphs.join("");
//         setFullContent(filteredContent || "<p>Content not available.</p>");
//       } else {
//         setFullContent("<p>Content not available.</p>");
//       }
//     }
//   }, [show, article, cleanContent]);

//   const shareUrl = article?.link ? encodeURIComponent(article.link) : '';
//   const shareText = article?.title ? encodeURIComponent(article.title) : '';

//   return (
//     <Modal show={show} onHide={handleClose} centered size="lg">
//       <Modal.Header closeButton>
//         <Modal.Title>{article?.title || "News Article"}</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         {article?.image && (
//           <div className="text-center">
//             <img
//               src={article.image}
//               className="img-fluid mb-3"
//               style={{ borderRadius: "10px" }}
//               alt="News"
//             />
//           </div>
//         )}

//         <div dangerouslySetInnerHTML={{ __html: fullContent }}></div>

//         <div className="news-social-media mt-3">
//           <a
//             href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="btn btn-outline-primary me-2"
//             onClick={(e) => {
//               if (!article?.link) {
//                 e.preventDefault();
//                 alert('No URL available to share');
//               }
//             }}
//           >
//             Share on Facebook
//           </a>
//           <a
//             href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="btn btn-outline-info"
//             onClick={(e) => {
//               if (!article?.link) {
//                 e.preventDefault();
//                 alert('No URL available to share');
//               }
//             }}
//           >
//             Share on Twitter
//           </a>
//         </div>
//       </Modal.Body>
//     </Modal>
//   );
// };

// export default NewsModal;



import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Modal } from "react-bootstrap";
import '../styles/style.css';

const NewsModal = ({ show, handleClose, article }) => {
  const [fullContent, setFullContent] = useState("Loading full news content...");

  // Memoize the unwanted phrases array so it doesn't change between renders
  const UNWANTED_PHRASES = useMemo(() => [
    "READ ALSO:",
    "READ ALSO",
    "READ:",
    "READ",
    "The post .* appeared first on .*",
    "All rights reserved",
    "Copyright ©",
    "Follow us on",
    "Share this article",
    "Related News",
    "For more information",
    "Contact us at",
    "Like our Facebook page",
    "Follow us on Twitter",
    "Subscribe to our channel",
    "Join our Telegram",
    "Download our app",
    "Kindly share this story",
    "punchng.com",
    "vanguardngr.com",
    "channelstv.com",
    "thisdaylive.com",
    "© \\d{4}",
    /EU Slaps .* Fines On .*/i,
    /EU Exports To US Surge By .*/i
  ], []);

  const cleanContent = useCallback((paragraphs) => {
    return paragraphs
      .map(paragraph => {
        let cleaned = paragraph;
        UNWANTED_PHRASES.forEach(phrase => {
          if (typeof phrase === 'string') {
            cleaned = cleaned.replace(new RegExp(phrase, 'gi'), '');
          } else if (phrase instanceof RegExp) {
            cleaned = cleaned.replace(phrase, '');
          }
        });

        cleaned = cleaned
          .replace(/<a\b[^>]*>(.*?)<\/a>/gi, '')
          .replace(/<img\b[^>]*>/gi, '')
          .replace(/<strong>(.*?)<\/strong>/gi, '$1')
          .replace(/<em>(.*?)<\/em>/gi, '$1')
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        return cleaned;
      })
      .filter(paragraph => {
        const textContent = paragraph.replace(/<[^>]+>/g, '').trim();
        return textContent.length > 20 &&
          !/^[\s\W]*$/.test(textContent) &&
          !/^[\d\W]+$/.test(textContent);
      });
  }, [UNWANTED_PHRASES]); // Now properly included in dependencies


  // Rest of the component remains the same...
  useEffect(() => {
    if (show) {
      if (article?.contentParagraphs && article.contentParagraphs.length > 0) {
        const cleanedParagraphs = cleanContent(article.contentParagraphs);

        if (cleanedParagraphs.length > 0) {
          const lastParagraph = cleanedParagraphs[cleanedParagraphs.length - 1];
          if (/source:|credit:|via |©|all rights reserved/i.test(lastParagraph)) {
            cleanedParagraphs.pop();
          }
        }

        const filteredContent = cleanedParagraphs.join("");
        setFullContent(filteredContent || "<p>Content not available.</p>");
      } else {
        setFullContent("<p>Content not available.</p>");
      }
    }
  }, [show, article, cleanContent]);
// Improved share function
const handleShare = (platform) => {
  if (!article?.link) return;
  
  const url = encodeURIComponent(article.link);
  const title = encodeURIComponent(article.title || "Check out this article");
  const text = encodeURIComponent(`${article.title || "Interesting article"} - ${article.link}`);
  
  let shareUrl;
  switch(platform) {
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${title}`;
      break;
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
      break;
    default:
      return;
  }
  
  window.open(shareUrl, '_blank', 'width=600,height=400');
};

return (
  <Modal show={show} onHide={handleClose} centered size="lg">
    <Modal.Header closeButton>
      <Modal.Title>{article?.title || "News Article"}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {article?.image && (
        <div className="text-center">
          <img
            src={article.image}
            className="img-fluid mb-3"
            style={{ borderRadius: "10px" }}
            alt="News"
          />
        </div>
      )}

      <div dangerouslySetInnerHTML={{ __html: fullContent }}></div>

      <div className="news-social-media mt-3">
        <button
          onClick={() => handleShare('facebook')}
          className="btn btn-outline-primary me-2"
          disabled={!article?.link}
        >
          Share on Facebook
        </button>
        
        <button
          onClick={() => handleShare('twitter')}
          className="btn btn-outline-info"
          disabled={!article?.link}
        >
          Share on Twitter
        </button>
      </div>
    </Modal.Body>
  </Modal>
);
};

export default NewsModal;