import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

interface OrderHistoryItem {
  receiptId: string;
  products: string;
  amount: number;
  status: string;
  timestamp: string;
}

export function StatusPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderHistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch order history data
  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://stripe-checkout-backend-production-442a.up.railway.app/api/status", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('jwt') || ''}`
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch order history");
      
      const data = await response.json();
      const rawData = data.data.values || [];
      
      // Parse the filtered data (columns: ReceiptId, Products, Amount, Status, Timestamp)
      const parsedOrders: OrderHistoryItem[] = rawData
        .slice(1) // Skip header row
        .map((row: string[]) => ({
          receiptId: row[0] || "",
          products: row[1] || "",
          amount: parseFloat(row[2]) || 0,
          status: row[3] || "",
          timestamp: row[4] || "",
        }))
        .sort((a: { timestamp: string }, b: { timestamp: string }) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort by newest first
      
      setOrders(parsedOrders);
      setFilteredOrders(parsedOrders);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: "paid" | "failed") => {
    try {
      const response = await fetch("https://stripe-checkout-backend-production-442a.up.railway.app/api/updateOrderStatus", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('jwt') || ''}`
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      
      if (!response.ok) throw new Error("Failed to update status");
      
      // Update local state
      const updatedOrders = orders.map(order => 
        order.receiptId === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders.filter(order => 
        order.receiptId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.products.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  // Filter orders based on search term
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => 
        order.receiptId.toLowerCase().includes(term.toLowerCase()) ||
        order.products.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setFilteredOrders(orders);
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid": return "#28a745";
      case "failed": return "#dc3545";
      case "pending": return "#ffc107";
      default: return "#6c757d";
    }
  };

  useEffect(() => {
    fetchOrderHistory();
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchOrderHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => navigate("/")} className="navigateButtons">
          Order
        </button>
        <h1>Order Status Management</h1>
        <button onClick={fetchOrderHistory} style={{ padding: "8px 16px" }}>
          Refresh
        </button>
      </div>
      
      {/* Search Section */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px", alignItems: "center" }}>
        <input 
          type="text" 
          placeholder="Search by Receipt ID or Product Name" 
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ 
            padding: "8px 12px", 
            borderRadius: "4px", 
            border: "1px solid #ddd",
            minWidth: "300px"
          }}
        />
        <button onClick={clearSearch} style={{ padding: "8px 16px" }}>
          Clear
        </button>
      </div>

      {error && (
        <div style={{ 
          color: "#dc3545", 
          backgroundColor: "#f8d7da", 
          padding: "10px", 
          borderRadius: "4px", 
          marginBottom: "20px" 
        }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ 
            width: "100%", 
            borderCollapse: "collapse", 
            backgroundColor: "white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th style={{ padding: "12px", border: "1px solid #dee2e6", textAlign: "left" }}>Receipt ID</th>
                <th style={{ padding: "12px", border: "1px solid #dee2e6", textAlign: "left" }}>Products</th>
                <th style={{ padding: "12px", border: "1px solid #dee2e6", textAlign: "left" }}>Amount</th>
                <th style={{ padding: "12px", border: "1px solid #dee2e6", textAlign: "left" }}>Status</th>
                <th style={{ padding: "12px", border: "1px solid #dee2e6", textAlign: "left" }}>Timestamp</th>
                <th style={{ padding: "12px", border: "1px solid #dee2e6", textAlign: "left" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <tr key={order.receiptId} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white" }}>
                  <td style={{ padding: "12px", border: "1px solid #dee2e6" }}>{order.receiptId}</td>
                  <td style={{ padding: "12px", border: "1px solid #dee2e6", maxWidth: "300px" }}>
                    <div style={{ 
                      overflow: "hidden", 
                      textOverflow: "ellipsis", 
                      whiteSpace: "nowrap",
                      fontSize: "14px"
                    }}>
                      {order.products}
                    </div>
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #dee2e6" }}>
                    ${order.amount.toFixed(2)}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #dee2e6" }}>
                    <span style={{ 
                      color: getStatusColor(order.status),
                      fontWeight: "bold",
                      textTransform: "capitalize"
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #dee2e6", fontSize: "12px" }}>
                    {formatTimestamp(order.timestamp)}
                  </td>
                  <td style={{ padding: "12px", border: "1px solid #dee2e6" }}>
                    <div style={{ display: "flex", gap: "5px", flexDirection: "column" }}>
                      <button
                        onClick={() => updateOrderStatus(order.receiptId, "paid")}
                        disabled={order.status === "paid"}
                        style={{ 
                          padding: "4px 8px", 
                          fontSize: "12px",
                          backgroundColor: order.status === "paid" ? "#ccc" : "#28a745",
                          color: "white",
                          border: "none",
                          borderRadius: "3px",
                          cursor: order.status === "paid" ? "not-allowed" : "pointer"
                        }}
                      >
                        Mark Paid
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.receiptId, "failed")}
                        disabled={order.status === "failed"}
                        style={{ 
                          padding: "4px 8px", 
                          fontSize: "12px",
                          backgroundColor: order.status === "failed" ? "#ccc" : "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: "3px",
                          cursor: order.status === "failed" ? "not-allowed" : "pointer"
                        }}
                      >
                        Mark Failed
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredOrders.length === 0 && !loading && (
            <div style={{ textAlign: "center", padding: "40px", color: "#6c757d" }}>
              {searchTerm ? "No orders found matching your search." : "No orders found."}
            </div>
          )}
        </div>
      )}
      
      <div style={{ marginTop: "20px", fontSize: "12px", color: "#6c757d", textAlign: "center" }}>
        Showing {filteredOrders.length} of {orders.length} orders • Auto-refreshes every 30 seconds
      </div>
    </div>
  );
}