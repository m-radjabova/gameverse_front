import orange from "../../assets/004-orange-juice.svg";
import brocolli from "../../assets/003-broccoli.svg";
import fish from "../../assets/005-fish.svg";
import bakery from "../../assets/006-dough.svg";
import meat from "../../assets/002-beef.svg";
import pasta from "../../assets/001-pasta.svg";
import sweet from "../../assets/007-cupcake.svg";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import useCarousel from "../../hooks/useCarousel";
import type { CarouselItem } from "../../types/types";
import ProductsSlider from "./ProductsSlider";

function Hero() {
  const { carousel, loading } = useCarousel();
  
  if (loading) { return <div className="products-loading">
                            <div className="loading-spinner">   
                            </div>
                        </div>;}

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: true, 
    fade: true, 
    adaptiveHeight: true,
    centerMode: true,
    centerPadding: "40px",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          centerPadding: "20px"
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          arrows: false 
        }
      }
    ]
  };

  return (
    <div className="">
      <div className="hero-container">
        <Slider {...settings} className="hero-slider max-w-[1500px] mx-auto"> 
          {carousel?.map((item: CarouselItem) => (
          <div className="hero" key={item.id}>
            <div className="left-side">
              <h1 className="hero-text">
                <span className="hero-title-line">{item.title1}</span>
                <span className="hero-title-accent">{item.title2}</span>
              </h1>
              <p className="hero-para">
                {item.descreption}
              </p>
              <div className="hero-buttons">
                <button className="cta-button primary">
                  Buy Now
                  <span className="button-hover-effect"></span>
                </button>
                <button className="cta-button secondary">
                  See More
                  <span className="button-icon">→</span>
                </button>
              </div>
            </div>
            
            <div className="right-side">
              <div className="hero-image-container">
                <img src={item.imgUrl} alt="Delicious breakfast items" className="hero-main-image" />
                <div className="floating-element floating-element-1"></div>
                <div className="floating-element floating-element-2"></div>
                <div className="floating-element floating-element-3"></div>
                <div className="floating-element floating-element-4"></div>
                <div className="floating-element floating-element-5"></div>
                <div className="floating-element floating-element-6"></div>
                <div className="floating-element floating-element-7"></div>
                <div className="floating-element floating-element-8"></div>
                <div className="floating-element floating-element-9"></div>
                <div className="floating-element floating-element-10"></div>
              </div>
            </div>
          </div>
          ))}
        </Slider>
      </div>
      <ProductsSlider />
      <div className="hero-container">
        <div className="hero-bottom max-w-[1500px] mx-auto">
          <div className="categories-container">
            <div className="hero-category-item">
              <div className="hero-category-icon">
                <img src={orange} alt="Fruits" />
                <div className="icon-hover-effect"></div>
              </div>
              <p className="hero-category-name">Fruits</p>
            </div>
            
            <div className="hero-category-item">
              <div className="hero-category-icon">
                <img src={brocolli} alt="Vegetables" />
                <div className="icon-hover-effect"></div>
              </div>
              <p className="hero-category-name">Vegetables</p>
            </div>
            
            <div className="hero-category-item">
              <div className="hero-category-icon">
                <img src={fish} alt="Semi-Finished" />
                <div className="icon-hover-effect"></div>
              </div>
              <p className="hero-category-name">Semi-Finished</p>
            </div>
            
            <div className="hero-category-item">
              <div className="hero-category-icon">
                <img src={bakery} alt="Bakery" />
                <div className="icon-hover-effect"></div>
              </div>
              <p className="hero-category-name">Bakery</p>
            </div>
            
            <div className="hero-category-item">
              <div className="hero-category-icon">
                <img src={meat} alt="Meat" />
                <div className="icon-hover-effect"></div>
              </div>
              <p className="hero-category-name">Meat</p>
            </div>
            
            <div className="hero-category-item">
              <div className="hero-category-icon">
                <img src={pasta} alt="Pasta" />
                <div className="icon-hover-effect"></div>
              </div>
              <p className="hero-category-name">Pasta</p>
            </div>
            
            <div className="hero-category-item">
              <div className="hero-category-icon">
                <img src={sweet} alt="Sweets" />
                <div className="icon-hover-effect"></div>
              </div>
              <p className="hero-category-name">Sweets</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;