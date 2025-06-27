export type ProductMap = {
    [key: string]: { row: string[]; quantity: number };
}

export interface SheetData {
  values?: string[][];
}

export interface Discount {
    discountAmount: number;
    type: "%" | "$";
}