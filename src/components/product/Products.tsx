import useProducts from "../../hooks/useProducts";
import ProductList from "./ProductList";

function Products() {
    const { products } = useProducts();
    return (
        <div className="products">
            <div className="products-container">
                <div className="selling-products-title">
                    <h1>New Products</h1>
                </div>
                <ProductList products={products} />
            </div>
        </div>
    );
}

export default Products;