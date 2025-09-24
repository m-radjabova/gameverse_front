import { useForm, type FieldValues } from "react-hook-form";
import useCategories from "../../../hooks/useCategories";
import { useState } from "react";
import UseModal from "../../../hooks/UseModal";
import useProducts from "../../../hooks/useProducts";
import type { Product } from "../../../types/types";
import UseDeleteModal from "../../../hooks/UseDeleteModal";

function AdminProduct() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm();
  const { categories } = useCategories();
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setValue("name", product.name);
    setValue("description", product.description);
    setValue("price", product.price);
    setValue("oldPrice", product.oldPrice || "");
    setValue("imageUrl", product.imageUrl);
    setValue("categoryId", product.categoryId || "");
    setValue("rating", product.rating || "");
    setValue("weight", product.weight || "");

    setIsOpen(true);
  };

  const onSubmit = (data: FieldValues) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...data,
        price: Number(data.price),
        oldPrice: data.oldPrice ? Number(data.oldPrice) : undefined,
        rating: data.rating ? Number(data.rating) : 0,
        weight: data.weight ? String(data.weight) : undefined,
      });
    } else {
      addProduct({
        ...data,
        price: Number(data.price),
        oldPrice: data.oldPrice !== undefined ? Number(data.oldPrice) : 0,
        rating: data.rating ? Number(data.rating) : 0,
        weight: data.weight ? String(data.weight) : "",
        createdAt: new Date().toISOString(),
      });
    }

    setIsOpen(false);
    reset();
    setEditingProduct(null);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setEditingProduct(null);
    reset();
  };

  const handleDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
    }
    setOpenDelete(false);
    setProductToDelete(null);
  };

  return (
    <div className="admin-product">
      <div className="admin-product-header">
        <h1>Product Management</h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            reset();
            setIsOpen(true);
          }}
          className="add-product-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>Create Product</span>
        </button>
        <div className="divider"></div>
      </div>

      <div className="admin-product-body">
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product.imageUrl} alt={product.name} />
                <div className="product-actions">
                  <button
                    className="action-btn edit"
                    onClick={() => handleEditClick(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => {
                      setProductToDelete(product);
                      setOpenDelete(true);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="price-container">
                  {product.oldPrice && (
                    <span className="old-price">${product.oldPrice}</span>
                  )}
                  <span className="current-price">${product.price}</span>
                </div>
                <div className="product-meta">
                  <span className="rating">⭐ {product.rating || "N/A"}</span>
                  <span className="weight">{product.weight || "N/A"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <UseModal
          isOpen={isOpen}
          onClose={handleCloseModal}
          title={editingProduct ? "Update Product" : "Create Product"}
          size="lg"
          showCloseButton={true}
        >
          <div className="modal-content-custom">
            <form onSubmit={handleSubmit(onSubmit)} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Product Name</label>
                  <input
                    type="text"
                    id="name"
                    {...register("name", { required: true })}
                  />
                  {errors.name && (
                    <span className="error">Product name is required</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="price">Price ($)</label>
                  <input
                    type="number"
                    id="price"
                    step="0.01"
                    {...register("price", { required: true })}
                  />
                  {errors.price && (
                    <span className="error">Price is required</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  rows={3}
                  {...register("description", { required: true })}
                />
                {errors.description && (
                  <span className="error">Description is required</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="oldPrice">Old Price ($)</label>
                  <input
                    type="number"
                    id="oldPrice"
                    step="0.01"
                    {...register("oldPrice")}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="categoryId">Category</label>
                  <select
                    id="categoryId"
                    {...register("categoryId", { required: true })}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <span className="error">Category is required</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="rating">Rating (1-5)</label>
                  <input
                    type="number"
                    id="rating"
                    min="1"
                    max="5"
                    step="0.1"
                    {...register("rating")}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="weight">Weight (g)</label>
                  <input type="text" id="weight" {...register("weight")} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="imageUrl">Product Image URL</label>
                <input
                  type="text"
                  id="imageUrl"
                  {...register("imageUrl", { required: true })}
                />
                {errors.imageUrl && (
                  <span className="error">Product image is required</span>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </UseModal>
        <UseDeleteModal
          key={productToDelete?.id}
          isOpen={openDelete}
          onClose={() => setOpenDelete(false)}
          onConfirm={handleDelete}
          title="Delete Product"
          message={`Are you sure you want to delete "${productToDelete?.name}"?`}
        />
      </div>
    </div>
  );
}

export default AdminProduct;
