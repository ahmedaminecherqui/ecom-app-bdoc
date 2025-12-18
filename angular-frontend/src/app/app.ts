import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { CustomerService } from './services/customer.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('angular-frontend');
  public isLoggedIn = false;
  public userProfile: KeycloakProfile | null = null;
  public loading = true;
  public sidebarCollapsed = false;

  constructor(
    private readonly keycloak: KeycloakService,
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef
  ) { }

  public toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  public async ngOnInit() {
    console.log('App Init: Starting Auth Check...');
    try {
      // Race between auth check and a 3-second timeout
      const isLoggedInPromise = this.keycloak.isLoggedIn();
      const timeoutPromise = new Promise<boolean>((resolve) =>
        setTimeout(() => {
          console.warn('App Init: Auth Check Timed Out!');
          resolve(false);
        }, 3000)
      );

      this.isLoggedIn = await Promise.race([isLoggedInPromise, timeoutPromise]);
      console.log('App Init: Auth Check Result:', this.isLoggedIn);

      if (this.isLoggedIn) {
        this.userProfile = await this.keycloak.loadUserProfile();
        console.log('App Init: User Profile Loaded', this.userProfile);

        // Provisioning: Ensure customer exists in DB
        if (this.userProfile && this.userProfile.email) {
          this.customerService.findCustomerByEmail(this.userProfile.email).subscribe({
            next: (c) => console.log('App: Customer already exists in DB', c),
            error: (err) => {
              // If 404, the search returned no result (Data REST search returns 404 if not found)
              if (err.status === 404) {
                console.log('App: Customer not found. Provisioning new entry...');
                this.customerService.createCustomer({
                  name: `${this.userProfile?.firstName || ''} ${this.userProfile?.lastName || ''}`.trim() || this.userProfile?.username || 'New User',
                  email: this.userProfile?.email
                }).subscribe({
                  next: (res) => console.log('App: Provisioning successful', res),
                  error: (pErr) => console.error('App: Provisioning failed', pErr)
                });
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('App Init: Auth Check Failed', error);
    } finally {
      this.loading = false;
      console.log('App Init: Loading set to false');
      this.cdr.detectChanges(); // Force UI update
    }
  }

  public login() {
    this.keycloak.login({
      redirectUri: window.location.origin + '/products'
    });
  }

  public register() {
    this.keycloak.register({
      redirectUri: window.location.origin + '/products'
    });
  }

  public logout() {
    this.keycloak.logout();
  }
}
