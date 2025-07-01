import "./App.css";
import { useSheetApi } from "./hooks/useSheetApi";
import { useOrderManagement } from "./hooks/userOrderManagement";
import { validateStock } from "./utils/stockValidation";
import { AuthSection } from "./components/AuthSection";
import { ProductSearch } from "./components/ProductSearch";
import { SelectedProducts } from "./components/SelectedProduct";
import { OrderSummary } from "./components/OrderSummary";
import { CreateDiscount } from "./components/CreatedDiscount";
import { useNavigate } from "react-router-dom";

function App() {
  const {
    sheetData,
    readSheetData,
    loading,
    handleAuthClick,
    handleSignoutClick,
    updateProductQuantities,
    isAuthorized,
  } = useSheetApi();

  const {
    selectedProducts,
    summaryText,
    isProcessingOrder,
    currentDiscount,
    handleSelectProduct,
    handleDeleteProduct,
    handleDiscountChange,
    processOrder,
    clearOrder,
    copyToClipboard,
    calculateTotal,
  } = useOrderManagement();

  const navigate = useNavigate();

  const stockStatus = validateStock(
    selectedProducts,
    sheetData ?? { values: [] }
  );

  const totals = calculateTotal();

  const handleConfirm = async () => {
    const hasProducts = Object.keys(selectedProducts).length > 0;

    if (!hasProducts) {
      alert("Please select at least one product.");
      return;
    }

    const result = await processOrder(updateProductQuantities);

    if (result.success) {
      alert(
        "Order confirmed successfully! Product quantities have been updated in the spreadsheet."
      );
    } else {
      alert("Error processing order. Please try again.");
    }
  };

  const handleClear = () => {
    clearOrder();
  };

  return (
    <>
      <button onClick={() => navigate("/status")} className="navigateButtons">
        Status
      </button>
      <button onClick={() => navigate("/analyte")} className="navigateButtons2">
        Analyte
      </button>
      <div className="container">
        <AuthSection
          isAuthorized={isAuthorized}
          onAuthClick={handleAuthClick}
          onSignoutClick={handleSignoutClick}
        />

        <form onSubmit={(e) => e.preventDefault()} className="search-form">
          <ProductSearch
            sheetData={sheetData ?? { values: [] }}
            onProductSelect={handleSelectProduct}
            onFocus={readSheetData}
          />
        </form>

        <br />

        <SelectedProducts
          selectedProducts={selectedProducts}
          sheetData={sheetData ?? { values: [] }}
          onDeleteProduct={handleDeleteProduct}
        />

        <br />

        <CreateDiscount onDiscountChange={handleDiscountChange} />

        {/* Show order totals preview */}
        {Object.keys(selectedProducts).length > 0 && (
          <div style={{ 
            margin: "20px 0", 
            padding: "15px", 
            border: "1px solid #ddd", 
            borderRadius: "5px",
            backgroundColor: "#f9f9f9"
          }}>
            <h3>Order Summary Preview</h3>
            <div>Subtotal: ${totals.subtotal.toFixed(2)}</div>
            {currentDiscount && totals.discount > 0 && (
              <div style={{ color: "green" }}>
                Discount ({currentDiscount.discountAmount}{currentDiscount.type}): -${totals.discount.toFixed(2)}
              </div>
            )}
            <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>
              Total: ${totals.total.toFixed(2)}
            </div>
          </div>
        )}

        <br />

        <button
          onClick={handleConfirm}
          disabled={isProcessingOrder || loading || stockStatus.hasIssues}
          style={{
            opacity:
              isProcessingOrder || loading || stockStatus.hasIssues ? 0.5 : 1,
            cursor:
              isProcessingOrder || loading || stockStatus.hasIssues
                ? "not-allowed"
                : "pointer",
          }}
        >
          {isProcessingOrder ? "Processing Order..." : "Confirm Order"}
        </button>

        <br />
        <br />

        <OrderSummary summaryText={summaryText} onCopy={copyToClipboard} />

        <br />
        <br />
        <button onClick={handleClear}>Clear</button>
      </div>
    </>
  );
}

export default App;