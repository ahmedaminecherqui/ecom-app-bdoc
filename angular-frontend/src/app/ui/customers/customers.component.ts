import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Customer } from '../../models/customer.model';
import { CustomerService } from '../../services/customer.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-customers',
  imports: [CommonModule, FormsModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css'
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  loading = true;

  // Admin form state
  showForm = false;
  editingCustomer: Partial<Customer> | null = null;

  constructor(
    private customerService: CustomerService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers() {
    this.loading = true;
    this.customerService.getAllCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching customers', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Admin Actions
  toggleAddForm() {
    this.editingCustomer = { name: '', email: '' };
    this.showForm = !this.showForm;
    this.cdr.detectChanges();
  }

  editCustomer(customer: Customer) {
    this.editingCustomer = { ...customer };
    this.showForm = true;
    this.cdr.detectChanges();
  }

  deleteCustomer(customer: Customer) {
    if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
      this.customerService.deleteCustomer(customer.id).subscribe({
        next: () => this.loadCustomers(),
        error: (err) => console.error('Delete failed', err)
      });
    }
  }

  saveCustomer() {
    if (!this.editingCustomer || !this.editingCustomer.name || !this.editingCustomer.email) return;

    if (this.editingCustomer.id) {
      this.customerService.updateCustomer(this.editingCustomer.id, this.editingCustomer).subscribe({
        next: () => {
          this.showForm = false;
          this.loadCustomers();
        }
      });
    } else {
      this.customerService.createCustomer(this.editingCustomer).subscribe({
        next: () => {
          this.showForm = false;
          this.loadCustomers();
        }
      });
    }
  }

  cancelEdit() {
    this.showForm = false;
    this.editingCustomer = null;
    this.cdr.detectChanges();
  }

  viewCustomerBills(customer: Customer) {
    this.router.navigate(['/bills'], { queryParams: { customerId: customer.id } });
  }
}
