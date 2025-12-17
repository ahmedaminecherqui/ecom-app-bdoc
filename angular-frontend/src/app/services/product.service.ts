import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PagedProductResponse, Product } from '../models/product.model';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    private apiUrl = '/api/products';

    constructor(private http: HttpClient) { }

    getAllProducts(): Observable<Product[]> {
        return this.http.get<PagedProductResponse>(this.apiUrl).pipe(
            map(response => response._embedded.products)
        );
    }
}
