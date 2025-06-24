import { useState, useEffect } from "react";
import { authorize , readSheet, updateStock } from "../Api/sheetApi";
import type { SheetData , ProductMap} from "../types";

export function useSheetApi() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(false);

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
    checkAuth();
  }, []);

const handleAuthClick = async () => {
  setLoading(true);
  try {
    const result = await authorize();
    if (result.authUrl) {
      window.location.href = result.authUrl;
    } else {
      setIsAuthorized(true);
    }
  } catch (error) {
    alert("Authorization failed");
    setIsAuthorized(false);
  } finally {
    setLoading(false);
  }
};

  const handleSignoutClick = () => {
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

  const updateProductQuantities = async (selectedProducts: ProductMap) => {
    setLoading(true);
    for (const key in selectedProducts) {
      const { row, quantity } = selectedProducts[key];
      const id = row[0];
      await updateStock(id, quantity);
    }
    await readSheetData();
    setLoading(false);
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