import {
  FaArrowRight,
  FaEnvelope,
  FaLock,
  FaUser,
  FaUtensils,
} from "react-icons/fa";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";

type RegisterFormInputs = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormInputs>();
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<RegisterFormInputs> = async (data) => {
    const { name, email, password, confirmPassword } = data;
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await updateProfile(user, { displayName: name });
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name,
        email,
        roles: ["USER"],
        createdAt: new Date(),
      });

      toast.success("Registration successful!");
      reset();
      navigate("/login");
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case "auth/email-already-in-use":
            toast.error("Email is already registered.");
            break;
          case "auth/invalid-email":
            toast.error("Invalid email address.");
            break;
          case "auth/weak-password":
            toast.error("Password should be at least 6 characters.");
            break;
          default:
            toast.error("Registration failed. Please try again.");
        }
      } else {
        console.error("❌ Unknown error:", error);
        toast.error("An unknown error occurred. Please try again.");
      }
    }
  };

  return (
    <div
      className="signup d-flex justify-content-center align-items-center min-vh-100"
      style={{
        backgroundColor: "#fef7f9",
        backgroundImage:
          "linear-gradient(135deg, rgba(226, 26, 67, 0.03) 0%, rgba(255, 255, 255, 0.9) 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorative elements */}
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "30%",
          height: "50%",
          backgroundColor: "rgba(226, 26, 67, 0.05)",
          borderRadius: "50%",
          filter: "blur(40px)",
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          bottom: "-10%",
          right: "-5%",
          width: "40%",
          height: "40%",
          backgroundColor: "rgba(226, 26, 67, 0.05)",
          borderRadius: "50%",
          filter: "blur(40px)",
        }}
      ></div>

      <div
        className="signup-form bg-white p-4 p-md-5 rounded-4 shadow"
        style={{
          width: "95%",
          maxWidth: "500px",
          border: "none",
          position: "relative",
          overflow: "hidden",
          zIndex: 1,
          boxShadow: "0 10px 30px rgba(226, 26, 67, 0.1) !important",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "-30px",
            right: "-30px",
            width: "120px",
            height: "120px",
            backgroundColor: "rgba(226, 26, 67, 0.08)",
            borderRadius: "50%",
            zIndex: 0,
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            bottom: "-20px",
            left: "-20px",
            width: "80px",
            height: "80px",
            backgroundColor: "rgba(226, 26, 67, 0.06)",
            borderRadius: "50%",
            zIndex: 0,
          }}
        ></div>

        <div
          className="text-center mb-4"
          style={{ position: "relative", zIndex: 1 }}
        >
          <div
            className="mb-3"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "70px",
              height: "70px",
              backgroundColor: "rgba(226, 26, 67, 0.1)",
              borderRadius: "50%",
              marginBottom: "1rem",
            }}
          >
            <FaUtensils
              style={{
                fontSize: "2rem",
                color: "#E21A43",
              }}
            />
          </div>
          <h2
            className="fw-bold mb-2"
            style={{
              color: "#E21A43",
              fontSize: "2rem",
              background: "linear-gradient(135deg, #E21A43 0%, #FF6B9D 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Join Perfect Breakfast
          </h2>
          <p className="text-muted" style={{ fontSize: "1rem" }}>
            Create your account to start ordering
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ position: "relative", zIndex: 1 }}
        >
          <div className="mb-4">
            <label
              htmlFor="name"
              className="form-label fw-semibold"
              style={{ color: "#333" }}
            >
              Full Name
            </label>
            <div className="input-group input-group-lg">
              <span
                className="input-group-text bg-white"
                style={{
                  borderRight: "none",
                  borderColor: "rgba(226, 26, 67, 0.3)",
                  borderTopLeftRadius: "12px",
                  borderBottomLeftRadius: "12px",
                }}
              >
                <FaUser style={{ color: "#E21A43" }} />
              </span>
              <input
                {...register("name", { required: true })}
                type="text"
                className="form-control"
                id="username"
                style={{
                  borderLeft: "none",
                  borderColor: "rgba(226, 26, 67, 0.3)",
                  boxShadow: "none",
                  borderTopRightRadius: "12px",
                  borderBottomRightRadius: "12px",
                  padding: "0.75rem 1rem",
                  fontSize: "1rem",
                }}
              />
            </div>
            {errors.name && (
              <p className="text-danger mt-2 small">Name is required</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="form-label fw-semibold"
              style={{ color: "#333" }}
            >
              Email Address
            </label>
            <div className="input-group input-group-lg">
              <span
                className="input-group-text bg-white"
                style={{
                  borderRight: "none",
                  borderColor: "rgba(226, 26, 67, 0.3)",
                  borderTopLeftRadius: "12px",
                  borderBottomLeftRadius: "12px",
                }}
              >
                <FaEnvelope style={{ color: "#E21A43" }} />
              </span>
              <input
                {...register("email", { required: true })}
                type="email"
                className="form-control"
                id="email"
                style={{
                  borderLeft: "none",
                  borderColor: "rgba(226, 26, 67, 0.3)",
                  boxShadow: "none",
                  borderTopRightRadius: "12px",
                  borderBottomRightRadius: "12px",
                  padding: "0.75rem 1rem",
                  fontSize: "1rem",
                }}
              />
            </div>
            {errors.email && (
              <p className="text-danger mt-2 small">Email is required</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="form-label fw-semibold"
              style={{ color: "#333" }}
            >
              Password
            </label>
            <div className="input-group input-group-lg">
              <span
                className="input-group-text bg-white"
                style={{
                  borderRight: "none",
                  borderColor: "rgba(226, 26, 67, 0.3)",
                  borderTopLeftRadius: "12px",
                  borderBottomLeftRadius: "12px",
                }}
              >
                <FaLock style={{ color: "#E21A43" }} />
              </span>
              <input
                {...register("password", { required: true, minLength: 8 })}
                type="password"
                className="form-control"
                id="password"
                style={{
                  borderLeft: "none",
                  borderColor: "rgba(226, 26, 67, 0.3)",
                  boxShadow: "none",
                  borderTopRightRadius: "12px",
                  borderBottomRightRadius: "12px",
                  padding: "0.75rem 1rem",
                  fontSize: "1rem",
                }}
              />
            </div>
            {errors.password && (
              <p className="text-danger mt-2 small">
                {errors.password.type === "required"
                  ? "Password is required"
                  : "Password must be at least 8 characters"}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="confirm-password"
              className="form-label fw-semibold"
              style={{ color: "#333" }}
            >
              Confirm Password
            </label>
            <div className="input-group input-group-lg">
              <span
                className="input-group-text bg-white"
                style={{
                  borderRight: "none",
                  borderColor: "rgba(226, 26, 67, 0.3)",
                  borderTopLeftRadius: "12px",
                  borderBottomLeftRadius: "12px",
                }}
              >
                <FaLock style={{ color: "#E21A43" }} />
              </span>
              <input
                {...register("confirmPassword", { required: true })}
                type="password"
                className="form-control"
                id="confirm-password"
                style={{
                  borderLeft: "none",
                  borderColor: "rgba(226, 26, 67, 0.3)",
                  boxShadow: "none",
                  borderTopRightRadius: "12px",
                  borderBottomRightRadius: "12px",
                  padding: "0.75rem 1rem",
                  fontSize: "1rem",
                }}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-danger mt-2 small">
                Please confirm your password
              </p>
            )}
          </div>

          <button
            disabled={isSubmitting}
            type="submit"
            className="btn w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
            style={{
              background: "linear-gradient(135deg, #E21A43 0%, #FF6B9D 100%)",
              color: "white",
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 15px rgba(226, 26, 67, 0.3)",
              transition: "all 0.4s ease",
              fontSize: "1.1rem",
              position: "relative",
              overflow: "hidden",
              zIndex: 1,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(226, 26, 67, 0.4)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 15px rgba(226, 26, 67, 0.3)";
            }}
          >
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
              </>
            ) : (
              <>
                <span style={{ position: "relative", zIndex: 2 }}>
                  Register
                </span>
              </>
            )}
            <FaArrowRight style={{ position: "relative", zIndex: 2 }} />
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                transition: "left 0.7s",
                zIndex: 0,
              }}
              className="btn-shine"
            ></div>
          </button>

          <div
            className="text-center mt-4 pt-3"
            style={{ borderTop: "1px solid rgba(226, 26, 67, 0.1)" }}
          >
            <p className="text-muted small mb-0">
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#E21A43",
                  fontWeight: "600",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                }}
                className="hover-underline"
              >
                Login here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
