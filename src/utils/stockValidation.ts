import type { SheetData, ProductMap } from "../types";

export function validateStock(
  selectedProducts: ProductMap,
  sheetData: SheetData
): { hasIssues: boolean; issues: string[] } {
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
      const currentQuantity = parseInt(sheetData.values[rowIndex][3] || "0", 10);
      if (currentQuantity < orderedQuantity) {
        issues.push(`${productName} (${productCode}): out of stock.`);
      }
    }
  }
  
  return { hasIssues: issues.length > 0, issues };
}