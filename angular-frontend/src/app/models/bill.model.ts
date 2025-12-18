export interface ProductItem {
    id: number;
    productId: string;
    unitPrice: number;
    quantity: number;
    product?: any; // Enriched (contains .name, .price, etc.)
}

export interface Bill {
    id: number;
    billingDate: string;
    customerId: number;
    productItems: ProductItem[];
    customer?: any; // Enriched
}

export interface PagedBillResponse {
    _embedded: {
        bills: Bill[];
    };
}
