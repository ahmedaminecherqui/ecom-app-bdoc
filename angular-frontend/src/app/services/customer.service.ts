import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Customer, PagedCustomerResponse } from '../models/customer.model';

@Injectable({
    providedIn: 'root'
})
export class CustomerService {
    private apiUrl = '/api/customers';

    constructor(private http: HttpClient) { }

    getAllCustomers(): Observable<Customer[]> {
        return this.http.get<PagedCustomerResponse>(this.apiUrl).pipe(
            map(response => response._embedded.customers)
        );
    }

    findCustomerByEmail(email: string): Observable<Customer> {
        return this.http.get<Customer>(`${this.apiUrl}/search/findByEmail?email=${email}`);
    }

    createCustomer(customer: Partial<Customer>): Observable<Customer> {
        return this.http.post<Customer>(this.apiUrl, customer);
    }

    updateCustomer(id: number, customer: Partial<Customer>): Observable<Customer> {
        return this.http.patch<Customer>(`${this.apiUrl}/${id}`, customer);
    }

    deleteCustomer(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
