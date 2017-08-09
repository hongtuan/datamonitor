import { Injectable }       from '@angular/core';
import {
  CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
}                           from '@angular/router';
import { AuthService }      from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;
    //console.log('url=',url);

    return this.checkLogin(url) && this.checkAuth(url);
  }

  checkLogin(url: string): boolean {
    if (this.authService.isLoggedIn) { return true; }

    // Store the attempted URL for redirecting
    this.authService.redirectUrl = url;

    // Navigate to the login page with extras
    this.router.navigate(['/login']);
    return false;
  }
  
  checkAuth(url: string):boolean {
    var role = this.authService.getUserInfo().role;
    var tmpA = url.split('/');
    var res = tmpA[tmpA.length-1];    
    //console.log(role,res);
    return this.authService.isAuthorized(role,res);
  }
}
