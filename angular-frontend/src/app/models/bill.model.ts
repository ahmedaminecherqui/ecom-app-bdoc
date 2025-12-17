export interface ProductItem {
    id: number;
    productID: string;
    price: number;
    quantity: number;
    productName?: string; // Enriched
}

export interface Bill {
    id: number;
    billingDate: string;
    customerID: number;
    productItems: ProductItem[];
    customer?: any; // Enriched
}

export interface PagedBillResponse {
    _embedded: {
        bills: Bill[];
    };
}
