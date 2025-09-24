import { FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';
import { FiShoppingBag } from 'react-icons/fi';
import { NavLink, useNavigate } from 'react-router-dom';
import { type FieldValues, useForm } from 'react-hook-form';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import type { User } from '../../types/types';

const LoginForm = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const Login = async (data: FieldValues) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, data.email, data.password);
      localStorage.setItem("token", user.uid);
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const currentUser = { id: user.uid, ...userDocSnap.data() } as User;
        console.log("currentUser", currentUser);
        
        if (currentUser?.roles) {
          localStorage.setItem("role", currentUser.roles.join(","));
          navigate("/", { replace: true });
        } else {
          localStorage.removeItem("role");
        }
      } else {
        localStorage.removeItem("role");
        toast.warn("User role topilmadi.");
      }
    } catch (error : any) {
      const code = error?.code as string | undefined;
      console.log(error)
      switch (code) {
        case "auth/user-not-found":
          toast.error("Account topilmadi. Iltimos, ro'yxatdan o'ting!");
          break;
        case "auth/wrong-password":
        case "auth/invalid-credential":
          toast.error("Noto'g'ri email yoki parol. Qayta urinib ko'ring.");
          break;
        case "auth/invalid-email":
          toast.error("Email manzili noto'g'ri formatda.");
          break;
        case "auth/too-many-requests":
          toast.error("Juda ko'p urinish. Iltimos, birozdan keyin qayta urinib ko'ring.");
          break;
        default:
          toast.error("Kirishda hatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
      }
    }
  };


  return (
    <div className="login d-flex justify-content-center align-items-center min-vh-100" style={{ 
      backgroundColor: '#fff8f0',
      backgroundImage: 'linear-gradient(rgba(255,165,0,0.05), rgba(255,165,0,0.05))'
    }}>
      <div className="login-form bg-white p-4 p-md-5 rounded-4 shadow" style={{ 
        width: '95%', 
        maxWidth: '450px',
        border: 'none',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          backgroundColor: 'rgba(255, 165, 0, 0.1)',
          borderRadius: '50%',
          zIndex: 0
        }}></div>
        
        <div className="text-center mb-4" style={{ position: 'relative', zIndex: 1 }}>
          <FiShoppingBag className="mb-3" style={{ 
            fontSize: '2.5rem', 
            color: '#ff8c00',
            filter: 'drop-shadow(0 2px 4px rgba(255,140,0,0.3))'
          }} />
          <h1 className="fw-bold" style={{ color: '#ff8c00' }}>Welcome Back</h1>
          <p className="text-muted">Sign in to your FastFood account</p>
        </div>

        <form onSubmit={handleSubmit(Login)} style={{ position: 'relative', zIndex: 1 }}>
          <div className="mb-4">
            <label htmlFor="email" className="form-label fw-semibold">Email Address</label>
            <div className="input-group">
              <span className="input-group-text bg-white" style={{ 
                borderRight: 'none',
                borderColor: '#ff8c00'
              }}>
                <FaEnvelope style={{ color: '#ff8c00' }} />
              </span>
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="your@email.com"
                {...register('email', { required: true })}
                style={{ 
                  borderLeft: 'none',
                  borderColor: '#ff8c00',
                  boxShadow: 'none'
                }}
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-semibold">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-white" style={{ 
                borderRight: 'none',
                borderColor: '#ff8c00'
              }}>
                <FaLock style={{ color: '#ff8c00' }} />
              </span>
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="••••••••"
                {...register('password', { required: true })}
                style={{ 
                  borderLeft: 'none',
                  borderColor: '#ff8c00',
                  boxShadow: 'none'
                }}
              />
            </div>
            <div className="text-end mt-2">
              <NavLink 
                to="/forgot-password" 
                style={{ 
                  color: '#ff8c00', 
                  fontSize: '0.85rem',
                  textDecoration: 'none'
                }}
              >
                Forgot password?
              </NavLink>
            </div>
          </div>

          <button
            type="submit"
            className="btn w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
            style={{ 
              backgroundColor: '#ff8c00', 
              color: 'white',
              borderRadius: '50px',
              border: 'none',
              boxShadow: '0 4px 15px rgba(255, 140, 0, 0.3)',
              transition: 'all 0.3s ease',
              fontSize: '1.1rem',
              position: 'relative',
              overflow: 'hidden',
              zIndex: 1
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#ff6b00';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 140, 0, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = '#ff8c00';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 140, 0, 0.3)';
            }}
          >
            <span style={{ position: 'relative', zIndex: 2 }}>Sign In</span>
            <FaArrowRight style={{ position: 'relative', zIndex: 2 }} />
            <span style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              zIndex: 0
            }}></span>
          </button>

          <div className="text-center mt-4">
            <p className="text-muted small mb-0">
              Don't have an account?{' '}
              <NavLink 
                to="/sign-up" 
                style={{ 
                  color: '#ff8c00', 
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                Create one
              </NavLink>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;