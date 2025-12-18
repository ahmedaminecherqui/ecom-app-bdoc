import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Bill } from '../../models/bill.model';
import { BillingService } from '../../services/billing.service';
import { KeycloakService } from 'keycloak-angular';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-bills',
  imports: [CommonModule],
  templateUrl: './bills.html',
  styleUrl: './bills.css'
})
export class BillsComponent implements OnInit {
  bills: Bill[] = [];
  selectedBill: Bill | null = null;
  loading: boolean = true;

  constructor(
    private billingService: BillingService,
    private keycloakService: KeycloakService,
    private customerService: CustomerService
  ) { }

  async ngOnInit(): Promise<void> {
    console.log('BillsComponent: Fetching user identity...');
    try {
      const profile = await this.keycloakService.loadUserProfile();
      const userEmail = profile.email;

      if (!userEmail) {
        console.error('BillsComponent: Email missing in user profile');
        this.loading = false;
        return;
      }

      console.log('BillsComponent: Looking up customer for email:', userEmail);
      this.customerService.findCustomerByEmail(userEmail).subscribe({
        next: (customer) => {
          console.log('BillsComponent: Found customer ID:', customer.id);
          this.loadCustomerBills(customer.id);
        },
        error: (err) => {
          console.error('BillsComponent: Customer not found. Defaulting to show no bills.', err);
          this.loading = false;
        }
      });
    } catch (err) {
      console.error('BillsComponent: Failed to load user profile', err);
      this.loading = false;
    }
  }

  private loadCustomerBills(customerId: number) {
    this.billingService.getBillsByCustomer(customerId).subscribe({
      next: (data: any) => {
        console.log('BillsComponent: Received data from server:', data);

        if (Array.isArray(data)) {
          this.bills = data;
        } else if (data._embedded && data._embedded.bills) {
          this.bills = data._embedded.bills;
        } else {
          console.warn('BillsComponent: Unexpected data format!', data);
          this.bills = [];
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('BillsComponent: Error fetching bills!', err);
        this.bills = [];
        this.loading = false;
      }
    });
  }

  viewDetails(bill: Bill) {
    this.selectedBill = this.selectedBill === bill ? null : bill;
  }
}
