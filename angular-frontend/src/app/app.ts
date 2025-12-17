import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';

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
