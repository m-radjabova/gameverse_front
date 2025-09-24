import type { Category } from '../../types/types';
import useCategories from '../../hooks/useCategories';
type Props = {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

function FilterCategories({selectedCategory, setSelectedCategory}: Props) {
  const {categories} = useCategories();

  console.log("selectedCategory", selectedCategory)

  return (
    <div className="filter-categories">
      <div className="categories-list">
        <div
            className={`category-item ${selectedCategory === "" ? "active" : ""}`}
            onClick={() => setSelectedCategory("")}
          >
            <span>All</span>
          </div>
        {categories.map((category: Category) => (
          <div
            key={category.id}
            className={`category-item ${category.id === selectedCategory ? "active" : ""}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <span>{category.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FilterCategories;