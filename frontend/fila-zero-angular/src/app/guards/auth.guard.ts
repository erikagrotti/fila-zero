import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    }
    
    this.router.navigate(['/login']);
    return false;
  }
  
  canActivateLogin(): boolean {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
      return false;
    }
    
    return true;
  }
}

export const authGuard: CanActivateFn = () => {
  return inject(AuthGuardService).canActivate();
};

export const loginGuard: CanActivateFn = () => {
  return inject(AuthGuardService).canActivateLogin();
};