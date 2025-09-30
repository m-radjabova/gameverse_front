import { Controller, useForm } from "react-hook-form"
import { Rating } from '@mui/material'
import { useState } from "react"
import useContextPro from "../hooks/useContextPro"
import useProducts from "../hooks/useProducts"

interface ReviewFormData {
  title: string
  rating: number
}

function ReviewForm({ productId }: { productId: string }) {
  const { addReview } = useProducts()
  const { control, register, handleSubmit, reset, formState: { errors }, watch } = useForm<ReviewFormData>({
    defaultValues: {
      rating: 0,
      title: ""
    }
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { state: { user } } = useContextPro()

  const ratingValue = watch("rating")

  const onSubmit = async (data: ReviewFormData) => {
    console.log("Form data:", data);
    console.log("User:", user);
    
    if (!data.rating || !user?.uid) {
      console.log("Missing rating or user ID");
      console.log("Rating:", data.rating);
      console.log("User ID:", user?.uid);
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Submitting review...");
      const reviewData = {
        title: data.title,
        rating: Number(data.rating), 
        userId: user.uid,
        createdAt: new Date() 
      };
      
      console.log("Review data to submit:", reviewData);
      
      await addReview(productId, reviewData);
      console.log("Review submitted successfully");
      
      reset();
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="review-login-prompt">
        <div className="login-prompt-content">
          <div className="login-icon">🔒</div>
          <h3>Sign In to Leave a Review</h3>
          <p>Please sign in to share your experience with this product</p>
          <button className="login-btn">Sign In</button>
        </div>
      </div>
    )
  }

  return (
    <div className="review-form-section">
      <div className="review-form-header">
        <h2>Write a Review</h2>
        <p>Share your thoughts with other customers</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="review-form">
        <div className="form-group">
          <label className="form-label">Overall Rating *</label>
          <div className="rating-selector">
            <Controller
              control={control}
              name="rating"
              rules={{ 
                required: "Rating is required",
                min: { value: 1, message: "Please select at least 1 star" }
              }}
              render={({ field }) => (
                <Rating
                  {...field}
                  value={Number(field.value)}
                  onChange={(_, value) => {
                    console.log("Rating changed:", value);
                    field.onChange(value || 0);
                  }}
                  size="large"
                  className="rating-stars"
                />
              )}
            />
            <span className="rating-text">
              {ratingValue ? `${ratingValue}/5` : 'Select rating'}
            </span>
          </div>
          {errors.rating && (
            <span className="error-message">{errors.rating.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Review Content *
          </label>
          <textarea
            id="title"
            placeholder="Share details of your experience with this product..."
            rows={6}
            className={`form-textarea ${errors.title ? 'error' : ''}`}
            {...register("title", { 
              required: "Review content is required",
              minLength: {
                value: 10,
                message: "Review must be at least 10 characters"
              },
              maxLength: {
                value: 1000,
                message: "Review must be less than 1000 characters"
              }
            })}
          />
          {errors.title && (
            <span className="error-message">{errors.title.message}</span>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => {
              reset();
            }}
            className="cancel-btn"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReviewForm;