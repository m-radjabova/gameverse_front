import bgfree from "../../assets/freeService.svg";
import freeDelivery from "../../assets/Free Delivery.svg";
import group from "../../assets/Group 9.svg";
import { useNavigate } from "react-router-dom";
import { FaArrowAltCircleRight } from "react-icons/fa";

function FreeService() {
  const navigate = useNavigate();
  return (
    <div className="free-service" data-aos="fade-up">
      <div className="free-service-container">
        <div className="left-side">
          <div className="free-image-container">
            <img className="bg" src={bgfree} alt="Special offer background" />
            <img 
              className="free-delivery" 
              src={freeDelivery} 
              alt="Free delivery icon" 
            />
            <img 
              className="group" 
              src={group} 
              alt="Quality guarantee icon" 
            />
          </div>
        </div>
        
        <div className="right-side">
          <h1>
            <span className="title-line">Our Special Service</span>
            <span className="title-highlight">Fresh Beef</span>
          </h1>
          
          <div className="pricing">
            <span className="original-price">$20.00</span>
            <span className="discounted-price">$18.00</span>
          </div>
          
          <p className="description">
            Enjoy our premium quality fresh beef with free delivery service and 100% quality guarantee
          </p>
          
          <button onClick={() => navigate("/shop")} className="cta-button">
            Shop Now
            <FaArrowAltCircleRight />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FreeService;