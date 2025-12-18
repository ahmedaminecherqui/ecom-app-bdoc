import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-products',
  imports: [CommonModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class ProductsComponent implements OnInit {
  products$: Observable<Product[]> | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.products$ = this.productService.getAllProducts();

    // Subscribe to cart updates to force UI refresh for quantities
    this.cartService.cart$.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  getCartCount(product: Product): number {
    return this.cartService.getQuantity(product);
  }
}
