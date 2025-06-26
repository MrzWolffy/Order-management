import { useState } from "react";
import type { Discount } from "../types";

interface CreateDiscountProps {
  onDiscountChange: (discount: Discount | null) => void;
}

export function CreateDiscount({ onDiscountChange }: CreateDiscountProps) {
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<"%" | "$">("%");

  const handleDiscountAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setDiscountAmount(value);
    
    if (value > 0) {
      onDiscountChange({
        discountAmount: value,
        type: discountType
      });
    } else {
      onDiscountChange(null);
    }
  };

  const handleDiscountTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as "%" | "$";
    setDiscountType(type);
    
    if (discountAmount > 0) {
      onDiscountChange({
        discountAmount: discountAmount,
        type: type
      });
    }
  };

  const handleClearDiscount = () => {
    setDiscountAmount(0);
    setDiscountType("%");
    onDiscountChange(null);
  };

  return (
    <fieldset className="product-container">
      <legend>Create Discount</legend>
      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          Discount Amount
          <input 
            type="number" 
            name="discountAmount" 
            value={discountAmount || ""}
            onChange={handleDiscountAmountChange}
            min="0"
            step="0.01"
            placeholder="Enter discount amount"
          />
        </label>
        <select 
          name="type" 
          id="type" 
          value={discountType}
          onChange={handleDiscountTypeChange}
        >
          <option value="%">%</option>
          <option value="$">$</option>
        </select>
        <br />
        <br />
        {discountAmount > 0 && (
          <button 
            type="button" 
            onClick={handleClearDiscount}
            style={{ marginLeft: "10px" }}
          >
            Clear Discount
          </button>
        )}
      </form>
      {discountAmount > 0 && (
        <div style={{ marginTop: "10px", color: "green" }}>
          💰 Active Discount: {discountAmount}{discountType}
        </div>
      )}
    </fieldset>
  );
}