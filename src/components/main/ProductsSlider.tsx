import Slider from "react-slick"; // ✅ To'g'ri import
import useProducts from "../../hooks/useProducts";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function ProductsSlider() {
  const { products } = useProducts();

  const settings = {
    dots: false,
    infinite: true,
    speed: 1000, 
    slidesToShow: 6,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000, 
    pauseOnHover: true,
    cssEase: "ease-in-out", 
    swipe: true, 
    draggable: true,
    fade: false, 
    waitForAnimate: true, 
    adaptiveHeight: false, 
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };
  return (
    <div className="products-slider-container">
      <Slider {...settings}>
        {products.map((product) => (
          <div key={product.id} className="product-slide">
            <div className="product-slider-card">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="product-slider-image"
              />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default ProductsSlider;
