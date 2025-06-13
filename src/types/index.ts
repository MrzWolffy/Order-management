export type ProductMap = {
    [key: string]: { row: string[]; quantity: number };
}

export interface CustomerInfo {
    name: string;
    surname: string;
    street: string;
    city: string;
    state: string;
    zip: string;
}