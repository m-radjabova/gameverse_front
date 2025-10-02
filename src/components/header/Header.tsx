import { Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from '../../assets/Logo (3).svg';
import userLogo from "../../assets/Profile.svg";
import cartLogo from "../../assets/Buy.svg";
import useContextPro from '../../hooks/useContextPro';
import { Avatar, Box, Menu, MenuItem, Typography } from '@mui/material';
import { FaChevronDown, FaSearch, FaSignOutAlt, FaTruck, FaUser, FaUserAlt, FaUserShield } from 'react-icons/fa';
import { useState } from 'react';
import { IoIosMenu } from 'react-icons/io';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

function Header() {
    const { state:{ user, cart}, dispatch } = useContextPro();
    
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
     const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
     const [searchOpen, setSearchOpen] = useState(false);


    const navigate = useNavigate();

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout =  async () => {
        try{
          await signOut(auth);
        } catch (err) {
          console.log(err);
        } finally{
          localStorage.removeItem("token");
          dispatch({ type: "LOGOUT" });
          localStorage.removeItem("role");
          handleMenuClose();
        }
    };
    
  return (
    <header className="header">
        <img src={Logo} alt="header-logo" className="header-logo" onClick={() => navigate("/")} />
         <IoIosMenu size={30} className="me-2 menu-icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}  /> 
              {mobileMenuOpen && (
                <div className="menu-overlay" onClick={() => setMobileMenuOpen(false)}></div>
              )}
      <div className={`header-sections ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="header-content">
            <nav className={`header-nav ${window.innerWidth < 768 ? 'mobile-show' : ''}`}>
              <NavLink to="/home" className={({ isActive }) => "header-link" + (isActive ? " active" : "")}>Home</NavLink>
              <NavLink to="/category" className={({ isActive }) => "header-link" + (isActive ? " active" : "")}>Category</NavLink>
              <NavLink to="/shop" className={({ isActive }) => "header-link" + (isActive ? " active" : "")}>Shop</NavLink>
              <NavLink to="/blog" className={({ isActive }) => "header-link" + (isActive ? " active" : "")}>Blog</NavLink>
              <NavLink to="/products" className={({ isActive }) => "header-link" + (isActive ? " active" : "")}>Products</NavLink>
            </nav>
        </div>
        <div className="header-right">
            <div className={`search-container ${searchOpen ? 'search-open' : ''}`}>
                <FaSearch
                    className="search-icon" 
                    onClick={() => setSearchOpen(!searchOpen)} 
                />
                <input 
                    className='header-search' 
                    placeholder='Search products...' 
                    type="text" 
                />
            </div>
            <div className="relative inline-block">
              <img
                onClick={() => navigate("/cart")}
                className="cart-logo cursor-pointer"
                src={cartLogo}
                alt="cart-logo"
              />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              )}
            </div>
            {!user ? (
                <div>
                    <img className='user-logo' onClick={() => navigate("/login")} src={userLogo} alt="user-logo" />
                </div>
              ) : (
                <li className="profile" style={{ listStyle: 'none' }}>
                  <div 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      cursor: 'pointer',
                      padding: '8px 12px',
                      borderRadius: '20px',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={handleMenuOpen}
                  >
                    <Avatar
                      sx={{ 
                        bgcolor: user.name ? '#d23c67' : '#6c757d',
                        width: 36,
                        height: 36,
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        color: '#fff'
                      }}
                    >
                      {user.name ? user.name[0].toUpperCase() : <FaUserAlt size={14} />}
                    </Avatar>
                    <FaChevronDown
                      size={12}
                      style={{
                        color: '#6c757d',
                        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}
                    />
                  </div>
                
                  <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    PaperProps={{
                      elevation: 4,
                      sx: {
                        width: 240,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        mt: 1.5,
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.12)'
                      }
                    }}
                  >
                    <Box sx={{ px: 1.5, py: 1.5, borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {user.name || 'Guest'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {user.email}
                      </Typography>
                    </Box>
                    <MenuItem 
                      onClick={() => navigate("/profile")} 
                      sx={{ 
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: 'rgba(211, 47, 47, 0.08)'
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FaUser style={{ color: '#ed7070ff', fontSize: '16px' }} />
                        <span>Profile</span>
                      </div>
                    </MenuItem>
                    {user?.roles?.includes("ADMIN") && (
                      <MenuItem
                        onClick={handleMenuClose} 
                        sx={{ 
                          py: 1.5,
                          '&:hover': {
                            backgroundColor: 'rgba(2, 136, 209, 0.08)'
                          }
                        }}
                      >
                        <Link
                          to="/admin" 
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            textDecoration: 'none',
                            color: 'inherit',
                            width: '100%'
                          }}
                        >
                          <FaUserShield style={{ color: '#0288d1', fontSize: '16px' }} />
                          <span>Admin</span>
                        </Link>
                      </MenuItem>
                    )}
                    <MenuItem 
                      onClick={() => navigate("/cart/order-status")} 
                      sx={{ 
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: 'rgba(211, 47, 47, 0.08)'
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FaTruck style={{ color: '#fd6e6eff', fontSize: '16px' }} />
                        <span>My Orders</span>
                      </div>
                    </MenuItem>
                    <MenuItem 
                      onClick={handleLogout} 
                      sx={{ 
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: 'rgba(211, 47, 47, 0.08)'
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FaSignOutAlt style={{ color: '#d32f2f', fontSize: '16px' }} />
                        <span>Logout</span>
                      </div>
                    </MenuItem>
                  </Menu>
                </li>
              )}
        </div>
      </div>
    </header>
  )
}

export default Header;