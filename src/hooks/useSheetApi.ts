import { useState, useEffect } from "react";
import { authorize , readSheet, updateStock, createUrl } from "../Api/sheetApi";
import type { SheetData , ProductMap, Discount} from "../types";

export function useSheetApi() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('jwt', token);
      window.history.replaceState({}, document.title, window.location.pathname);
      setIsAuthorized(true);
    }
  }, []);

    useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const result = await authorize();
        if (!result.authUrl) {
          setIsAuthorized(true);
        }
      } catch {
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };
    if (!isAuthorized) checkAuth();
  }, [isAuthorized]);

const handleAuthClick = async () => {
  setLoading(true);
  try {
    const result = await authorize();
    if (result.authUrl) {
      window.location.href = result.authUrl;
    } else {
      setIsAuthorized(true);
    }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    alert("Authorization failed");
    setIsAuthorized(false);
  } finally {
    setLoading(false);
  }
};

  const handleSignoutClick = () => {
  localStorage.removeItem('jwt');
  setIsAuthorized(false);

};

  const readSheetData = async () => {
    setLoading(true);
    try {
      const result = await readSheet();
      setSheetData(result.data);
    } catch (error) {
      console.error("Error Read Sheet:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProductQuantities = async (
  selectedProducts: ProductMap, 
  discount?: Discount | null
): Promise<string> => {
  setLoading(true);
  
  // Update stock for each product
  for (const key in selectedProducts) {
    const { row, quantity } = selectedProducts[key];
    const id = row[0];
    await updateStock(id, quantity);
  }
  
  await readSheetData();

  // Prepare items for checkout
  const items = Object.values(selectedProducts).map(({ row, quantity }) => ({
    id: row[0],
    quantity: quantity,
  }));

  try {
    // Pass discount to createUrl function
    const { sessionUrl } = await createUrl(items, discount);
    return sessionUrl;
  } catch (error) {
    console.error("Error creating session URL:", error);
    alert("Failed to create session URL. Please try again.");
    throw error; // Re-throw to handle in calling function
  } finally { 
    setLoading(false);
  }
};



  return {
    isAuthorized,
    handleAuthClick,
    handleSignoutClick,
    sheetData, 
    readSheetData,
    updateProductQuantities,
    loading
  };
}