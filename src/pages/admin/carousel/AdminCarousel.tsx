import { useForm, type FieldValues } from "react-hook-form"
import { useState } from "react"
import UseModal from "../../../hooks/UseModal"
import UseDeleteModal from "../../../hooks/UseDeleteModal"
import type { CarouselItem } from "../../../types/types"
import useCarousel from "../../../hooks/useCarousel"

function AdminCarousel() {
  const {register, handleSubmit, formState: {errors}, reset, setValue} = useForm()
  const {carousel,addCarousel, updateCarousel, deleteCarousel} = useCarousel()
  const [isOpen, setIsOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingCarousel, setEditingCarousel] = useState<CarouselItem | null>(null);
  const [carouselToDelete, setCarouselToDelete] = useState<CarouselItem | null>(null);
  
  const onSubmit = (data: FieldValues) => {
    const carouselData = {
      title1: data.title1,
      title2: data.title2,
      imgUrl: data.imgUrl,
      descreption: data.descreption
    };

    if (editingCarousel) {
      updateCarousel(editingCarousel.id, carouselData);
    } else {
      addCarousel({
        id: Date.now().toString(),
        ...carouselData,
        createdAt: new Date().toISOString()
      });
    }
    setIsOpen(false);
    reset();
    setEditingCarousel(null);
  }

  const handleEdit = (carouselItem: CarouselItem) => {
    setEditingCarousel(carouselItem);
    setValue("title1", carouselItem.title1);
    setValue("title2", carouselItem.title2);
    setValue("imgUrl", carouselItem.imgUrl);
    setValue("descreption", carouselItem.descreption);
    setIsOpen(true);
  }

  const handleDeleteClick = (carouselItem: CarouselItem) => {
    setCarouselToDelete(carouselItem);
    setDeleteModalOpen(true);
  }

  const confirmDelete = () => {
    if (carouselToDelete) {
      deleteCarousel(carouselToDelete.id);
    }
    setDeleteModalOpen(false);
    setCarouselToDelete(null);
  }

  const handleAddNew = () => {
    setEditingCarousel(null);
    reset();
    setIsOpen(true);
  }

  const handleCloseModal = () => {
    setIsOpen(false);
    setEditingCarousel(null);
    reset();
  }

//   if (loading) {
//     return (
//       <div className="admin-carousel">
//         <div className="loading-state">
//           <div className="loading-spinner"></div>
//           <p>Loading carousel items...</p>
//         </div>
//       </div>
//     );
//   }

  return (
    <div className="admin-carousel">
      <div className="admin-carousel-header">
        <div className="header-content">
          <h1>Carousel Management</h1>
        </div>
        <button onClick={handleAddNew} className="add-product-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>Create Slide</span>
        </button>
        <div className="divider"></div>
      </div>

      <div className="admin-carousel-body">
        {carousel.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🖼️</div>
            <h3>No carousel slides yet</h3>
            <p>Create engaging slides for your homepage carousel</p>
            <button onClick={handleAddNew} className="empty-action-btn">
              + Create First Slide
            </button>
          </div>
        ) : (
          <div className="carousel-grid">
            {carousel.map((item) => (
              <div key={item.id} className="carousel-card">
                <div className="carousel-image">
                  <img src={item.imgUrl} alt={item.title1} />
                  <div className="carousel-overlay">
                    <span className="slide-badge">Slide Preview</span>
                  </div>
                </div>
                
                <div className="carousel-content">
                  <div className="carousel-text">
                    <h3 className="carousel-title1">{item.title1}</h3>
                    <h4 className="carousel-title2">{item.title2}</h4>
                    <p className="carousel-description">{item.descreption}</p>
                  </div>
                  
                  <div className="carousel-actions">
                    <button 
                      className="action-btn edit-btn" 
                      onClick={() => handleEdit(item)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2"/>
                        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Edit
                    </button>
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => handleDeleteClick(item)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <UseModal 
          isOpen={isOpen} 
          onClose={handleCloseModal}
          title={editingCarousel ? "Update Carousel Slide" : "Create New Slide"}
          size="lg"
        >
          <div className="modal-content-custom">
            <form onSubmit={handleSubmit(onSubmit)} className="carousel-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="title1">Main Title</label>
                  <input 
                    type="text" 
                    id="title1" 
                    placeholder="Enter main title"
                    {...register("title1", { required: "Main title is required" })} 
                  />
                  {errors.title1 && <span className="error">Main title is required</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="title2">Subtitle</label>
                  <input 
                    type="text" 
                    id="title2" 
                    placeholder="Enter subtitle"
                    {...register("title2", { required: "Subtitle is required" })} 
                  />
                  {errors.title2 && <span className="error">Subtitle is required</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="imgUrl">Image URL</label>
                <input 
                  type="text" 
                  id="imgUrl" 
                  placeholder="https://example.com/image.jpg"
                  {...register("imgUrl", { required: "Image URL is required" })} 
                />
                {errors.imgUrl && <span className="error">Image URL is required</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="descreption">Descreption</label>
                <textarea 
                  id="descreption" 
                  rows={3}
                  placeholder="Enter slide descreption"
                  {...register("descreption", { required: "Descreption is required" })} 
                />
                {errors.descreption && <span className="error">Descreption is required</span>}
              </div>
              
              {editingCarousel && (
                <div className="image-preview">
                  <label>Image Preview</label>
                  <div className="preview-container">
                    <img src={editingCarousel.imgUrl} alt="Preview" />
                  </div>
                </div>
              )}
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingCarousel ? "Update Slide" : "Create Slide"}
                </button>
              </div>
            </form>
          </div>
        </UseModal>

        <UseDeleteModal 
          isOpen={deleteModalOpen} 
          onClose={() => setDeleteModalOpen(false)} 
          onConfirm={confirmDelete}
          title="Delete Carousel Slide"
          message={carouselToDelete ? `Are you sure you want to delete the slide "${carouselToDelete.title1}"? This action cannot be undone.` : "Are you sure you want to delete this slide?"}
        />
      </div>
    </div>
  )
}

export default AdminCarousel;