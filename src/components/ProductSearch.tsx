import { useState, useEffect } from "react";
import type { SheetData } from "../types";
interface ProductSearchProps {
  sheetData: SheetData;
  onProductSelect: (row: string[], quantity: number) => void;
  onFocus: () => void;
}

export function ProductSearch({
  sheetData,
  onProductSelect,
  onFocus,
}: ProductSearchProps) {
  const [search, setSearch] = useState("");
  const [filteredRows, setFilteredRows] = useState<string[][]>([]);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    console.log("sheetData:", sheetData); // Log the whole sheetData object
    console.log("sheetData.values:", sheetData?.values); // Log the values array

    if (!Array.isArray(sheetData?.values)) {
      setFilteredRows([]);
      return;
    }
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
        const currentStock = parseInt(row[3] || "0", 10);
        const hasStock = currentStock > 0;
        return matchesSearch && hasStock;
      })
      .map((row: string[]) => [row[0], row[1], row[2], row[3]]);

    console.log("Filtered rows:", rows);

    setFilteredRows(rows);
  }, [sheetData, search]);

  const handleQuantityChange = (idx: number, value: number) => {
    setQuantities((prev) => ({ ...prev, [idx]: value }));
  };

  const handleSelectProduct = (row: string[], idx: number) => {
    const quantity = quantities[idx] || 1;
    onProductSelect(row, quantity);
    setSearch("");
    setFilteredRows([]);
    setQuantities({});
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
              className="dropdown-row"
              style={{ marginLeft: "1em" }}
            >
              <span>{row[0]}</span>
              <span style={{ marginLeft: "1em" }}>{row[1]}</span>
              <span style={{ marginLeft: "1em" }}>[{row[2]} $]</span>
              <span style={{ marginLeft: "1em" }}>Stock: {row[3]}</span>
              <input
                type="number"
                min={1}
                max={parseInt(row[3] || "1", 10)}
                value={quantities[idx] || 1}
                onChange={(e) =>
                  handleQuantityChange(idx, Number(e.target.value))
                }
                style={{ width: 50, marginLeft: "1em" }}
                onClick={(e) => e.stopPropagation()} // Prevents bubbling to li
              />
              <button
                style={{ marginLeft: "1em" }}
                onClick={() => handleSelectProduct(row, idx)}
                type="button"
              >
                Add
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
