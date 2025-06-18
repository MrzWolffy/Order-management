import { useState, useEffect, useCallback } from "react";

// Type declarations
interface TokenResponse {
  access_token: string;
  error?: string;
}

interface SpreadsheetResponse {
  result: {
    values?: string[][];
    range?: string;
    majorDimension?: string;
  };
}

interface TokenClient {
  callback: (response: TokenResponse) => void;
  requestAccessToken: (options: { prompt: string }) => void;
}

// Extend Window interface for Google APIs
declare global {
  interface Window {
    gapi: any;
    google: any;
    gapiLoaded: () => void;
    gisLoaded: () => void;
  }
}

// Configuration - Replace with your credentials
const CLIENT_ID =
  "866885658869-0m0uithpakd78r3h1dmjovn453pe9efn.apps.googleusercontent.com";
const API_KEY = "AIzaSyAZuq2HCkpDYW9UVHoSmmklf9PeerF0YOU";
const DISCOVERY_DOC =
  "https://sheets.googleapis.com/$discovery/rest?version=v4";
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";
const spreadsheetIdInit = "1gXRy6QitGWlqAEpmccOulERaY14PcnYenmJ6MeDbt4w";
const rangeInit = "Retake2";

export function useSheetApi() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  // const [gapiInited, setGapiInited] = useState(false);
  // const [gisInited, setGisInited] = useState(false);
  const [tokenClient, setTokenClient] = useState<TokenClient | null>(null);
  // const [authStatus, setAuthStatus] = useState("Initializing...");
  const [status, setStatus] = useState("");
  const [sheetData, setSheetData] = useState<{
    values?: string[][];
    range?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);


  const initializeGapiClient = useCallback(async () => {
    try {
      await window.gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
      });
      // setGapiInited(true);
      // setAuthStatus("Ready to authorize");
    } catch (error) {
      console.error("Error initializing GAPI client:", error);
      // setAuthStatus("Error initializing Google API client");
    }
  }, []);

  const gapiLoaded = useCallback(() => {
    window.gapi.load("client", initializeGapiClient);
  }, [initializeGapiClient]);

  const gisLoaded = useCallback(() => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: "",
    });
    setTokenClient(client);
    // setGisInited(true);
  }, []);

  useEffect(() => {
    const loadScript = (src: string, onLoad: () => void) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = onLoad;
      document.head.appendChild(script);
    };

    window.gapiLoaded = gapiLoaded;
    window.gisLoaded = gisLoaded;

    loadScript("https://apis.google.com/js/api.js", gapiLoaded);
    loadScript("https://accounts.google.com/gsi/client", gisLoaded);

    return () => {
      const scripts = document.querySelectorAll(
        'script[src*="googleapis.com"], script[src*="accounts.google.com"]'
      );
      scripts.forEach((script) => script.remove());
    };
  }, [gapiLoaded, gisLoaded]);

const handleAuthClick = useCallback(() => {
  if (!tokenClient) return;

  tokenClient.callback = async (resp: TokenResponse) => {
    if (resp.error !== undefined) {
      // setAuthStatus(`Authorization error: ${resp.error}`);
      return;
    }

    setIsAuthorized(true);
    // setAuthStatus("Successfully authorized!");
    await readSheetData(); // <-- Automatically read data after authorize
  };

  if (window.gapi.client.getToken() === null) {
    tokenClient.requestAccessToken({ prompt: "consent" });
  } else {
    tokenClient.requestAccessToken({ prompt: "" });
  }
}, [tokenClient]);

  const handleSignoutClick = useCallback(() => {
    const token = window.gapi.client.getToken();
    if (token !== null) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken("");
      setIsAuthorized(false);
      // setAuthStatus("Signed out");
      setSheetData(null);
      setStatus("");
      setStatus("Logged out successfully");
    }
  }, []);

  const readSheetData = useCallback(async () => {
    setLoading(true);
    setStatus("Reading sheet data...");

    try {
      const response: SpreadsheetResponse =
        await window.gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: spreadsheetIdInit,
          range: rangeInit,
        });

      setSheetData(response.result);
      setStatus(
        `Successfully read ${response.result.values?.length || 0} rows`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setStatus(`Error reading sheet: ${errorMessage}`);
      console.error("Error reading sheet:", error);
    } finally {
      setLoading(false);
    }
  }, [spreadsheetIdInit, rangeInit]);

   const updateProductQuantities = useCallback(
    async (selectedProducts: { [key: string]: { row: string[]; quantity: number } }) => {
      setLoading(true);
      setStatus("Updating product quantities...");
      
      try {
        if (!sheetData?.values) {
          throw new Error("No sheet data available");
        }

        const updates: Promise<unknown>[] = [];
        
        Object.values(selectedProducts).forEach((productData) => {
          const { row: productRow, quantity: orderedQuantity } = productData;
          const [productCode, productName] = productRow;
          
          const rowIndex = sheetData.values!.findIndex((sheetRow, index) => {
            if (index === 0) return false;
            return sheetRow[0] === productCode && sheetRow[1] === productName;
          });
          
          if (rowIndex !== -1) {
            const currentQuantity = parseInt(sheetData.values![rowIndex][4] || "0", 10);
            const newQuantity = Math.max(0, currentQuantity - orderedQuantity);
            
            const cellRange = `${rangeInit}!E${rowIndex + 1}`;
            
            const updatePromise = window.gapi.client.sheets.spreadsheets.values.update({
              spreadsheetId: spreadsheetIdInit,
              range: cellRange,
              valueInputOption: "USER_ENTERED",
              resource: {
                values: [[newQuantity]],
              },
            });
            
            updates.push(updatePromise);
          }
        });

        await Promise.all(updates);
        
        setStatus(`Successfully updated quantities for ${updates.length} products`);
        
        await readSheetData();
        
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setStatus(`Error updating quantities: ${errorMessage}`);
        console.error("Error updating quantities:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [sheetData, readSheetData]
  );

  

  return {
    sheetData,
    readSheetData,
    loading,
    handleAuthClick,
    handleSignoutClick,
    updateProductQuantities,
    status,
    isAuthorized,
  }
}