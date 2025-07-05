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
  const [selectedColors, setSelectedColors] = useState<{ [key: number]: string }>({});
  const [productVariants, setProductVariants] = useState<{ [key: number]: string[][] }>({});

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

    const productGroups: { [key: string]: string[][] } = {};
    
    sheetData.values
      .slice(1) // Skip header
      .forEach((row: string[]) => {
        const productId = row[0]?.toLowerCase() || "";
        const productName = row[1]?.toLowerCase() || "";
        const searchTerm = search.toLowerCase();
        
        // Search by both product ID and product name
        if (productId.includes(searchTerm) || productName.includes(searchTerm)) {
          const currentStock = parseInt(row[11] || "0", 10);
          if (currentStock > 0) {
            // Group by product name to handle variants
            if (!productGroups[productName]) {
              productGroups[productName] = [];
            }
            productGroups[productName].push([row[0], row[1], row[2], row[3], row[4]]);
          }
        }
      });

    // Create filtered rows (one row per unique product name)
    const rows: string[][] = [];
    const variants: { [key: number]: string[][] } = {};
    const defaultColors: { [key: number]: string } = {};

    Object.values(productGroups).forEach((group, idx) => {
      // Sort variants by color (Default first, then alphabetically)
      const sortedVariants = group.sort((a, b) => {
        const colorA = a[2] || "Default";
        const colorB = b[2] || "Default";
        if (colorA === "Default" && colorB !== "Default") return -1;
        if (colorA !== "Default" && colorB === "Default") return 1;
        return colorA.localeCompare(colorB);
      });
      
      // Use the first variant (default color) as the main row
      const mainVariant = sortedVariants[0];
      rows.push(mainVariant);
      variants[idx] = sortedVariants;
      defaultColors[idx] = mainVariant[2] || "Default";
    });

    console.log("Filtered rows:", rows);
    console.log("Product variants:", variants);

    setFilteredRows(rows);
    setProductVariants(variants);
    setSelectedColors(defaultColors);
  }, [sheetData, search]);

  const handleQuantityChange = (idx: number, value: number) => {
    setQuantities((prev) => ({ ...prev, [idx]: value }));
  };

  const handleColorChange = (idx: number, color: string) => {
    setSelectedColors((prev) => ({ ...prev, [idx]: color }));
    
    // Update the row data when color changes
    const variants = productVariants[idx] || [];
    const selectedVariant = variants.find(variant => (variant[2] || "Default") === color);
    
    if (selectedVariant) {
      setFilteredRows(prevRows => {
        const newRows = [...prevRows];
        newRows[idx] = selectedVariant;
        return newRows;
      });
    }
  };

  const handleSelectProduct = (row: string[], idx: number) => {
    const quantity = quantities[idx] || 1;
    // Get the currently selected variant for this product
    const selectedColor = selectedColors[idx] || "Default";
    const variants = productVariants[idx] || [];
    const selectedVariant = variants.find(variant => (variant[2] || "Default") === selectedColor) || row;
    
    onProductSelect(selectedVariant, quantity);
    setSearch("");
    setFilteredRows([]);
    setQuantities({});
    setSelectedColors({});
    setProductVariants({});
  };

  const getAvailableColors = (idx: number): string[] => {
    const variants = productVariants[idx] || [];
    return variants.map(variant => variant[2] || "Default");
  };

  const getCurrentVariant = (idx: number): string[] => {
    const selectedColor = selectedColors[idx] || "Default";
    const variants = productVariants[idx] || [];
    return variants.find(variant => (variant[2] || "Default") === selectedColor) || filteredRows[idx];
  };

  return (
    <div className="search-wrapper">
      <input
        type="text"
        placeholder="Search products..."
        className="search-box"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={onFocus}
        style={{ width: "100%" }}
      />
      
      {search && filteredRows.length > 0 && (
        <ul className="dropdown">
          {filteredRows.map((_, idx) => {
            const currentVariant = getCurrentVariant(idx);
            const availableColors = getAvailableColors(idx);
            const hasMultipleColors = availableColors.length > 1;
            
            return (
              <li key={idx}>
                <div className="dropdown-row-content">
                  {/* Desktop layout - all in one row */}
                  <div className="desktop-layout" style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                    <span className="product-id">
                      {currentVariant[0]}
                    </span>
                    <span className="product-title">
                      {currentVariant[1]}
                    </span>
                    
                    {hasMultipleColors && (
                      <select
                        className="color-select"
                        value={selectedColors[idx] || "Default"}
                        onChange={(e) => handleColorChange(idx, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {availableColors.map((color) => (
                          <option key={color} value={color}>
                            {color || "Default"}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {!hasMultipleColors && (
                      <span className="color-badge">
                        {currentVariant[2] || "Default"}
                      </span>
                    )}
                    
                    <span className="product-price">
                      ${currentVariant[3]}
                    </span>
                    <span className="product-stock">
                      Stock: {currentVariant[4]}
                    </span>
                    <input
                      type="number"
                      className="quantity-input"
                      min={1}
                      max={parseInt(currentVariant[4] || "1", 10)}
                      value={quantities[idx] || 1}
                      onChange={(e) =>
                        handleQuantityChange(idx, Number(e.target.value))
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      className="add-product-btn"
                      onClick={() => handleSelectProduct(currentVariant, idx)}
                      type="button"
                    >
                      Add
                    </button>
                  </div>
                  
                  {/* Mobile layout - stacked */}
                  <div className="mobile-layout" style={{ display: 'none', width: '100%' }}>
                    <div className="product-title">
                      {currentVariant[1]}
                    </div>
                    <div className="mobile-product-row">
                      <span className="product-id">ID: {currentVariant[0]}</span>
                      <span className="product-price">${currentVariant[3]}</span>
                      <span className="product-stock">Stock: {currentVariant[4]}</span>
                    </div>
                    <div className="mobile-controls-row">
                      {hasMultipleColors && (
                        <select
                          className="color-select"
                          value={selectedColors[idx] || "Default"}
                          onChange={(e) => handleColorChange(idx, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {availableColors.map((color) => (
                            <option key={color} value={color}>
                              {color || "Default"}
                            </option>
                          ))}
                        </select>
                      )}
                      
                      {!hasMultipleColors && (
                        <span className="color-badge">
                          {currentVariant[2] || "Default"}
                        </span>
                      )}
                      
                      <input
                        type="number"
                        className="quantity-input"
                        min={1}
                        max={parseInt(currentVariant[4] || "1", 10)}
                        value={quantities[idx] || 1}
                        onChange={(e) =>
                          handleQuantityChange(idx, Number(e.target.value))
                        }
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        className="add-product-btn"
                        onClick={() => handleSelectProduct(currentVariant, idx)}
                        type="button"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      
      {search && filteredRows.length === 0 && (
        <div className="no-results-message">
          No products found matching your search.
        </div>
      )}
    </div>
  );
}