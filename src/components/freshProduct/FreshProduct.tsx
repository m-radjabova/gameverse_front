import { useNavigate } from "react-router-dom";
import beefImg from "../../assets/beefimg.svg";
import vector from "../../assets/Vector (2).svg";
import { FaArrowAltCircleRight } from "react-icons/fa";

function FreshProduct() {
  const navigate = useNavigate();
  return (
    <div className="fresh-product" data-aos="fade-up">
      <div className="fresh-product-container">
        <div className="left-side">
          <div className="fresh-image-wrapper">
            <img src={beefImg} alt="Fresh beef products" className="fresh-product-image" />
            <div className="floating-badge floating-badge-1">
              <span>Fresh</span>
            </div>
            <div className="floating-badge floating-badge-2">
              <span>Organic</span>
            </div>
          </div>
        </div>
        
        <div className="right-side">
          <h1 className="product-title">
            <span className="title-line">Fresh Product Directly</span>
            <span className="title-line">To Your Door With Free</span>
            <span className="title-accent">Delivery</span>
          </h1>
          
          <p className="product-description">
            Enjoy the finest quality products delivered straight to your doorstep. 
            We ensure that every item maintains its freshness and nutritional value 
            from our farm to your home.
          </p>
          
          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon">
                <img src={vector} alt="Checkmark" />
              </div>
              <span className="feature-text">Free Delivery For All Orders</span>
            </div>
            
            <div className="feature-item">
              <div className="feature-icon">
                <img src={vector} alt="Checkmark" />
              </div>
              <span className="feature-text">Only Fresh Food</span>
            </div>
          </div>
          
          <button onClick={() => navigate("/delivery")} className="cta-button">
            Find Now
            <FaArrowAltCircleRight />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FreshProduct;