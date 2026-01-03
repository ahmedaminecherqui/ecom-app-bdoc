import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Bill } from '../../models/bill.model';
import { BillingService } from '../../services/billing.service';
import { KeycloakService } from 'keycloak-angular';
import { CustomerService } from '../../services/customer.service';
import { AuthService } from '../../services/auth.service';

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
    private customerService: CustomerService,
    private authService: AuthService,
    public route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(params => {
      const isAdmin = this.authService.isAdmin();
      const normalizedEmail = this.authService.normalizedEmail();
      const queryCustomerId = params['customerId'];

      console.log('BillsComponent: Auth state change', { isAdmin, normalizedEmail, queryCustomerId });

      this.loading = true;

      if (isAdmin) {
        if (queryCustomerId) {
          console.log(`BillsComponent: Admin viewing bills for customer ${queryCustomerId}`);
          this.loadCustomerBills(parseInt(queryCustomerId));
        } else {
          console.log('BillsComponent: Admin detected. Fetching all bills...');
          this.loadAllBills();
        }
        return;
      }

      if (!normalizedEmail) {
        console.error('BillsComponent: Email missing in user profile');
        this.loading = false;
        this.cdr.detectChanges();
        return;
      }

      console.log('BillsComponent: Looking up customer for email:', normalizedEmail);
      this.customerService.findCustomerByEmail(normalizedEmail).subscribe({
        next: (customer) => {
          console.log('BillsComponent: Found customer ID:', customer.id);
          this.loadCustomerBills(customer.id);
        },
        error: (err) => {
          console.error('BillsComponent: Customer not found.', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    });
  }

  private loadAllBills() {
    this.billingService.getAllBills().subscribe({
      next: (data: any) => {
        this.processBillsData(data);
      },
      error: (err) => {
        console.error('BillsComponent: Error fetching all bills!', err);
        this.bills = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadCustomerBills(customerId: number) {
    this.billingService.getBillsByCustomer(customerId).subscribe({
      next: (data: any) => {
        this.processBillsData(data);
      },
      error: (err) => {
        console.error('BillsComponent: Error fetching customer bills!', err);
        this.bills = [];
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private processBillsData(data: any) {
    console.log('BillsComponent: Processing data:', data);
    if (Array.isArray(data)) {
      this.bills = data;
    } else if (data._embedded && data._embedded.bills) {
      this.bills = data._embedded.bills;
    } else {
      console.warn('BillsComponent: Unexpected data format!', data);
      this.bills = [];
    }
    this.loading = false;
    this.cdr.detectChanges();
  }

  viewDetails(bill: Bill) {
    this.selectedBill = this.selectedBill === bill ? null : bill;
  }
}
