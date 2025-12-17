import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class CartComponent implements OnInit {
  cartItems$: Observable<CartItem[]>;
  total = 0;

  constructor(public cartService: CartService) {
    this.cartItems$ = this.cartService.cart$;
  }

  ngOnInit() {
    this.cartService.cart$.subscribe(() => {
      this.total = this.cartService.getTotal();
    });
  }

  removeItem(productId: string) {
    this.cartService.removeFromCart(productId);
  }
}
