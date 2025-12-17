import { Routes } from '@angular/router';
import { ProductsComponent } from './ui/products/products.component';
import { CustomersComponent } from './ui/customers/customers.component';
import { BillsComponent } from './ui/bills/bills.component';
import { CartComponent } from './ui/cart/cart.component';

export const routes: Routes = [
    { path: 'products', component: ProductsComponent },
    { path: 'customers', component: CustomersComponent },
    { path: 'bills', component: BillsComponent },
    { path: 'cart', component: CartComponent }
];
