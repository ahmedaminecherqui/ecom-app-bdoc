import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Bill, PagedBillResponse } from '../models/bill.model';

@Injectable({
    providedIn: 'root'
})
export class BillingService {
    private apiUrl = '/api/bills';

    constructor(private http: HttpClient) { }

    getAllBills(): Observable<Bill[]> {
        return this.http.get<PagedBillResponse>(this.apiUrl).pipe(
            map(response => response._embedded.bills)
        );
    }

    getBillDetails(id: number): Observable<Bill> {
        return this.http.get<Bill>(`${this.apiUrl}/${id}/productItems`);
        // Note: The backend likely returns the Bill with items or just items depending on projection. 
        // For now assuming we get the full bill from somewhere, but let's stick to list first.
    }
}
