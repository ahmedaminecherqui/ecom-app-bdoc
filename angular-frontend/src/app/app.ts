import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { CustomerService } from './services/customer.service';
import { AuthService } from './services/auth.service';
import { ChatbotComponent } from './ui/chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive, ChatbotComponent],
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
    public authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  public toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  public async ngOnInit() {
    console.log('App Init: Starting Auth Check...');
    try {
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

        let email = this.userProfile.email;
        let adminDetected = false;
        if (email && email.toUpperCase().startsWith('ADMIN--')) {
          adminDetected = true;
          email = email.substring(7); // Remove 'ADMIN--'
          console.log('%c [RBAC] ADMIN DETECTED!', 'background: #222; color: #bada55; font-size: 20px;');
          console.log('Normalized email:', email);
        } else {
          console.log('%c [RBAC] NORMAL CUSTOMER DETECTED', 'background: #222; color: #ff0000; font-size: 20px;');
          console.log('Email:', email);
        }

        console.log('App: Setting Auth Data in AuthService...', { adminDetected, email });
        this.authService.setAuthData(this.userProfile, adminDetected, email || null);

        // Provisioning: Ensure customer exists in DB with normalized email
        if (email) {
          this.customerService.findCustomerByEmail(email).subscribe({
            next: (c) => console.log('App: Customer already exists in DB', c),
            error: (err) => {
              if (err.status === 404) {
                console.log('App: Customer not found. Provisioning new entry...');
                this.customerService.createCustomer({
                  name: `${this.userProfile?.firstName || ''} ${this.userProfile?.lastName || ''}`.trim() || this.userProfile?.username || 'New User',
                  email: email
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
      this.cdr.detectChanges();
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
