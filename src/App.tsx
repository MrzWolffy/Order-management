import { useEffect, useState } from "react";
import "./App.css";
import { useSheetApi } from "./Api/sheetApi";
import { StatusPage } from "./StatusPage";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";

function App() {
  const { sheetData, readSheetData , handleAuthClick} = useSheetApi();
  const [search, setSearch] = useState("");
  const [filteredRows, setFilteredRows] = useState<string[][]>([]);
  const navigate = useNavigate();

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
      );
    setFilteredRows(rows);
  }, [sheetData, search]);

  return (
    <>
    <button onClick={() => navigate("/status")} className="navigateButtons">Status</button>
    <button onClick={handleAuthClick} className="auth-button">
      Authorize
    </button>
      <form>
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
              <li key={idx}>{row.join(" | ")}</li>
            ))}
          </ul>
        )}
      </form>
      <br />
      <div className="product-container"></div>
      <br />
      <form>
        <fieldset className="name-container">
          <legend>Customer name</legend>
          <input type="text" placeholder="Name" />
          <input type="text" placeholder="SureName" />
        </fieldset>
        <fieldset className="address-container">
          <legend>Address</legend>
          <input type="text" placeholder="Street" />
          <input type="text" placeholder="City" />
          <input type="text" placeholder="State/province/area" />
          <input type="text" placeholder="Zip code" />
        </fieldset>
      </form>
      <button>Confirm Order</button>
      <br />
      <div className="copy-wrapper">
        <div className="text-copy-box"></div>
        <button>Copy Text</button>
      </div>

      <br />
      <br />
      {/* <button>Payment Success</button> */}
      <button>Clear</button>
    </>
  );
}

export default App;
