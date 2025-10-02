import { useNavigate } from "react-router-dom";
import useContextPro from "../../hooks/useContextPro";
import { useOrders } from "../../hooks/useOrders";
import useProducts from "../../hooks/useProducts";
import useUsers from "../../hooks/useUsers";
import { FaHome } from "react-icons/fa";

function HelloAdmin() {
    const { state: { user } } = useContextPro();
    const { users } = useUsers();
    const { products } = useProducts();
    const { orders } = useOrders();
    const navigate = useNavigate();

    return (
        <div className="admin-welcome">
            <div className="admin-welcome-bg-1"></div>
            <div className="admin-welcome-bg-2"></div>
            <div className="admin-welcome-bg-3"></div>
            
            {/* Content */}
            <div className="admin-welcome-content">
                <div className="admin-welcome-title-container">
                    <h1 className="admin-welcome-title">
                        Welcome, {user?.name || "Admin"}! 👋 
                    </h1>
                    <button className="home-btn" onClick={() => navigate('/')}> <FaHome /> Home Page</button>
                </div>
                
                <div className="admin-welcome-subtitle">
                    {user?.email && (
                        <p className="admin-welcome-email">
                            <svg className="admin-icon" viewBox="0 0 24 24" fill="none">
                                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2"/>
                                <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {user.email}
                        </p>
                    )}
                    
                    <p className="admin-welcome-text">
                        Ready to manage your system today? Let's make it productive!
                    </p>
                </div>

                {/* Stats preview */}
                <div className="admin-welcome-stats">
                    <div className="admin-stat-card">
                        <div className="admin-stat-icon users">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2"/>
                                <path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2"/>
                                <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2"/>
                                <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </div>
                        <div className="admin-stat-info">
                            <div className="admin-stat-value">{users?.length || 0}</div>
                            <div className="admin-stat-label">Total Users</div>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon icon-products">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M14 10V3C14 2.46957 13.7893 1.96086 13.4142 1.58579C13.0391 1.21071 12.5304 1 12 1C11.4696 1 10.9609 1.21071 10.5858 1.58579C10.2107 1.96086 10 2.46957 10 3V10H3C2.46957 10 1.96086 10.2107 1.58579 10.5858C1.21071 10.9609 1 11.4696 1 12C1 12.5304 1.21071 13.0391 1.58579 13.4142C1.96086 13.7893 2.46957 14 3 14H10V21C10 21.5304 10.2107 22.0391 10.5858 22.4142C10.9609 22.7893 11.4696 23 12 23C12.5304 23 13.0391 22.7893 13.4142 22.4142C13.7893 22.0391 14 21.5304 14 21V14H21C21.5304 14 22.0391 13.7893 22.4142 13.4142C22.7893 13.0391 23 12.5304 23 12C23 11.4696 22.7893 10.9609 22.4142 10.5858C22.0391 10.2107 21.5304 10 21 10H14Z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </div>
                        <div className="admin-stat-info">
                            <div className="admin-stat-value">{products?.length || 0}</div>
                            <div className="admin-stat-label">Products</div>
                        </div>
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon orders">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M16 7C16 8.06087 15.5786 9.07828 14.8284 9.82843C14.0783 10.5786 13.0609 11 12 11C10.9391 11 9.92172 10.5786 9.17157 9.82843C8.42143 9.07828 8 8.06087 8 7C8 5.93913 8.42143 4.92172 9.17157 4.17157C9.92172 3.42143 10.9391 3 12 3C13.0609 3 14.0783 3.42143 14.8284 4.17157C15.5786 4.92172 16 5.93913 16 7Z" stroke="currentColor" strokeWidth="2"/>
                                <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </div>
                        <div className="admin-stat-info">
                            <div className="admin-stat-value">{orders?.length || 0}</div>
                            <div className="admin-stat-label">Orders</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HelloAdmin