import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product.model';

export interface CartItem {
    product: Product;
    quantity: number;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartKey = 'ecom_cart';
    private cartItems = new BehaviorSubject<CartItem[]>([]);
    public cart$ = this.cartItems.asObservable();

    constructor() {
        this.loadCart();
    }

    private loadCart() {
        const saved = localStorage.getItem(this.cartKey);
        if (saved) {
            this.cartItems.next(JSON.parse(saved));
        }
    }

    private saveCart(items: CartItem[]) {
        localStorage.setItem(this.cartKey, JSON.stringify(items));
        this.cartItems.next(items);
    }

    getCartSnapshot(): CartItem[] {
        return this.cartItems.getValue();
    }

    addToCart(product: Product) {
        const items = this.getCartSnapshot();
        const existing = items.find(item => item.product.id === product.id);

        if (existing) {
            existing.quantity++;
        } else {
            items.push({ product, quantity: 1 });
        }
        this.saveCart(items);
    }

    removeFromCart(productId: string) {
        let items = this.getCartSnapshot();
        items = items.filter(item => item.product.id !== productId);
        this.saveCart(items);
    }

    updateQuantity(productId: string, quantity: number) {
        const items = this.getCartSnapshot();
        const item = items.find(i => i.product.id === productId);
        if (item && quantity > 0) {
            item.quantity = quantity;
            this.saveCart(items);
        } else if (item && quantity === 0) {
            this.removeFromCart(productId);
        }
    }

    getQuantity(productId: string): number {
        const item = this.getCartSnapshot().find(i => i.product.id === productId);
        return item ? item.quantity : 0;
    }

    getTotal(): number {
        return this.getCartSnapshot().reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    }
}
