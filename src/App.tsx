import "./App.css";
import { useSheetApi } from "./sheetApi";
import { useOrderManagement } from "./hooks/userOrderManagement";
import { validateStock } from "./utils/stockValidation";
import { AuthSection } from "./components/AuthSection";
import { ProductSearch } from "./components/ProductSearch";
import { SelectedProducts } from "./components/SelectedProduct";
import { OrderSummary } from "./components/OrderSummary";

function App() {
  const { 
    sheetData, 
    readSheetData, 
    loading, 
    handleAuthClick, 
    handleSignoutClick, 
    updateProductQuantities, 
    isAuthorized 
  } = useSheetApi();

  const {
    selectedProducts,
    summaryText,
    isProcessingOrder,
    handleSelectProduct,
    handleDeleteProduct,
    processOrder,
    clearOrder,
    copyToClipboard,
  } = useOrderManagement();

  const stockStatus = validateStock(selectedProducts, sheetData ?? { values: [], range: '' });

  const handleConfirm = async () => {
    const hasProducts = Object.keys(selectedProducts).length > 0;

    if (!hasProducts) {
      alert("Please fill all required fields and select at least one product.");
      return;
    }

    const result = await processOrder(updateProductQuantities);
    
    if (result.success) {
      alert("Order confirmed successfully! Product quantities have been updated in the spreadsheet.");
    } else {
      alert("Error processing order. Please try again.");
    }
  };

  const handleClear = () => {
    clearOrder();
  };

  return (
    <div className="container">
      <AuthSection
        isAuthorized={isAuthorized}
        onAuthClick={handleAuthClick}
        onSignoutClick={handleSignoutClick}
      />

      <form onSubmit={(e) => e.preventDefault()} className="search-form">
        <ProductSearch
          sheetData={sheetData ?? { values: [], range: '' }}
          onProductSelect={handleSelectProduct}
          onFocus={readSheetData}
        />
      </form>

      <br />

      <SelectedProducts
        selectedProducts={selectedProducts}
        sheetData={sheetData ?? { values: [], range: '' }}
        onDeleteProduct={handleDeleteProduct}
      />

      <br />

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

      <OrderSummary
        summaryText={summaryText}
        onCopy={copyToClipboard}
      />

      <br />
      <br />
      <button onClick={handleClear}>Clear</button>
    </div>
  );
}

export default App;