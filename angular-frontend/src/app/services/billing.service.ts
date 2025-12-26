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
        return this.http.get<Bill[]>(`${this.apiUrl}/fullBills`);
    }

    getBillsByCustomer(customerId: number): Observable<Bill[]> {
        return this.http.get<Bill[]>(`${this.apiUrl}/customer/${customerId}`);
    }

    createBill(orderData: any): Observable<Bill> {
        return this.http.post<Bill>(`${this.apiUrl}/full`, orderData);
    }

    getBillDetails(id: number): Observable<Bill> {
        return this.http.get<Bill>(`${this.apiUrl}/${id}/productItems`);
    }

    publishBillEvent(billId: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/publishEvent/${billId}`);
    }
}
