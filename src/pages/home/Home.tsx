import FreeService from "../../components/freeService/FreeService"
import FreshProduct from "../../components/freshProduct/FreshProduct"
import Hero from "../../components/main/Hero"
import MobileApp from "../../components/mobileApp/MobileApp"
import Products from "../../components/product/Products"
import SellingProducts from "../../components/sellingProducts/SellingProducts"
import BestSelling from './../../components/bestSelling/BestSelling';

function Home() {
  return (
    <>
      <Hero />
      <div className="max-w-[1500px] mx-auto px-4">
        <Products />
        <FreeService />
        <SellingProducts />
        <FreshProduct />
        <BestSelling />
        <MobileApp />
      </div>
      </>
  )
}

export default Home