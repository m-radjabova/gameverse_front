import { useState } from "react";
import useContextPro from "../../hooks/useContextPro";
import UseModal from "../../hooks/UseModal";
import { useForm, type FieldValues } from "react-hook-form";
import {  updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider 
} from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";
import { toast } from "react-toastify";
import useLoading from "../../hooks/useLoading";
import useProducts from "../../hooks/useProducts";

function Profile() {
  const {reviews} = useProducts();
  const { loading } = useLoading();
  const { state: { user, cart } } = useContextPro();
  const [open, setOpen] = useState(false);
  const [openPassword, setOpenPassword] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
  const { register: registerPass, handleSubmit: handlePassSubmit, reset: resetPass } = useForm();

  const updateProfileHandler = async (data: FieldValues) => {
    if (!auth.currentUser) return;
    try {
      if (data.name) {
        await updateProfile(auth.currentUser, { displayName: data.name });
      }
      if (data.email && data.email !== auth.currentUser.email) {
        await updateEmail(auth.currentUser, data.email);
      }

      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        name: data.name || user?.name,
        email: data.email || user?.email,
      });

      toast.success("Profile updated successfully!");
      setOpen(false);
      reset();
    } catch (error: any) {
      console.error("❌ Update error:", error);
      alert(error.message);
    }
  };

  const changePasswordHandler = async (data: FieldValues) => {
    if (!auth.currentUser || !auth.currentUser.email) return;
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        data.oldPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      await updatePassword(auth.currentUser, data.newPassword);

      toast.success("🔐 Parol muvaffaqiyatli o‘zgartirildi!");
      setOpenPassword(false);
      resetPass();
    } catch (error: any) {
      console.error("❌ Password update error:", error);
      alert(error.message);
    }
  };

  const userReviews = reviews.filter(review => review.userId === user?.uid);


  if (loading) {
    return (
      <div className="admin-carousel">
        <div className="loading-state">
          <div className="dash-loading-spinner"></div>
        </div>
      </div>
    );
  }
  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="profile-avatar-circle">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="online-indicator"></div>
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{user?.name || "User"}</h1>
          <p className="profile-email">{user?.email || "No email provided"}</p>
          <div className="profile-badge">Breakfast Lover 🥐</div>
        </div>
      </div>

      <div className="profile-stats">
        <div className="profile-stat-card">
          <div className="profile-stat-icon">🛒</div>
          <div className="profile-stat-content">
            <div className="profile-stat-number">{cart?.length || 0}</div>
            <div className="profile-stat-label">Cart Items</div>
          </div>
        </div>
        <div className="profile-stat-card">
          <div className="profile-stat-icon">⭐</div>
          <div className="profile-stat-content">
            <div className="profile-stat-number">{userReviews?.length }</div>
            <div className="profile-stat-label">Reviews</div>
          </div>
        </div>
        <div className="profile-stat-card">
          <div className="profile-stat-icon">❤️</div>
          <div className="profile-stat-content">
            <div className="profile-stat-number">28</div>
            <div className="profile-stat-label">Favorites</div>
          </div>
        </div>
      </div>

      <div className="profile-details">
        <div className="profile-detail-section">
          <h3 className="section-title">Personal Information</h3>
          <div className="profile-detail-grid">
            <div className="profile-detail-item">
              <label>Full Name</label>
              <p>{user?.name || "Not provided"}</p>
            </div>
            <div className="profile-detail-item">
              <label>Email Address</label>
              <p>{user?.email || "Not provided"}</p>
            </div>
            <div className="profile-detail-item">
              <label>Member Since</label>
              <p>January 2024</p>
            </div>
            <div className="profile-detail-item">
              <label>Favorite Item</label>
              <p>Croissant & Coffee ☕</p>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3 className="section-title">Preferences</h3>
          <div className="preferences">
            <span className="preference-tag">Morning Person</span>
            <span className="preference-tag">Coffee Lover</span>
            <span className="preference-tag">Pastry Enthusiast</span>
            <span className="preference-tag">Healthy Options</span>
          </div>
          <div className="update-buttons">
            <button className="update-profile-btn" onClick={() => setOpen(true)}>Update Profile</button>
            <button className="change-password-btn" onClick={() => setOpenPassword(true)}>Change Password</button>
          </div>
        </div>
      </div>
      <UseModal 
        isOpen={open} 
        onClose={() => setOpen(false)}
        title="Update Profile"
        size="md"
      >
        <form onSubmit={handleSubmit(updateProfileHandler)}>
          <div className="mb-3">
            <label className="form-label" htmlFor="name">Name</label>
            <input className="form-control" type="text" id="name" defaultValue={user?.name} {...register("name")} />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="email">Email</label>
            <input className="form-control" type="email" id="email" defaultValue={user?.email} {...register("email")} />
          </div>
          <button className="update-profile-btn mt-3 w-100" 
            type="submit"
            disabled={isSubmitting}
            style={{ opacity: isSubmitting ? 0.5 : 1 }}
          >
            {isSubmitting ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </UseModal>

      <UseModal 
        isOpen={openPassword} 
        onClose={() => setOpenPassword(false)}
        title="Change Password"
        size="md"
      >
        <form onSubmit={handlePassSubmit(changePasswordHandler)}>
          <div className="mb-3">
            <label className="form-label" htmlFor="oldPassword">Old Password</label>
            <input className="form-control" type="password" id="oldPassword" {...registerPass("oldPassword", { required: true })} />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="newPassword">New Password</label>
            <input className="form-control" type="password" id="newPassword" {...registerPass("newPassword", { required: true, minLength: 6 })} />
          </div>
          <button className="change-password-btn mt-3 w-100" 
            type="submit"
            disabled={isSubmitting}
            style={{ opacity: isSubmitting ? 0.5 : 1 }}
          > {isSubmitting ? "Updating..." : "Change Password"}</button>
        </form>
      </UseModal>
    </div>
  );
}

export default Profile;