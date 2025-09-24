import useProducts from "../../hooks/useProducts";
import FilterCategories from "../product/FilterCategories";
import ProductList from "../product/ProductList";

function SellingProducts() {
  const {products, selectedCategory, setSelectedCategory} = useProducts();


  return (
    <div className="selling-products">
        <div className="selling-products-container">
            <div className="selling-products-title">
                <h1>Best Selling Products</h1>
            </div>
            <FilterCategories selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory}/>
            <ProductList products={products}  />
        </div>
    </div>
  )
}

export default SellingProducts