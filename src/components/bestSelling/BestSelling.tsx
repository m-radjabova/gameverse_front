import FilterCategories from "../product/FilterCategories"
import useProducts from "../../hooks/useProducts";
import { Rating } from "@mui/material";
import useContextPro from "../../hooks/useContextPro";
import type { Product } from "../../types/types";

function BestSelling() {
    const { products, selectedCategory, setSelectedCategory} = useProducts();
    const { state: {cart}, dispatch } = useContextPro();


    function handleCartToggle(product: Product) {
        const isInCart = cart.some((p) => p.id === product.id);

        if (isInCart) {
            dispatch({ type: "REMOVE_FROM_CART", payload: product.id })
        } else {
            dispatch({ type: "ADD_TO_CART", payload: product })
        }
    }

  return (
    <div className="best-selling">
        <div className="best-selling-container">
            <div className="best-selling-right text-center">
               <div className="selling-products-title">
                    <h1>Best Selling</h1>
               </div>
                <FilterCategories selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
                <div className="best-selling-products">
                    {products.map((product) => (
                        <div key={product.id} className="best-selling-product-card">
                            <div className="best-selling-product-image">
                                <img src={product.imageUrl} alt={product.name} />
                            </div>
                            <div className="best-selling-product-info">
                                <h6>{product.name}</h6>
                                <p><span className="old-price">${product.oldPrice}</span>${product.price}</p>
                                <button onClick={() => handleCartToggle(product)}>
                                    {cart.some((p) => p.id === product.id) ? "Delete from Cart" : "Buy Now"}
                                </button>
                                <div className="rating-container">
                                    <Rating className="rating" name="read-only" value={product.rating} size="small" />
                                    <span className="rating">({product.rating})</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  )
}

export default BestSelling