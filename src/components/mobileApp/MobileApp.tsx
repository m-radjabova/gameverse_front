import mobileApp from "../../assets/app scrren.svg";
import playmarket from "../../assets/googleplay.svg";
import appstore from "../../assets/appstore.svg";
import "./MobileApp.css";

function MobileApp() {
  return (
    <div className="mobile-app" data-aos="fade-up">
      <div className="mobile-app-container">
        <div className="left-side">
          <h1 className="app-title">
            <span className="title-part-1">Make Your Online Shop</span>
            <span className="title-part-2">Sob Ready With Our Mobile App</span>
          </h1>
          
          <p className="app-description">
            Discover a seamless shopping experience with our feature-rich mobile application. 
            Browse thousands of products, enjoy exclusive app-only deals, and get instant 
            notifications about new arrivals and special promotions.
          </p>
          
          <div className="download-buttons">
            <div className="store-button">
              <img src={playmarket} alt="Get on Google Play" className="store-img" />
              <div className="button-hover-effect"></div>
            </div>
            <div className="store-button">
              <img src={appstore} alt="Download on App Store" className="store-img" />
              <div className="button-hover-effect"></div>
            </div>
          </div>
          
        </div>
        
        <div className="right-side">
          <div className="phone-mockup">
            <img src={mobileApp} alt="Mobile app screens" className="app-screenshot" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileApp;