import {
  FaClock,
  FaCommentAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPhone,
  FaTag,
  FaTruck,
  FaUser,
} from "react-icons/fa";
import { useOrders } from "../../hooks/useOrders";
import { useState } from "react";
import { GiKnifeFork } from "react-icons/gi";
import useContextPro from "../../hooks/useContextPro";

function CartStatus() {
  const { orders, loading } = useOrders();
  const {
    state: { user },
  } = useContextPro();
  const [filterStatus, setFilterStatus] = useState("all");
  const filteredOrders = user
    ? orders.filter(
        (order) =>
          order.userId === user.uid &&
          (filterStatus === "all" || order.status === filterStatus)
      )
    : [];

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
    <div className="cart-page">
      <div className="cart-page-container">
        <div className="cart-page-title">
          <h1>
            My Order Status
            <FaTag />
          </h1>
        </div>
        <div className="cart-status-body">
          <div className="cart-status-header">
            <div className="order-count">
              <span className="order-number">{filteredOrders.length}</span>
              <span>
                order{filteredOrders.length !== 1 ? "s" : ""}{" "}
                {filterStatus !== "all" ? filterStatus : ""}
              </span>
            </div>
            <div className="status-filter">
              <button
                className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
                onClick={() => setFilterStatus("all")}
              >
                All Orders
              </button>
              <button
                className={`filter-btn ${filterStatus === "pending" ? "active" : ""}`}
                onClick={() => setFilterStatus("pending")}
              >
                Pending
              </button>
              <button
                className={`filter-btn ${filterStatus === "completed" ? "active" : ""}`}
                onClick={() => setFilterStatus("completed")}
              >
                Completed
              </button>
              <button
                className={`filter-btn ${filterStatus === "delivered" ? "active" : ""}`}
                onClick={() => setFilterStatus("delivered")}
              >
                Delivered
              </button>
            </div>
          </div>

          <div className="order-status">
            <div className="order-status-container">
              <div className="chef-page-content">
                {filteredOrders.length === 0 ? (
                  <div className="no-orders ">
                    <GiKnifeFork className="no-orders-icon" />
                    <h3>No orders found</h3>
                    <p>When new orders come in, they'll appear here.</p>
                  </div>
                ) : (
                  <div className="orders-status-grid">
                    {filteredOrders.map((order) => (
                      <div className="order-status-card" key={order.id}>
                        {/* Order Header */}
                        <div className="order-status-header">
                          <div className="order-status-customer">
                            <div className="order-status-customer-avatar">
                              <FaUser className="order-status-customer-icon" />
                            </div>
                            <div>
                              <h3>{order.user?.name || "Unknown User"}</h3>
                              <span className="order-id">
                                Order #{order.id ? order.id.slice(-6) : "------"}
                              </span>
                            </div>
                          </div>
                          <div className={getStatusBadgeClass(order.status)}>
                            {order.status}
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="order-status-details">
                          {order.shippingAddress && (
                            <div className="status-detail-item">
                              <FaMapMarkerAlt className="detail-icon" />
                              <span className="address-text">{order.shippingAddress}</span>
                            </div>
                          )}
                          {order.totalPrice > 0 && (
                            <div className="status-detail-item">
                              <FaMoneyBillWave className="detail-icon" />
                              <span>
                                ${order.totalPrice.toFixed(2)} •{" "}
                                {order.paymentMethod ?? "N/A"}
                              </span>
                            </div>
                          )}
                          {order.deliveryDate && (
                            <div className="status-detail-item">
                              <FaClock className="detail-icon" />
                              <span>
                                {new Date(order.deliveryDate).toLocaleDateString() || "N/A"}
                              </span>
                            </div>
                          )}
                          {order.shippingAddress && (
                            <div className="status-detail-item">
                              <FaTruck className="detail-icon" />
                              <span>{order.shippingAddress}</span>
                            </div>
                          )}
                          {order.notes && (
                            <div className="status-detail-item">
                              <FaCommentAlt className="detail-icon" />
                              <span>{order.notes}</span>
                            </div>
                          )}
                          {order.location && (
                            <div className="status-detail-item">
                              <FaMapMarkerAlt className="detail-icon" />
                              <span>
                                Lat: {order.location.lat}, Lng: {order.location.lng}
                              </span>
                            </div>
                          )}
                          {order.phoneNumber && (
                            <div className="detail-item">
                              <FaPhone className="detail-icon" />
                              <span>{order.phoneNumber}</span>
                            </div>
                          )}
                        </div>

                        {/* Products */}
                        <div className="stats-order-products">
                          <h4>
                            Order Items (
                            {Array.isArray(order.products) ? order.products.length : 0})
                          </h4>
                          <div className="status-product-cards">
                            {Array.isArray(order.products) &&
                              order.products.map((product, index) => (
                                <div className="status-product-card" key={index}>
                                  <div className="status-product-image-container">
                                    <img
                                      className="status-product-image"
                                      src={product.imageUrl || "/api/placeholder/60/60"}
                                      alt={product.name}
                                    />
                                  </div>
                                  <div className="status-product-info">
                                    <div className="status-product-header">
                                      <span className="status-product-quantity">
                                        {product.quantity}x
                                      </span>
                                      <span className="status-product-name">
                                        {product.name || `Product ${index + 1}`}
                                      </span>
                                    </div>
                                    <div className="status-product-details">
                                      {product.description && (
                                        <span className="chef-product-description">
                                          {product.description}
                                        </span>
                                      )}
                                      <div className="status-product-meta">
                                        <span className="chef-product-price">
                                          $
                                          {typeof product.price === "number"
                                            ? product.price.toFixed(2)
                                            : "0.00"}
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartStatus;