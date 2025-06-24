import { useState } from "react";
import type { ProductMap} from "../types";

export function useOrderManagement() {
  const [selectedProducts, setSelectedProducts] = useState<ProductMap>({});
  const [summaryText, setSummaryText] = useState("");
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  const handleSelectProduct = (row: string[], quantity: number) => {
    setSelectedProducts((prev) => {
      const key = row.join(" | ");
      const prevQuantity = prev[key]?.quantity || 0;
      return {
        ...prev,
        [key]: { row, quantity: prevQuantity + quantity }
      };
    });
  };


  const handleDeleteProduct = (key: string) => {
    setSelectedProducts((prev) => {
      const newProducts = { ...prev };
      delete newProducts[key];
      return newProducts;
    });
  };

  const generateSummary = () => {
    const productInfo = Object.values(selectedProducts)
      .map((p) => `${p.row[0]} ${p.row[1]} [${p.row[2]} $] x${p.quantity}`)
      .join("\n");

    return `🛒 Products:\n${productInfo}\n✅ Order confirmed and inventory updated!`;
  };

  const processOrder = async (
    updateProductQuantities: (products: ProductMap) => Promise<void>
  ) => {
    setIsProcessingOrder(true);
    
    try {
      await updateProductQuantities(selectedProducts);
      const summary = generateSummary();
      setSummaryText(summary);
      return { success: true };
    } catch (error) {
      console.error("Error processing order:", error);
      return { success: false, error };
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const clearOrder = () => {
    setSelectedProducts({});
    setSummaryText("");
  };

  const copyToClipboard = () => {
    if (summaryText) {
      navigator.clipboard.writeText(summaryText);
      alert("Summary copied to clipboard!");
    }
  };

  return {
    selectedProducts,
    summaryText,
    isProcessingOrder,
    handleSelectProduct,
    handleDeleteProduct,
    processOrder,
    clearOrder,
    copyToClipboard,
  };
}