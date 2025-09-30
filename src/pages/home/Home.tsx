import FreeService from "../../components/freeService/FreeService"
import FreshProduct from "../../components/freshProduct/FreshProduct"
import Hero from "../../components/main/Hero"
import ProductsSlider from "../../components/main/ProductsSlider"
import MobileApp from "../../components/mobileApp/MobileApp"
import Products from "../../components/product/Products"
import SellingProducts from "../../components/sellingProducts/SellingProducts"
import BestSelling from './../../components/bestSelling/BestSelling';

function Home() {
  return (
    <div className="max-w-[1400px] mx-auto px-4">
      <Hero />
      <ProductsSlider />
      <Products />
      <FreeService />
      <SellingProducts />
      <FreshProduct />
      <BestSelling />
      <MobileApp />
    </div>
  )
}

export default Home