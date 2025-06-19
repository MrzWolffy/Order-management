import { useNavigate } from "react-router-dom";
import "./App.css";

export function StatusPage() {
    const navigate = useNavigate();
  return (
    <div>
        <button onClick={() => navigate("/")} className="navigateButtons">Order</button>
      <h1>Status Page</h1>
      <input type="text" placeholder="Transaction ID" name="Transaction ID" />
      <button>Check Status</button>
      <button >Clear</button>
    </div>
  );
}
