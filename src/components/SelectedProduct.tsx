import Close from "@mui/icons-material/Close";
import type { SheetData, ProductMap } from "../types";
interface SelectedProductsProps {
  selectedProducts: ProductMap;
  sheetData: SheetData;
  onDeleteProduct: (key: string) => void;
}

export function SelectedProducts({ selectedProducts, sheetData, onDeleteProduct }: SelectedProductsProps) {
  const getStockIssues = () => {
    if (!sheetData?.values) return { hasIssues: false, issues: [] };
    
    const issues: string[] = [];
    
    for (const [, productData] of Object.entries(selectedProducts)) {
      const { row: productRow, quantity: orderedQuantity } = productData;
      const [productCode, productName] = productRow;
      
      const rowIndex = sheetData.values.findIndex((sheetRow: string[], index: number) => {
        if (index === 0) return false;
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
    <fieldset className="product-container">
      <legend>Selected Products</legend>
      {Object.entries(selectedProducts).length === 0 ? (
        <div className="no-products">
          No products selected yet
        </div>
      ) : (
        Object.entries(selectedProducts).map(([key, data]) => {
          let currentStock = 0;
          if (sheetData?.values) {
            const rowIndex = sheetData.values.findIndex((sheetRow: string[], index: number) => {
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
                  onClick={() => onDeleteProduct(key)}
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
        <div className="stock-status">
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
  );
}