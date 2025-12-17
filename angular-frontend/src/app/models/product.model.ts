export interface Product {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export interface PagedProductResponse {
    _embedded: {
        products: Product[];
    };
}
