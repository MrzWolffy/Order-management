import { useState, useEffect } from "react";
import type { SheetData } from "../types";
interface ProductSearchProps {
  sheetData: SheetData;
  onProductSelect: (row: string[]) => void;
  onFocus: () => void;
}

export function ProductSearch({ sheetData, onProductSelect, onFocus }: ProductSearchProps) {
  const [search, setSearch] = useState("");
  const [filteredRows, setFilteredRows] = useState<string[][]>([]);

  useEffect(() => {
    if (!sheetData?.values) return;
    if (!search) {
      setFilteredRows([]);
      return;
    }
    
    const rows = sheetData.values
      .slice(1)
      .filter((row: string[]) => {
        const matchesSearch = row.some(
          (cell) => cell && cell.toLowerCase().includes(search.toLowerCase())
        );
        const currentStock = parseInt(row[9] || "0", 10);
        const hasStock = currentStock > 0;
        return matchesSearch && hasStock;
      })
      .map((row: string[]) => [row[0], row[1], row[5]]);
    
    setFilteredRows(rows);
  }, [sheetData, search]);

  const handleSelectProduct = (row: string[]) => {
    onProductSelect(row);
    setSearch("");
    setFilteredRows([]);
  };

  return (
    <div className="search-wrapper">
      <input
        type="text"
        placeholder="Name product"
        className="search-box"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={onFocus}
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
  );
}