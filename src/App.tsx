import { useEffect, useState, useRef} from "react";
import "./App.css";
import { useSheetApi } from "./sheetApi";
import { StatusPage } from "./StatusPage";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom"
import googleLogo from "./assets/icons8-google.svg";
import Close from "@mui/icons-material/Close";

type ProductMap = {
  [key: string]: { row: string[]; quantity: number };
};

function App() {

  const { sheetData, readSheetData, loading, handleAuthClick, handleSignoutClick, updateProductQuantities, isAuthorized } = useSheetApi();
  const [search, setSearch] = useState("");
  const [filteredRows, setFilteredRows] = useState<string[][]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductMap>({});
  const [summaryText, setSummaryText] = useState("");
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const surnameRef = useRef<HTMLInputElement>(null);
  const streetRef = useRef<HTMLTextAreaElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);
   const navigate = useNavigate();

  useEffect(() => {
    if (!sheetData?.values) return;
    if (!search) {
      setFilteredRows([]);
      return;
    }
    const rows = sheetData.values
      .slice(1)
      .filter((row) => {
        // First check if row matches search
        const matchesSearch = row.some(
          (cell) => cell && cell.toLowerCase().includes(search.toLowerCase())
        );
        
        // Then check if product has stock (assuming stock is in column index 4, which is row[4])
        const currentStock = parseInt(row[4] || "0", 10);
        const hasStock = currentStock > 0;
        
        return matchesSearch && hasStock;
      })
      .map((row) => [row[0], row[1], row[3]]); // [code, name, price]
    setFilteredRows(rows);
  }, [sheetData, search]);

  const getRowKey = (row: string[]) => row.join(" | ");

  const handleSelectProduct = (row: string[]) => {
    const key = getRowKey(row);
    setSelectedProducts((prev) => {
      const existing = prev[key];
      return {
        ...prev,
        [key]: {
          row,
          quantity: existing ? existing.quantity + 1 : 1,
        },
      };
    });
    setSearch("");
    setFilteredRows([]);
  };

  const handleDeleteProduct = (key: string) => {
    setSelectedProducts((prev) => {
      const newProducts = { ...prev };
      delete newProducts[key];
      return newProducts;
    });
  };

  const handleClear = () => {
    setSelectedProducts({});
    setSearch("");
    setFilteredRows([]);

    nameRef.current!.value = "";
    surnameRef.current!.value = "";
    streetRef.current!.value = "";
    cityRef.current!.value = "";
    stateRef.current!.value = "";
    zipRef.current!.value = "";
    setSummaryText("");
  };

  const isFormValid = () => {
    const name = nameRef.current?.value?.trim() || "";
    const surname = surnameRef.current?.value?.trim() || "";
    const street = streetRef.current?.value?.trim() || "";
    const city = cityRef.current?.value?.trim() || "";
    const state = stateRef.current?.value?.trim() || "";
    const zip = zipRef.current?.value?.trim() || "";

    const hasProducts = Object.keys(selectedProducts).length > 0;

    return name && surname && street && city && state && zip && hasProducts;
  };

  const handleConfirm = async () => {
    if (!isFormValid()) {
      alert("Please fill all required fields and select at least one product.");
      return;
    }

    setIsProcessingOrder(true);

    try {
      // First, update the quantities in the Google Sheet
      await updateProductQuantities(selectedProducts);

      // Generate the summary after successful update
      const name = nameRef.current?.value || "";
      const surname = surnameRef.current?.value || "";
      const street = streetRef.current?.value || "";
      const city = cityRef.current?.value || "";
      const state = stateRef.current?.value || "";
      const zip = zipRef.current?.value || "";

      const customerInfo = `👤 Name: ${name} ${surname}\n🏠 Address: ${street}, ${city}, ${state}, ${zip}`;

      const productInfo = Object.values(selectedProducts)
        .map((p) => `${p.row[0]} ${p.row[1]} [${p.row[2]} $] x${p.quantity}`)
        .join("\n");

      const summary = `🛒 Products:\n${productInfo}\n${customerInfo}\n\n✅ Order confirmed and inventory updated!`;
      setSummaryText(summary);
      
      alert("Order confirmed successfully! Product quantities have been updated in the spreadsheet.");
      
    } catch (error) {
      console.error("Error processing order:", error);
      alert("Error processing order. Please try again.");
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const handleCopy = () => {
    if (summaryText) {
      navigator.clipboard.writeText(summaryText);
      alert("Summary copied to clipboard!");
    }
  };

  const getStockIssues = () => {
    if (!sheetData?.values) return { hasIssues: false, issues: [] };
    
    const issues: string[] = [];
    
    for (const [, productData] of Object.entries(selectedProducts)) {
      const { row: productRow, quantity: orderedQuantity } = productData;
      const [productCode, productName] = productRow;
      
      // Find the matching row in the sheet data
      const rowIndex = sheetData.values.findIndex((sheetRow, index) => {
        if (index === 0) return false; // Skip header row
        return sheetRow[0] === productCode && sheetRow[1] === productName;
      });
      
      if (rowIndex !== -1) {
        const currentQuantity = parseInt(sheetData.values[rowIndex][4] || "0", 10);
        if (currentQuantity < orderedQuantity) {
          issues.push(`${productName} (${productCode}): out of stock.`);
        }
      }
    }
    
    return { hasIssues: issues.length > 0, issues };
  };

  const stockStatus = getStockIssues();

  return (
    <>
    <button onClick={() => navigate("/status")} className="navigateButtons">Status</button>
    <div className="container">
      <div className="auth-section">
        {!isAuthorized ? (
          <button onClick={handleAuthClick} className="auth-btn">
            <img src={googleLogo} className="logo" alt="Google logo" />
            Google Login
          </button>
        ) : (
          <>
            <button 
              onClick={handleSignoutClick} 
              className="auth-btn" 
              style={{ backgroundColor: '#dc3545', color: 'white' }}
            >
              Logout
            </button>
          </>
        )}
      </div>
      </div>
      <form>

      <form onSubmit={(e) => e.preventDefault()} className="search-form">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Name product"
            name="search"
            className="search-box"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={readSheetData}
          />
          {search && filteredRows.length > 0 && (
            <ul className="dropdown">
              {filteredRows.map((row, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelectProduct(row)}
                  className="dropdown-row"
                >
                  <span>{row[0]}</span>
                  <span style={{ marginLeft: "1em" }}>{row[1]}</span>
                  <span style={{ marginLeft: "1em" }}>[{row[2]} $]</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>
      <br />
      <fieldset className="product-container">
        <legend>Selected Products</legend>
        {Object.entries(selectedProducts).length === 0 ? (
          <div  className="no-products">
            No products selected yet
          </div>
        ) : (
          Object.entries(selectedProducts).map(([key, data]) => {
            // Check current stock for this product
            let currentStock = 0;
            if (sheetData?.values) {
              const rowIndex = sheetData.values.findIndex((sheetRow, index) => {
                if (index === 0) return false;
                return sheetRow[0] === data.row[0] && sheetRow[1] === data.row[1];
              });
              if (rowIndex !== -1) {
                currentStock = parseInt(sheetData.values[rowIndex][4] || "0", 10);
              }
            }
            
            const isInsufficient = currentStock < data.quantity;
            
            return (
              <div key={key} className="product-item" style={{
                backgroundColor: isInsufficient ? '#ffebee' : 'transparent',
                border: isInsufficient ? '1px solid #f44336' : '1px solid #ddd'
              }}>
                <span className="product-name">
                  <span style={{ marginRight: "1em" }}>{data.row[0]}</span>
                  <span style={{ marginRight: "1em" }}>{data.row[1]}</span>
                  <span>[{data.row[2]} $]</span>
                </span>
                <div className="product-actions">
                  <span className="product-qty">x{data.quantity}</span>
                  <button
                    onClick={() => handleDeleteProduct(key)}
                    className="delete-button"
                  >
                    <Close />
                  </button>
                </div>
              </div>
            );
          })
        )}
        {stockStatus.hasIssues && (
          <div className="stock-status"  >
            <div className="stock-issues-header">
              ⚠️ Stock Issues:
            </div>
            {stockStatus.issues.map((issue, index) => (
              <div key={index} className="stock-issue">
                {issue}
              </div>
            ))}
          </div>
        )}
      </fieldset>
      <br />
      <form>
        <fieldset className="name-container">
          <legend>Customer name</legend>
          <input type="text" placeholder="Name" ref={nameRef} />
          <input type="text" placeholder="SurName" ref={surnameRef} />
        </fieldset>
        <fieldset className="address-container">
          <legend>Address</legend>
          <textarea
            placeholder="Street"
            ref={streetRef}
            className="street-input"
          ></textarea>
          <input type="text" placeholder="City" ref={cityRef} />
          <input type="text" placeholder="State/province/area" ref={stateRef} />
          <input type="text" placeholder="Zip code" ref={zipRef} />
        </fieldset>
      </form>
      <button 
        onClick={handleConfirm}
        disabled={isProcessingOrder || loading || stockStatus.hasIssues}
        style={{
          opacity: (isProcessingOrder || loading || stockStatus.hasIssues) ? 0.5 : 1,
          cursor: (isProcessingOrder || loading || stockStatus.hasIssues) ? 'not-allowed' : 'pointer'
        }}
      >
        {isProcessingOrder ? 'Processing Order...' : 'Confirm Order'}
      </button>
      <br />
      <br />
      <div className="copy-wrapper">
        <div className="text-copy-box">
          <pre>{summaryText}</pre>
        </div>
        <button
          onClick={handleCopy}
          disabled={!summaryText}
          style={{
            opacity: summaryText ? 1 : 0.5,
            cursor: summaryText ? "pointer" : "not-allowed",
          }}
        >
          Copy Text
        </button>
      </div>

      <br />
      <br />
      {/* <button>Payment Success</button> */}
      <button onClick={handleClear}>Clear</button>
    </form>
    </>
  );
}

export default App;