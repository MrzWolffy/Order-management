import { useEffect, useState, useRef } from "react";
import "./App.css";
import Close from "@mui/icons-material/Close";
import { useSheetApi } from "./sheetApi";

type ProductMap = {
  [key: string]: { row: string[]; quantity: number };
};

function App() {
  const { sheetData, readSheetData, loading, handleAuthClick } = useSheetApi();
  const [search, setSearch] = useState("");
  const [filteredRows, setFilteredRows] = useState<string[][]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductMap>({});
  const [summaryText, setSummaryText] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);
  const surnameRef = useRef<HTMLInputElement>(null);
  const streetRef = useRef<HTMLTextAreaElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!sheetData?.values) return;
    if (!search) {
      setFilteredRows([]);
      return;
    }
    const rows = sheetData.values
      .slice(1)
      .filter((row) =>
        row.some(
          (cell) => cell && cell.toLowerCase().includes(search.toLowerCase())
        )
      )
      .map((row) => [row[0], row[1], row[3]]);
    setFilteredRows(rows);
  }, [sheetData, search]);

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
    setSearch("");
    setFilteredRows([]);
  };

  const handleDeleteProduct = (key: string) => {
    setSelectedProducts((prev) => {
      const newProducts = { ...prev };
      delete newProducts[key];
      return newProducts;
    });
  };

  const handleClear = () => {
    setSelectedProducts({});
    setSearch("");
    setFilteredRows([]);

    nameRef.current!.value = "";
    surnameRef.current!.value = "";
    streetRef.current!.value = "";
    cityRef.current!.value = "";
    stateRef.current!.value = "";
    zipRef.current!.value = "";
    setSummaryText("");
  };

  const isFormValid = () => {
    const name = nameRef.current?.value?.trim() || "";
    const surname = surnameRef.current?.value?.trim() || "";
    const street = streetRef.current?.value?.trim() || "";
    const city = cityRef.current?.value?.trim() || "";
    const state = stateRef.current?.value?.trim() || "";
    const zip = zipRef.current?.value?.trim() || "";

    const hasProducts = Object.keys(selectedProducts).length > 0;

    return name && surname && street && city && state && zip && hasProducts;
  };

  const handleConfirm = () => {
    if (!isFormValid()) {
      alert("Please fill all required fields and select at least one product.");
      return;
    }

    const name = nameRef.current?.value || "";
    const surname = surnameRef.current?.value || "";
    const street = streetRef.current?.value || "";
    const city = cityRef.current?.value || "";
    const state = stateRef.current?.value || "";
    const zip = zipRef.current?.value || "";

    const customerInfo = `👤 Name: ${name} ${surname}\n🏠 Address: ${street}, ${city}, ${state}, ${zip}`;

    const productInfo = Object.values(selectedProducts)
      .map((p) => `${p.row[0]} ${p.row[1]} [${p.row[2]} $] x${p.quantity}`)
      .join("\n");

    const summary = `🛒 Products:\n${productInfo}\n${customerInfo}`;
    setSummaryText(summary);
  };

  const handleCopy = () => {
    if (summaryText) {
      navigator.clipboard.writeText(summaryText);
      alert("Summary copied to clipboard!");
    }
  };

  return (
    <>
      <button onClick={handleAuthClick} className="auth-button">
        Authorize
      </button>
      <form onSubmit={(e) => e.preventDefault()} className="search-form">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Name product"
            name="search"
            className="search-box"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={readSheetData}
          />
          {search && filteredRows.length > 0 && (
            <ul className="dropdown">
              {filteredRows.map((row, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelectProduct(row)}
                  className="dropdown-row"
                >
                  <span>{row[0]}</span>
                  <span style={{ marginLeft: "1em" }}>{row[1]}</span>
                  <span style={{ marginLeft: "1em" }}>[{row[2]} $]</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>
      <br />
      <div className="product-container">
        {Object.entries(selectedProducts).map(([key, data]) => (
          <div key={key} className="product-item">
            <span className="product-name">
              {" "}
              <span style={{ marginRight: "1em" }}>{data.row[0]}</span>
              <span style={{ marginRight: "1em" }}>{data.row[1]}</span>
              <span>[{data.row[2]} $]</span>
            </span>
            <div className="product-actions">
              <span className="product-qty">x{data.quantity}</span>
              <button
                onClick={() => handleDeleteProduct(key)}
                className="delete-button"
              >
                <Close />
              </button>
            </div>
          </div>
        ))}
      </div>
      <br />
      <form>
        <fieldset className="name-container">
          <legend>Customer name</legend>
          <input type="text" placeholder="Name" ref={nameRef} />
          <input type="text" placeholder="SureName" ref={surnameRef} />
        </fieldset>
        <fieldset className="address-container">
          <legend>Address</legend>
          <textarea
            placeholder="Street"
            ref={streetRef}
            className="street-input"
          ></textarea>
          <input type="text" placeholder="City" ref={cityRef} />
          <input type="text" placeholder="State/province/area" ref={stateRef} />
          <input type="text" placeholder="Zip code" ref={zipRef} />
        </fieldset>
      </form>
      <button onClick={handleConfirm}>Confirm Order</button>
      <br />
      <br />
      <div className="copy-wrapper">
        <div className="text-copy-box">
          <pre>{summaryText}</pre>
        </div>
        <button
          onClick={handleCopy}
          disabled={!summaryText}
          style={{
            opacity: summaryText ? 1 : 0.5,
            cursor: summaryText ? "pointer" : "not-allowed",
          }}
        >
          Copy Text
        </button>
      </div>

      <br />
      <br />
      {/* <button>Payment Success</button> */}
      <button onClick={handleClear}>Clear</button>
    </>
  );
}

export default App;
