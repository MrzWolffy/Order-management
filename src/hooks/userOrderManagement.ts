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

  const processOrder = async (
    updateProductQuantities: (products: ProductMap) => Promise<void>
  ) => {
    setIsProcessingOrder(true);
    
    try {
      await updateProductQuantities(selectedProducts);
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