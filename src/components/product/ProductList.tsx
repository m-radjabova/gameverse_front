import { useState } from "react";
import type { Product } from "../../types/types";
import useContextPro from "./../../hooks/useContextPro";
import { useNavigate } from "react-router-dom";
import useProducts from "../../hooks/useProducts";

type Props = {
  products: Product[];
};

function ProductList({ products }: Props) {
  const {
    state: { cart },
    dispatch,
  } = useContextPro();
  const {loading} = useProducts();
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const navigate = useNavigate();

  function handleCartToggle(product: Product) {
    const isInCart = cart.some((p) => p.id === product.id);

    if (isInCart) {
      dispatch({ type: "REMOVE_FROM_CART", payload: product.id });
    } else {
      dispatch({ type: "ADD_TO_CART", payload: product });
    }
  }

   if (loading) { return <div className="products-loading">
                            <div className="loading-spinner">   
                            </div>
                        </div>;}
  return (
    <div>
      <div className="products-list">
        {products.map((product) => {
          const isHovered = hoveredProduct === product.id;
          return (
            <div
              key={product.id}
              className={`product-card`}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/shop/${product.id}`);
              }}
            >
              <div className="product-image-container">
                <img src={product.imageUrl} alt={product.name} />

                {isHovered && (
                  <div className="product-overlay active">
                    <h3 className="product-name">{product.name}</h3>
                    <button
                      onClick={() => handleCartToggle(product)}
                      className="order-now-btn"
                    >
                      {cart.some((p) => p.id === product.id)
                        ? "Delete Order"
                        : "Order Now"}
                    </button>
                  </div>
                )}
              </div>

              <div className={`product-info`}>
                <p className="product-description">{product.description}...</p>
                <div className="product-pricing">
                  <div className="price-container">
                    <span className="current-price">${product.price}</span>
                    {product.oldPrice && (
                      <span className="old-price">${product.oldPrice}</span>
                    )}
                  </div>
                  <span className="product-weight">
                    {product.weight || "500g"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProductList;
