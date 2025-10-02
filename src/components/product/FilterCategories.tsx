import type { Category } from '../../types/types';
import useCategories from '../../hooks/useCategories';
import { FaHamburger, FaPizzaSlice, FaHotdog, FaCocktail } from "react-icons/fa";
import { GiNoodles, GiCakeSlice, GiFrenchFries } from "react-icons/gi";
import { MdOutlineFastfood } from "react-icons/md";
import type { JSX } from 'react';

type Props = {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

function FilterCategories({selectedCategory, setSelectedCategory}: Props) {
  const {categories} = useCategories();

  const categoryIcons: Record<string, JSX.Element> = {
    burger: <FaHamburger />,
    pizza: <FaPizzaSlice />,
    hotdog: <FaHotdog />,
    "korean food": <GiNoodles />,
    cakes: <GiCakeSlice />,
    drinks: <FaCocktail />,
    combo: <MdOutlineFastfood />,
  };


  return (
    <div className="filter-categories-product">
      <div className="categories-list-product">
        <div
            className={`category-item-product ${selectedCategory === "" ? "active" : ""}`}
            onClick={() => setSelectedCategory("")}
          >
            <span className="category-icon">
                <GiFrenchFries />
              </span>
              <span>All</span>
          </div>
        {categories.map((category: Category) => (
          <div
            key={category.id}
            className={`category-item-product ${category.id === selectedCategory ? "active" : ""}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span className="category-icon">
              {categoryIcons[category.name.toLowerCase()] || <GiFrenchFries />} 
            </span>
            <span>{category.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FilterCategories;