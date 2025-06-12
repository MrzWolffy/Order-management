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
  const [gapiInited, setGapiInited] = useState(false);
  const [gisInited, setGisInited] = useState(false);
  const [tokenClient, setTokenClient] = useState<TokenClient | null>(null);
  const [authStatus, setAuthStatus] = useState("Initializing...");
  const [status, setStatus] = useState("");
  const [displayFormat, setDisplayFormat] = useState<"table" | "json" | "raw">(
    "table"
  );
  const [sheetData, setSheetData] = useState<{
    values?: string[][];
    range?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [editRow, setEditRow] = useState<number>(1);
  const [editScore, setEditScore] = useState<string>("");
  const [selectedName, setSelectedName] = useState<string>("");

  const initializeGapiClient = useCallback(async () => {
    try {
      await window.gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
      });
      setGapiInited(true);
      setAuthStatus("Ready to authorize");
    } catch (error) {
      console.error("Error initializing GAPI client:", error);
      setAuthStatus("Error initializing Google API client");
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
    setGisInited(true);
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
      setAuthStatus(`Authorization error: ${resp.error}`);
      return;
    }

    setIsAuthorized(true);
    setAuthStatus("Successfully authorized!");
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
      setAuthStatus("Signed out");
      setSheetData(null);
      setStatus("");
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

  const clearResults = useCallback(() => {
    setSheetData(null);
    setStatus("");
  }, []);

  const nameOptions = sheetData?.values
    ? sheetData.values
        .slice(1)
        .map((row) => row[1])
        .filter(Boolean)
    : [];

  // const updateScore = useCallback(
  //   async (rowNumber: number, newScore: string | number) => {
  //     setLoading(true);
  //     setStatus("Updating score...");
  //     try {
  //       // "คะแนน" is column D, so column 4 (A=1, D=4)
  //       const cell = `D${rowNumber + 1}`; // +1 for header row
  //       await window.gapi.client.sheets.spreadsheets.values.update({
  //         spreadsheetId: spreadsheetIdInit,
  //         range: `${rangeInit}!${cell}`,
  //         valueInputOption: "USER_ENTERED",
  //         resource: {
  //           values: [[newScore]],
  //         },
  //       });
  //       setStatus(`Score updated for row ${rowNumber}`);
  //       await readSheetData(); // Refresh data
  //     } catch (error) {
  //       const errorMessage =
  //         error instanceof Error ? error.message : "Unknown error occurred";
  //       setStatus(`Error updating score: ${errorMessage}`);
  //       console.error("Error updating score:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [readSheetData]
  // );

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

  const DisplayTable = ({
    values,
    range,
  }: {
    values: string[][];
    range?: string;
  }) => (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">
        Sheet Data{range && ` (${range})`}
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <tbody>
            {values.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={
                  rowIndex === 0
                    ? "bg-gray-100 font-semibold"
                    : rowIndex % 2 === 0
                    ? "bg-gray-50"
                    : ""
                }
              >
                {row.map((cell, cellIndex) => {
                  const Tag = rowIndex === 0 ? "th" : "td";
                  return (
                    <Tag
                      key={cellIndex}
                      className="border border-gray-300 px-4 py-2 text-left"
                    >
                      {cell || ""}
                    </Tag>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        <strong>Total rows:</strong> {values.length}
      </p>
    </div>
  );

  const DisplayJSON = ({
    values,
    range,
  }: {
    values: string[][];
    range?: string;
  }) => {
    const headers = values[0] || [];
    const rows = values.slice(1);

    const jsonData = rows.map((row) => {
      const obj: { [key: string]: string } = {};
      headers.forEach((header, index) => {
        obj[header || `Column_${index + 1}`] = row[index] || "";
      });
      return obj;
    });

    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">
          Sheet Data as JSON{range && ` (${range})`}
        </h3>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
          {JSON.stringify(jsonData, null, 2)}
        </pre>
        <p className="mt-2 text-sm text-gray-600">
          <strong>Total records:</strong> {jsonData.length}
        </p>
      </div>
    );
  };

  const DisplayRaw = ({
    values,
    range,
  }: {
    values: string[][];
    range?: string;
  }) => {
    const rawText = values.map((row) => row.join("\t")).join("\n");

    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">
          Raw Sheet Data{range && ` (${range})`}
        </h3>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm whitespace-pre-wrap">
          {rawText}
        </pre>
        <p className="mt-2 text-sm text-gray-600">
          <strong>Total rows:</strong> {values.length}
        </p>
      </div>
    );
  };

  const canAuthorize = gapiInited && gisInited;
  const canReadSheet = isAuthorized && !loading;

  return {
    sheetData,
    readSheetData,
    loading,
    handleAuthClick,
    updateProductQuantities,
    status
  }
}