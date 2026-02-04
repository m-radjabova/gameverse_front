import { NavLink, useNavigate } from "react-router-dom";
import Logo from "../../assets/studylogo.svg";

function Header() {
  const navigate = useNavigate();
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-white/90 hover:text-white transition-all duration-300 font-medium relative pb-1 ${
      isActive ? "text-white" : ""
    } hover:opacity-100 group`;

  return (
    <header className="w-full bg-gradient-to-r from-teal-500 to-teal-600 shadow-lg sticky top-0 z-50">
      <div className="mx-auto max-w-8xl px-6">
        <div className="h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 hover-scale">
            <img src={Logo} alt="logo" className="h-10 w-auto transition-transform duration-300" />
          </div>

          <nav className="hidden md:block">
            <ul className="flex items-center gap-10">
              <li>
                <NavLink to="/home" className={linkClass}>
                  <span className="relative">
                    Home
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white/70 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/courses" className={linkClass}>
                  <span className="relative">
                    Courses
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white/70 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/careers" className={linkClass}>
                  <span className="relative">
                    Careers
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white/70 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/blog" className={linkClass}>
                  <span className="relative">
                    Blog
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white/70 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/about" className={linkClass}>
                  <span className="relative">
                    About Us
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white/70 transition-all duration-300 group-hover:w-full"></span>
                  </span>
                </NavLink>
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/login")} className="h-10 px-6 rounded-full bg-white text-teal-600 font-semibold hover:bg-white/90 transition-all duration-300 hover-lift hover-shine shadow-md">
              Login
            </button>
            <button onClick={() => navigate("/register")} className="h-10 px-6 rounded-full bg-white/25 text-white font-semibold hover:bg-white/40 transition-all duration-300 hover-lift border border-white/30 backdrop-blur-sm">
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
