import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { OrderHistoryItem } from "./types";
import { useSheetApi } from "./hooks/useSheetApi";
import "./StatusPage.css";

export function StatusPage() {
  const navigate = useNavigate();
  const { orderHistory, readOrderHistory, loading } = useSheetApi();
  const [filteredOrders, setFilteredOrders] = useState<OrderHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  // Fetch order history data
  const fetchOrderHistory = async () => {
    try {
      setError("");
      await readOrderHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    }
  };

  // Filter orders based on search term
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      setFilteredOrders(orderHistory);
    } else {
      const filtered = orderHistory.filter(order => 
        order.receiptId.toLowerCase().includes(term.toLowerCase()) ||
        order.products.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setFilteredOrders(orderHistory);
  };

  // Update filtered orders when orderHistory changes
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredOrders(orderHistory);
    } else {
      const filtered = orderHistory.filter(order => 
        order.receiptId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.products.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  }, [orderHistory, searchTerm]);

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  // Get status CSS class
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return "status-badge status-paid";
      case "failed": return "status-badge status-failed";
      case "expired": return "status-badge status-expired";
      case "pending": return "status-badge status-pending";
      default: return "status-badge status-default";
    }
  };

  useEffect(() => {
    fetchOrderHistory();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchOrderHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="status-page">
      <button onClick={() => navigate("/")} className="navigateButtons">
          Order
        </button>
      <div className="status-header">
        
        <h1 className="status-title">Order Status Management</h1>
        <button onClick={fetchOrderHistory} className="refresh-button">
          Refresh
        </button>
      </div>
      
      {/* Search Section */}
      <div className="search-section">
        <input 
          type="text" 
          placeholder="Search by Receipt ID or Product Name" 
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />
        <button onClick={clearSearch} className="clear-button">
          Clear
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="table-container">
          <table className="orders-table">
            <thead className="table-header">
              <tr>
                <th>Receipt ID</th>
                <th>Products</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.receiptId} className="table-row">
                  <td className="table-cell">{order.receiptId}</td>
                  <td className="table-cell product-cell">
                    <div className="product-text">
                      {order.products}
                    </div>
                  </td>
                  <td className="table-cell amount-cell">
                    ${order.amount.toFixed(2)}
                  </td>
                  <td className="table-cell">
                    <span className={getStatusClass(order.status)}>
                      {order.status}
                    </span>
                  </td>
                  <td className="table-cell timestamp-cell">
                    {formatTimestamp(order.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredOrders.length === 0 && !loading && (
            <div className="empty-state">
              {searchTerm ? "No orders found matching your search." : "No orders found."}
            </div>
          )}
        </div>
      )}
      
      <div className="footer-info">
        Showing {filteredOrders.length} of {orderHistory.length} orders • Auto-refreshes every 30 seconds
      </div>
    </div>
  );
}

export default StatusPage;