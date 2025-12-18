import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products',
  imports: [CommonModule, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  loading = true;

  // Admin Form state
  showForm = false;
  editingProduct: Partial<Product> | null = null;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadProducts();

    // Subscribe to cart updates to force UI refresh for quantities
    this.cartService.cart$.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  loadProducts() {
    this.loading = true;
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching products', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  getCartCount(product: Product): number {
    return this.cartService.getQuantity(product);
  }

  // Admin Actions
  toggleAddForm() {
    this.editingProduct = { name: '', price: 0 };
    this.showForm = !this.showForm;
    this.cdr.detectChanges();
  }

  editProduct(product: Product) {
    this.editingProduct = { ...product };
    this.showForm = true;
    this.cdr.detectChanges();
  }

  deleteProduct(product: Product) {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (err) => console.error('Delete failed', err)
      });
    }
  }

  saveProduct() {
    if (!this.editingProduct || !this.editingProduct.name) return;

    if (this.editingProduct.id) {
      // Update
      this.productService.updateProduct(this.editingProduct.id, this.editingProduct).subscribe({
        next: () => {
          this.showForm = false;
          this.loadProducts();
        }
      });
    } else {
      // Create
      this.productService.createProduct(this.editingProduct).subscribe({
        next: () => {
          this.showForm = false;
          this.loadProducts();
        }
      });
    }
  }

  cancelEdit() {
    this.showForm = false;
    this.editingProduct = null;
    this.cdr.detectChanges();
  }
}
