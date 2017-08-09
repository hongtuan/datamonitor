import { Component, OnInit, OnDestroy } from '@angular/core';
import { Routes, Router} from '@angular/router';
import { Subscription }           from 'rxjs/Subscription';

import { BaMenuService } from '../theme';
import { PAGES_MENU } from './pages.menu';

import { AuthService }    from '../services/auth.service';

@Component({
  selector: 'pages',
  template: `
    <ba-sidebar [loginStatus]="loginStatus" [isRoot]="isRoot"></ba-sidebar>
    <ba-page-top [loginStatus]="loginStatus"></ba-page-top>
    <div class="al-main">
      <div class="al-content">
        <ba-content-top></ba-content-top>
        <router-outlet></router-outlet>
      </div>
    </div>
    <ba-back-top position="200"></ba-back-top>
    `
})
export class Pages  implements OnInit, OnDestroy {
  subscription: Subscription;
  loginStatus:string;
  
  isLogin:boolean = false;
  userName:string = '';
  isRoot:boolean = false;

  constructor(private _menuService: BaMenuService,
    private router: Router,private authService:AuthService) {
    //console.log('Pages:constructor called.');    
  }

  ngOnInit() {
    this._menuService.updateMenuByRoutes(<Routes>PAGES_MENU);    
    this.loginStatus = this.authService.getLoginStatus();
    //console.log('Pages:ngOnInit()','loginStatus=',this.loginStatus);
    if(this.loginStatus == this.authService.hasLogIn){
      this.isLogin = true;
      var userInfo = this.authService.getUserInfo();
      this.userName = userInfo.name;
      this.isRoot = userInfo.role == 'root';
    }
    this.subscription = this.authService.logInStatusAnnounced$.subscribe(
      logInStatus => {
        //console.log('!!logInStatus=',logInStatus);
        /*
        if(logInStatus === this.authService.hasLogIn){
          this.isLogin = true;
          var userInfo = this.authService.getUserInfo();
          this.userName = userInfo.name;
          this.isRoot = userInfo.role == 'root';
          let link = ['/pages/location'];
          //console.log('get userInfo in AppComponent:'+
          //  JSON.stringify(this.authService.getUserInfo(),null,2));
          this.router.navigate(link);
        }//*/
       
        if(logInStatus === this.authService.hasLogOut){
          this.isLogin = false;
          this.isRoot = false;
          let link = ['/login'];
          this.router.navigate(link);
        }
    });
    //console.log('Pages:ngOnInit called.');
  }
  
  ngOnDestroy() {
    // prevent memory leak when component destroyed
    this.subscription.unsubscribe();
  } 
}
