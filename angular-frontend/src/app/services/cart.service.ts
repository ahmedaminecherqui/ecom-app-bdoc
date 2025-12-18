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

    private notification = new BehaviorSubject<{ message: string, type: 'success' | 'error' | null }>({ message: '', type: null });
    public notification$ = this.notification.asObservable();

    constructor() {
        this.loadCart();
    }

    private loadCart() {
        const saved = localStorage.getItem(this.cartKey);
        if (saved) {
            try {
                const items: CartItem[] = JSON.parse(saved);
                console.log('CartService: Loading saved cart from localStorage:', items);
                // Don't prune anymore, just warn. Surfacing the "broken" items helps debugging.
                items.forEach(item => {
                    if (!item.product) console.error('CartService: Item missing product!', item);
                    else if (!this.extractId(item.product)) console.error('CartService: Product missing ID!', item.product);
                });
                this.cartItems.next(items);
            } catch (e) {
                console.error('CartService: Failed to parse saved cart', e);
            }
        }
    }

    private saveCart(items: CartItem[]) {
        localStorage.setItem(this.cartKey, JSON.stringify(items));
        this.cartItems.next(items);
    }

    getCartSnapshot(): CartItem[] {
        return this.cartItems.getValue();
    }

    private extractId(product: any): string {
        if (!product) return '';
        if (product.id) return String(product.id);
        // Fallback: extract from HATEOAS links if ID exposure failed
        if (product._links && product._links.self) {
            const href = product._links.self.href;
            return href.split('/').pop() || '';
        }
        return '';
    }

    addToCart(product: any) {
        console.log('CartService.addToCart payload:', product);
        const productId = this.extractId(product);
        if (!productId) {
            console.error('CRITICAL: Product missing ID!', product);
            this.showNotification('Error: Product missing ID!', 'error');
            return;
        }

        const items = this.getCartSnapshot();
        const existing = items.find(item => this.extractId(item.product) === productId);

        if (existing) {
            existing.quantity++;
            console.log(`Updated quantity for ${productId}: ${existing.quantity}`);
        } else {
            // Ensure product has an ID for future lookups
            const productWithId = { ...product, id: productId };
            items.push({ product: productWithId, quantity: 1 });
            console.log(`Added new item to cart: ${productId}`);
        }
        this.saveCart(items);
        this.showNotification(`Added ${product.name} to cart!`, 'success');
    }

    showNotification(message: string, type: 'success' | 'error' = 'success') {
        this.notification.next({ message, type });
        setTimeout(() => this.notification.next({ message: '', type: null }), 3000);
    }

    removeFromCart(productId: string) {
        console.log('CartService.removeFromCart:', productId);
        let items = this.getCartSnapshot();
        items = items.filter(item => this.extractId(item.product) !== productId);
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

    getQuantity(product: any): number {
        const productId = this.extractId(product);
        if (!productId) return 0;
        const item = this.getCartSnapshot().find(i => this.extractId(i.product) === productId);
        return item ? item.quantity : 0;
    }

    getTotal(): number {
        return this.getCartSnapshot().reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    }

    clearCart() {
        localStorage.removeItem(this.cartKey);
        this.cartItems.next([]);
    }
}
