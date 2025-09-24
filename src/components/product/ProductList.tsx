import { useNavigate } from "react-router-dom";
import { useState } from "react";
import type { Product } from "../../types/types";

type Props = {
    products: Product[];
};

function ProductList({ products }: Props) {
    const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
    const navigate = useNavigate();
    
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
                                onClick={() => {
                                    navigate(`/product/${product.id}`);
                                }}
                            >
                                <div className="product-image-container">
                                    <img 
                                        src={product.imageUrl} 
                                        alt={product.name} 
                                    />

                                    {isHovered && (
                                        <div className="product-overlay active">
                                            <h3 className="product-name">{product.name}</h3>
                                            <button className="order-now-btn">
                                                Order Now
                                                <span className="btn-arrow">→</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className={`product-info`}>
                                    <p className="product-description">
                                        {product.description}...
                                    </p>
                                    <div className="product-pricing">
                                        <div className="price-container">
                                            <span className="current-price">${product.price}</span>
                                            {product.oldPrice && (
                                                <span className="old-price">${product.oldPrice}</span>
                                            )}
                                        </div>
                                        <span className="product-weight">{product.weight || "500g"}</span>
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