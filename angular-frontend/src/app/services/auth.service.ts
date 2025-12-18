import { Injectable, signal } from '@angular/core';
import { KeycloakProfile } from 'keycloak-js';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _isAdmin = signal(false);
    private _userProfile = signal<KeycloakProfile | null>(null);
    private _normalizedEmail = signal<string | null>(null);

    isAdmin = this._isAdmin.asReadonly();
    userProfile = this._userProfile.asReadonly();
    normalizedEmail = this._normalizedEmail.asReadonly();

    setAuthData(profile: KeycloakProfile | null, isAdmin: boolean, normalizedEmail: string | null) {
        this._userProfile.set(profile);
        this._isAdmin.set(isAdmin);
        this._normalizedEmail.set(normalizedEmail);
    }

    logout() {
        this._userProfile.set(null);
        this._isAdmin.set(false);
        this._normalizedEmail.set(null);
    }
}
