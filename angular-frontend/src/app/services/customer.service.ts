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
}
