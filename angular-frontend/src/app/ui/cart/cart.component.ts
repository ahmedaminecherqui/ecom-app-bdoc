import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { BillingService } from '../../services/billing.service';
import { KeycloakService } from 'keycloak-angular';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;
  notification: { message: string, type: 'success' | 'error' | null } = { message: '', type: null };

  constructor(
    public cartService: CartService,
    private billingService: BillingService,
    private keycloakService: KeycloakService,
    private customerService: CustomerService,
    private router: Router
  ) {
    // No longer directly assigning cartItems$ here, using subscription in ngOnInit
  }

  ngOnInit() {
    this.cartService.cart$.subscribe(items => {
      console.log('CartComponent: Cart state updated', items);
      this.cartItems = items;
      this.total = this.cartService.getTotal();
    });
  }

  removeItem(productId: string) {
    this.cartService.removeFromCart(productId);
  }

  async checkout() {
    const items = this.cartService.getCartSnapshot();
    if (items.length === 0) return;

    try {
      const profile = await this.keycloakService.loadUserProfile();
      const userEmail = profile.email;

      if (!userEmail) {
        this.showNotification('Error: Email missing in user profile', 'error');
        return;
      }

      console.log('CartComponent: Looking up customer for email:', userEmail);

      this.customerService.findCustomerByEmail(userEmail).subscribe({
        next: (customer) => {
          console.log('CartComponent: Found customer ID:', customer.id);
          this.submitOrder(customer.id, items);
        },
        error: (err) => {
          console.error('CartComponent: Customer lookup failed. Defaulting to customer ID 1 for Mohamed if match fail.', err);
          this.showNotification('Error: Please ensure you are a registered customer.', 'error');
        }
      });

    } catch (err) {
      console.error('CartComponent: Auth failure or profile error', err);
      this.showNotification('Error: Could not load user identity', 'error');
    }
  }

  private submitOrder(customerId: number, items: CartItem[]) {
    const orderPayload = {
      customerId: customerId,
      items: items.map(i => ({
        productId: i.product.id,
        unitPrice: i.product.price,
        quantity: i.quantity
      }))
    };

    this.billingService.createBill(orderPayload).subscribe({
      next: (res) => {
        console.log('Checkout success:', res);
        this.showNotification(`Order #${res.id} placed successfully!`, 'success');
        this.cartService.clearCart();
        setTimeout(() => this.router.navigate(['/bills']), 2000);
      },
      error: (err) => {
        console.error('CRITICAL: Checkout failed!', err);
        this.showNotification(`Error: ${err.message || 'Checkout failed'}`, 'error');
      }
    });
  }

  showNotification(message: string, type: 'success' | 'error') {
    this.notification = { message, type };
    setTimeout(() => {
      this.notification = { message: '', type: null };
    }, 4000);
  }
}
