import Footer from "../../components/footer/Footer";
import ProductList from "../../components/product/ProductList"
import useCategories from "../../hooks/useCategories"
import { FaShopify } from "react-icons/fa";
import useLoading from "../../hooks/useLoading";
import IsLoading from "../../components/IsLoading";
import useProducts from "../../hooks/useProducts";

function ShopPage() {
    const {products, selectedCategory, setSelectedCategory} = useProducts();
    const { categories } = useCategories();
    const {loading} = useLoading();

    if (loading) {
        return <IsLoading />;
    }
    return (
        <div className="shop-page">
            <div className="shop-page-title">
                <h1>Shop Page<FaShopify /></h1>
                <p>Breakfast is the most important meal of the day</p>
            </div>
            
            <div className="shop-page-container">
                <div className={`shop-left-content`}>
                    <ul className="category-list-shop">
                        <li 
                            className={`category-item-shop ${selectedCategory === null ? 'active' : ''}`}
                            onClick={() => setSelectedCategory("")}
                        >
                            <FaShopify />
                            <span>All</span>
                        </li>
                        {categories.map((category) => (
                            <li 
                                className={`category-item-shop ${selectedCategory === category.id ? 'active' : ''}`} 
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                <span>{category.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="shop-right-content">
                    <ProductList products={products} />
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default ShopPage;