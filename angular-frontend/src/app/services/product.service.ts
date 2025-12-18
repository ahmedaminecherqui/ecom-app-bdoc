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
            map(response => {
                console.log('ProductService raw response:', response);
                const products = response._embedded.products;
                console.log('Mapped products:', products);
                if (products.length > 0) {
                    console.log('First product ID:', products[0].id);
                }
                return products;
            })
        );
    }
}
