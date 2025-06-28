import { useState } from "react";
import type { ProductMap, Discount } from "../types";

export function useOrderManagement() {
  const [selectedProducts, setSelectedProducts] = useState<ProductMap>({});
  const [summaryText, setSummaryText] = useState("");
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [currentDiscount, setCurrentDiscount] = useState<Discount | null>(null);

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

  const handleDiscountChange = (discount: Discount | null) => {
    setCurrentDiscount(discount);
  };

  const calculateTotal = () => {
    const subtotal = Object.values(selectedProducts).reduce((total, product) => {
      const price = parseFloat(product.row[3]) || 0;
      return total + (price * product.quantity);
    }, 0);

    if (!currentDiscount || currentDiscount.discountAmount <= 0) {
      return { subtotal, discount: 0, total: subtotal };
    }

    let discountValue = 0;
    if (currentDiscount.type === "%") {
      discountValue = subtotal * (currentDiscount.discountAmount / 100);
    } else {
      discountValue = Math.min(currentDiscount.discountAmount, subtotal);
    }

    return {
      subtotal,
      discount: discountValue,
      total: Math.max(0, subtotal - discountValue)
    };
  };

  const generateSummary = (sessionUrl?: string, orderId?: string) => {
  const productInfo = Object.values(selectedProducts)
    .map((p) => `${p.row[0]} ${p.row[1]} [color: ${p.row[2]}] [${p.row[3]} $] x${p.quantity}`)
    .join("\n");
  
  const totals = calculateTotal();
  
  let discountInfo = "";
  if (currentDiscount && currentDiscount.discountAmount > 0) {
    discountInfo = `\n💰 Discount: ${currentDiscount.discountAmount}${currentDiscount.type} (-$${totals.discount.toFixed(2)})`;
  }
  
  const totalInfo = `\n${discountInfo}\n💵 Total: $${totals.total.toFixed(2)}`;
  const orderInfo = orderId ? `\n📄 Receipt ID: ${orderId}` : "";
  
  return `${orderInfo}\n🛒 Products:\n${productInfo}${totalInfo}\n✅ Order confirmed!\n🔗 Checkout: ${sessionUrl}`;
};

const processOrder = async (
  updateProductQuantities: (products: ProductMap, discount?: Discount | null) => Promise<{ sessionUrl: string; ReceiptId: string }>
) => {
  setIsProcessingOrder(true);
  
  try {
    const { sessionUrl, ReceiptId } = await updateProductQuantities(selectedProducts, currentDiscount);
    const summary = generateSummary(sessionUrl, ReceiptId);
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
    setCurrentDiscount(null);
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
    currentDiscount,
    handleSelectProduct,
    handleDeleteProduct,
    handleDiscountChange,
    processOrder,
    clearOrder,
    copyToClipboard,
    calculateTotal,
  };
}