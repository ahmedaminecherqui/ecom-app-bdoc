export interface Customer {
    id: number;
    name: string;
    email: string;
}

export interface PagedCustomerResponse {
    _embedded: {
        customers: Customer[];
    };
}
