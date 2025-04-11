import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faYoutube } from '@fortawesome/free-brands-svg-icons';
import '../styles/style.css'; // Ensure the CSS is correctly linked

const Footer = () => {
  return (
    <footer className="footer bg-dark text-light py-4">
      <div className="container">
        <div className="row">
          {/* About Us Section */}
          <div className="col-md-3 mb-3">
            <h5>What We Offer</h5>
            <p>
              We provide a curated collection of news from trusted sources within Newstarn to keep you informed
            </p>
          </div>

          {/* Useful Links */}
          <div className="col-md-3 mb-3">
            <h5>Useful Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-light text-decoration-none">Home</a></li>
              <li><a href="/advertise" className="text-light text-decoration-none">Advertise With Us</a></li>
              <li><a href="/contactus" className="text-light text-decoration-none">Contact Us</a></li>
              <li><a href="/privacypolicy" className="text-light text-decoration-none">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Sources Section */}
          <div className="col-md-3 mb-3">
            <h5>Sources</h5>
            <ul className="list-unstyled">
              <li>PunchNG</li>
              <li>Fox News</li>
              <li>BBC</li>
              <li>Channels TV</li>
            </ul>
          </div>

          {/* Follow Us Section */}
          <div className="col-md-3 mb-3">
            <h5>Follow Us</h5>
            <div className="d-flex footer-icons">

              <a href="https://www.facebook.com/people/Newstarn/61574926899598/" className="text-light me-3" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faFacebook} size="2x" />
              </a>
              <a href="https://www.instagram.com/newstarnz/" className="text-light me-3" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faInstagram} size="2x" />
              </a>
              
              <a href="https://www.youtube.com/channel/UCmFWjs94o7yOrFYwwlT2geQ?sub_confirmation=1" className="text-light me-3" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faYoutube} size="2x" />
              </a>

              {/* <a href="https://www.facebook.com/profile.php?id=61574990331253" className="text-light me-3"><FontAwesomeIcon icon={faFacebook} size="2x" target="_blank" /></a> */}
              {/* <a href="https://www.x.com" className="text-light me-3"><FontAwesomeIcon icon={faTwitter} size="2x" /></a> */}
              {/* <a href="https://www.linkedin.com" className="text-light me-3"><FontAwesomeIcon icon={faLinkedin} size="2x" /></a> */}
              {/* <a href="https://www.instagram.com/feedfusionnews/" className="text-light"><FontAwesomeIcon icon={faInstagram} size="2x" target="_blank" /></a> */}
            </div>
          </div>
        </div>

        <hr className="border-light" />

        {/* Copyright & Footer Info */}
        <div className="text-center">
          <p className="mb-0">
            Newstarn &copy; {new Date().getFullYear()} | All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
