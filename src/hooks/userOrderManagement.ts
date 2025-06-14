import { useState } from "react";
import type { ProductMap, CustomerInfo } from "../types";

export function useOrderManagement() {
  const [selectedProducts, setSelectedProducts] = useState<ProductMap>({});
  const [summaryText, setSummaryText] = useState("");
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

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
  };

  const handleDeleteProduct = (key: string) => {
    setSelectedProducts((prev) => {
      const newProducts = { ...prev };
      delete newProducts[key];
      return newProducts;
    });
  };

  const generateSummary = (customerInfo: CustomerInfo) => {
    const customerDetails = `👤 Name: ${customerInfo.name} ${customerInfo.surname}\n🏠 Address: ${customerInfo.street}, ${customerInfo.city}, ${customerInfo.state}, ${customerInfo.zip}`;

    const productInfo = Object.values(selectedProducts)
      .map((p) => `${p.row[0]} ${p.row[1]} [${p.row[2]} $] x${p.quantity}`)
      .join("\n");

    return `🛒 Products:\n${productInfo}\n${customerDetails}\n\n✅ Order confirmed and inventory updated!`;
  };

  const processOrder = async (
    customerInfo: CustomerInfo,
    updateProductQuantities: (products: ProductMap) => Promise<void>
  ) => {
    setIsProcessingOrder(true);
    
    try {
      await updateProductQuantities(selectedProducts);
      const summary = generateSummary(customerInfo);
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