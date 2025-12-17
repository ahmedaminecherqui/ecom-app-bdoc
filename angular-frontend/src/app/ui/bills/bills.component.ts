import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Bill } from '../../models/bill.model';
import { BillingService } from '../../services/billing.service';

@Component({
  selector: 'app-bills',
  imports: [CommonModule],
  templateUrl: './bills.html',
  styleUrl: './bills.css'
})
export class BillsComponent implements OnInit {
  bills: Bill[] = [];
  selectedBill: Bill | null = null;

  constructor(private billingService: BillingService) { }

  ngOnInit(): void {
    this.billingService.getAllBills().subscribe({
      next: (data) => {
        this.bills = data;
      },
      error: (err) => {
        console.error('Error fetching bills', err);
      }
    });
  }

  viewDetails(bill: Bill) {
    this.selectedBill = this.selectedBill === bill ? null : bill;
  }
}
