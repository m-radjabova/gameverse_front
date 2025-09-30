import {Chart as ChartJS,CategoryScale,LinearScale,BarElement,Title,Tooltip,Legend,type ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import useOrderProducts from "../../../hooks/useOrderProducts";

ChartJS.register(CategoryScale,LinearScale,BarElement,Title,Tooltip,Legend);

function AdminDashboard() {
  const { groupedProducts, loading } = useOrderProducts();

  if (loading) { 
    return (
      <div className="admin-loading">
        <div className="dash-loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  const totalPrice = groupedProducts.reduce(
    (acc, product) => acc + product.price,
    0
  );

  const totalProducts = groupedProducts.reduce(
    (acc, product) => acc + product.quantity,
    0
  );

  const chartData = {
    labels: groupedProducts.map((p) => p.name),
    datasets: [
      {
        label: "Product Prices (€)",
        data: groupedProducts.map((p) => p.price),
        backgroundColor: "rgba(220, 53, 69, 0.7)",
        borderColor: "rgba(220, 53, 69, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: { 
        position: "top" as const,
        labels: {
          color: "#333",
          font: {
            size: 12
          }
        }
      },
      title: { 
        display: true, 
        text: "Revenue by Product",
        color: "#333",
        font: {
          size: 16,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "#6c757d"
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)"
        }
      },
      x: {
        ticks: {
          color: "#6c757d"
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <button className="btn-primary">Generate Report</button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <div className="stat-value">{totalPrice.toFixed(2)} €</div>
          <div className="stat-trend positive">
            +12% from last month
          </div>
        </div>
        
        <div className="stat-card">
          <h3>Total Products</h3>
          <div className="stat-value">{totalProducts}</div>
          <div className="stat-trend positive">
            +5% from last month
          </div>
        </div>
        
        <div className="stat-card">
          <h3>Active Orders</h3>
          <div className="stat-value">{groupedProducts.length}</div>
          <div className="stat-trend negative">
            -2% from last month
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="chart-container">
          <h2>Product Revenue</h2>
          <div className="chart-wrapper">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="dash-products-list">
          <div className="dash-list-header">
            <h2>Products List</h2>
            <span className="dash-product-count">{groupedProducts.length} products</span>
          </div>
          
          <div className="dash-products-scroll">
            {groupedProducts.map((product) => (
              <div key={product.id} className="dash-product-item">
                <div className="dash-product-info">
                  <span className="dash-product-name">{product.name}</span>
                  <span className="dash-product-quantity">{product.quantity} units</span>
                </div>
                <div className="dash-product-price">{product.price} €</div>
              </div>
            ))}
          </div>
          
          <div className="dash-list-footer">
            <div className="dash-total-price">
              Total: <strong>{totalPrice.toFixed(2)} €</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;