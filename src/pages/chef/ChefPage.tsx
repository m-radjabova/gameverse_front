import { useOrders } from "../../hooks/useOrders";
import { LuChefHat } from "react-icons/lu";
import {
  FaClock,
  FaCommentAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaTruck,
  FaUser,
} from "react-icons/fa";
import { GiKnifeFork } from "react-icons/gi";
import { useState } from "react";
import useContextPro from "../../hooks/useContextPro";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

function ChefPage() {
  const {
    state: { user },
    dispatch,
  } = useContextPro();
  const { orders, loading, getOrdersByStatus } = useOrders();
  const [filterStatus, setFilterStatus] = useState("all");
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const filteredOrders =
    filterStatus === "all" ? orders : getOrdersByStatus(filterStatus);

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "status-badge status-pending";
      case "completed":
        return "status-badge status-completed";
      case "delivered":
        return "status-badge status-delivered";
      default:
        return "status-badge";
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      setSubmittingId(orderId);
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-carousel">
        <div className="loading-state">
          <div className="dash-loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="chef-page">
      <div className="chef-page-header">
        <div className="chef-page-title">
          <div className="title-container">
            <LuChefHat className="chef-icon" />
            <div>
              <h1>Chef's Kitchen</h1>
              <p>Manage your orders efficiently</p>
              <div className="chef-info-panel">
                <p className="panel-user-info"> Logged in as: {user?.name}</p>
                <p className="panel-user-info">Email: {user?.email}</p>
                <button
                  className="logout-button"
                  onClick={() => dispatch({ type: "LOGOUT" })}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
          <div className="orders-count">
            <span className="count-number">{filteredOrders.length}</span>
            <span>order{filteredOrders.length !== 1 ? "s" : ""} pending</span>
          </div>
        </div>
        <div className="status-filter">
          <button
            className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            All Orders
          </button>
          <button
            className={`filter-btn ${
              filterStatus === "pending" ? "active" : ""
            }`}
            onClick={() => setFilterStatus("pending")}
          >
            Pending
          </button>
          <button
            className={`filter-btn ${
              filterStatus === "completed" ? "active" : ""
            }`}
            onClick={() => setFilterStatus("completed")}
          >
            Completed
          </button>
        </div>
      </div>
      <div className="chef-page-container">
        <div className="chef-page-content">
          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <GiKnifeFork className="no-orders-icon" />
              <h3>No orders found</h3>
              <p>When new orders come in, they'll appear here.</p>
            </div>
          ) : (
            <div className="orders-grid">
              {filteredOrders.map((order) => (
                <div className="order-card" key={order.id}>
                  {/* Order Header */}
                  <div className="order-header">
                    <div className="order-customer">
                      <div className="customer-avatar">
                        <FaUser className="customer-icon" />
                      </div>
                      <div>
                        <h3>{order.user?.name}</h3>
                        <span className="order-id">
                          Order #{order.id.slice(-6)}
                        </span>
                      </div>
                    </div>
                    <div className={getStatusBadgeClass(order.status)}>
                      {order.status}
                    </div>
                  </div>
                  <div className="order-details">
                    {order.shippingAddress && (
                      <div className="detail-item">
                        <FaMapMarkerAlt className="detail-icon" />
                        <span className="address-text">
                          {order.shippingAddress}
                        </span>
                      </div>
                    )}
                    {order.totalPrice > 0 && (
                      <div className="detail-item">
                        <FaMoneyBillWave className="detail-icon" />
                        <span>
                          ${order.totalPrice.toFixed(2)} •{" "}
                          {order.paymentMethod ?? "N/A"}
                        </span>
                      </div>
                    )}
                    {order.deliveryDate && (
                      <div className="detail-item">
                        <FaClock className="detail-icon" />
                        <span>
                          {new Date(order.deliveryDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {order.shippingAddress && (
                      <div className="detail-item">
                        <FaTruck className="detail-icon" />
                        <span>{order.shippingAddress}</span>
                      </div>
                    )}
                    {order.notes && (
                      <div className="detail-item">
                        <FaCommentAlt className="detail-icon" />
                        <span>{order.notes}</span>
                      </div>
                    )}

                    {order.location && (
                      <div className="detail-item">
                        <FaMapMarkerAlt className="detail-icon" />
                        <span>
                          Lat: {order.location.lat}, Lng: {order.location.lng}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="order-products">
                    <h4>Order Items ({order.products.length})</h4>
                    <div className="chef-product-cards">
                      {order.products.map((product, index) => (
                        <div className="chef-product-card" key={index}>
                          <div className="chef-product-image-container">
                            <img
                              className="chef-product-image"
                              src={product.imageUrl || "/api/placeholder/60/60"}
                              alt={product.name}
                            />
                          </div>
                          <div className="product-info">
                            <div className="product-header">
                              <span className="chef-product-quantity">
                                {product.quantity}x
                              </span>
                              <span className="chef-product-name">
                                {product.name || `Product ${index + 1}`}
                              </span>
                            </div>
                            <div className="product-details">
                              {product.description && (
                                <span className="chef-product-description">
                                  {product.description}
                                </span>
                              )}
                              <div className="product-meta">
                                <span className="chef-product-price">
                                  ${product.price?.toFixed(2) || "0.00"}
                                </span>
                                {product.weight && (
                                  <span className="chef-product-weight">
                                    • {product.weight}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="order-actions">
                    {order.status !== "completed" && (
                      <button
                        onClick={() => updateStatus(order.id, "completed")}
                        className="action-btn update-btn"
                        disabled={submittingId === order.id}
                      >
                        {submittingId === order.id
                          ? "Updating..."
                          : "Done Cooking"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChefPage;
