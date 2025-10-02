import Logo from "../../assets/Logo (3).svg";
import fc from "../../assets/facebook.svg";
import linkin from "../../assets/linkin.svg";
import insta from '../../assets/insta.svg';
import be from "../../assets/be.svg";
import tupicha from "../../assets/tupicha.svg";
import apay from "../../assets/apay.svg";
import amazon from "../../assets/amazon.svg";
import gpay from "../../assets/gpay (2).svg";
import viza from "../../assets/viza.svg";
import mastercard from "../../assets/mastercard.svg";
import payoner from "../../assets/Payment Method.svg";

function Footer() {
  return (
    <div className="footer" data-aos="fade-up">
      <div className="footer-container">
        <div className="footer-content">
          <div className="logo-section">
            <img src={Logo} alt="Logo" className="footer-logo" />
            <p className="footer-description">Sophisticated simplicity for the independent mind</p>
            <div className="socials">
              <div className="social-icon">
                <img src={fc} alt="facebook" />
              </div>
              <div className="social-icon">
                <img src={linkin} alt="linkin" />
              </div>
              <div className="social-icon">
                <img src={insta} alt="instagram" />
              </div>
              <div className="social-icon">
                <img src={be} alt="be" />
              </div>
              <div className="social-icon">
                <img src={tupicha} alt="tupicha" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="footer-content">
          <h4>Help & Information</h4>
          <ul>
            <li><span>Pagination</span></li>
            <li><span>Terms & Conditions</span></li>
            <li><span>Contact</span></li>
            <li><span>Home page</span></li>
            <li><span>Term of use</span></li>
          </ul>
        </div>
        
        <div className="footer-content">
          <h4>About Us</h4>
          <ul>
            <li><span>Help Center</span></li>
            <li><span>Address Store</span></li>
            <li><span>Privacy Policy</span></li>
            <li><span>Receivers & Amplifiers</span></li>
            <li><span>Clothings</span></li>
          </ul>
        </div>
        
        <div className="footer-content">
          <h4>Categories</h4>
          <ul>
            <li><span>Delivery</span></li>
            <li><span>Legal Notice</span></li>
            <li><span>Documentation</span></li>
            <li><span>Secure payment</span></li>
            <li><span>Stores</span></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-divider"></div>
      
      <div className="footer-bottom">
        <p>© Copyright 2022 | Woodbar By Graphicraz.</p>
        <div className="payment-methods">
          <div className="payment-icon">
            <img src={apay} alt="Apple Pay" />
          </div>
          <div className="payment-icon">
            <img src={amazon} alt="Amazon Pay" />
          </div>
          <div className="payment-icon">
            <img src={gpay} alt="Google Pay" />
          </div>
          <div className="payment-icon">
            <img src={viza} alt="Visa" />
          </div>
          <div className="payment-icon">
            <img src={mastercard} alt="Mastercard" />
          </div>
          <div className="payment-icon">
            <img src={payoner} alt="Payoner" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer;